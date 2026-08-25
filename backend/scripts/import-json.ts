import 'dotenv/config';
import { Prisma, PrismaClient, StatusImportacao } from '@prisma/client';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

type JsonObject = Record<string, unknown>;

const prisma = new PrismaClient();
const sourceDir = resolve(process.cwd(), process.env.DATA_SOURCE_DIR ?? '../frontend/src/data');

async function lerJson(nome: string): Promise<JsonObject[]> {
  const conteudo = await readFile(resolve(sourceDir, nome), 'utf8');
  const dados: unknown = JSON.parse(conteudo);
  if (!Array.isArray(dados)) throw new Error(`${nome} não contém um array JSON.`);
  return dados as JsonObject[];
}

const texto = (item: JsonObject, campo: string) => String(item[campo] ?? '');
const numero = (item: JsonObject, campo: string) => {
  const valor = item[campo];
  return typeof valor === 'number' && Number.isFinite(valor) ? valor : null;
};
const json = (item: JsonObject) => item as Prisma.InputJsonValue;
const idsDocentes = (item: JsonObject) =>
  Array.isArray(item.docente_ids) ? item.docente_ids.filter((id): id is string => typeof id === 'string') : [];
const deveIntegrar = (item: JsonObject) => {
  const vinculo = item.vinculo_programa as JsonObject | undefined;
  return vinculo?.integrar === true;
};

async function importar() {
  const registro = await prisma.importacao.create({
    data: { origem: sourceDir, status: StatusImportacao.INICIADA },
  });

  try {
    const [docentes, producoes, orientacoes, projetos, formacoes] = await Promise.all([
      lerJson('docentes.json'),
      lerJson('producoes.json'),
      lerJson('orientacoes.json'),
      lerJson('projetos.json'),
      lerJson('formacoes.json'),
    ]);

    for (const item of docentes) {
      const id = texto(item, 'id_docente');
      await prisma.docente.upsert({
        where: { id },
        create: {
          id,
          nome: texto(item, 'nome'),
          nomeNormalizado: texto(item, 'nome_normalizado'),
          dados: json(item),
        },
        update: {
          nome: texto(item, 'nome'),
          nomeNormalizado: texto(item, 'nome_normalizado'),
          dados: json(item),
        },
      });
    }

    for (const item of producoes) {
      const id = texto(item, 'id_producao');
      const data = {
        titulo: texto(item, 'titulo'),
        ano: numero(item, 'ano'),
        natureza: texto(item, 'natureza') || null,
        integravel: deveIntegrar(item),
        dados: json(item),
      };
      await prisma.producao.upsert({ where: { id }, create: { id, ...data }, update: data });
    }

    for (const item of orientacoes) {
      const id = texto(item, 'id_orientacao');
      const situacao = texto(item, 'situacao_normalizada');
      const data = {
        orientando: texto(item, 'orientando'),
        ano: numero(item, 'ano'),
        nivel: texto(item, 'nivel_normalizado') || null,
        situacao: situacao || null,
        integravel: deveIntegrar(item) && ['em_andamento', 'concluido'].includes(situacao),
        dados: json(item),
      };
      await prisma.orientacao.upsert({ where: { id }, create: { id, ...data }, update: data });
    }

    for (const item of projetos) {
      const id = texto(item, 'id_projeto');
      const data = {
        titulo: texto(item, 'titulo'),
        anoInicio: numero(item, 'ano_inicio'),
        anoConclusao: numero(item, 'ano_conclusao'),
        situacao: texto(item, 'situacao_normalizada') || null,
        integravel: deveIntegrar(item),
        dados: json(item),
      };
      await prisma.projeto.upsert({ where: { id }, create: { id, ...data }, update: data });
    }

    for (const item of formacoes) {
      const id = texto(item, 'id_formacao');
      const data = {
        docenteId: texto(item, 'id_docente'),
        nivel: texto(item, 'nivel') || null,
        instituicao: texto(item, 'instituicao') || null,
        anoInicio: numero(item, 'ano_inicio'),
        anoConclusao: numero(item, 'ano_conclusao'),
        dados: json(item),
      };
      await prisma.formacao.upsert({ where: { id }, create: { id, ...data }, update: data });
    }

    await prisma.$transaction([
      prisma.producaoDocente.deleteMany(),
      prisma.orientacaoDocente.deleteMany(),
      prisma.projetoDocente.deleteMany(),
    ]);

    await prisma.producaoDocente.createMany({
      data: producoes.flatMap((item) =>
        idsDocentes(item).map((docenteId) => ({ producaoId: texto(item, 'id_producao'), docenteId })),
      ),
      skipDuplicates: true,
    });
    await prisma.orientacaoDocente.createMany({
      data: orientacoes.flatMap((item) =>
        idsDocentes(item).map((docenteId) => ({ orientacaoId: texto(item, 'id_orientacao'), docenteId })),
      ),
      skipDuplicates: true,
    });
    await prisma.projetoDocente.createMany({
      data: projetos.flatMap((item) =>
        idsDocentes(item).map((docenteId) => ({ projetoId: texto(item, 'id_projeto'), docenteId })),
      ),
      skipDuplicates: true,
    });

    const contagens = {
      docentes: docentes.length,
      producoes: producoes.length,
      orientacoes: orientacoes.length,
      projetos: projetos.length,
      formacoes: formacoes.length,
    };
    await prisma.importacao.update({
      where: { id: registro.id },
      data: {
        status: StatusImportacao.CONCLUIDA,
        contagens,
        concluidaEm: new Date(),
      },
    });
    console.info('Importação concluída:', contagens);
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : String(erro);
    await prisma.importacao.update({
      where: { id: registro.id },
      data: { status: StatusImportacao.FALHOU, erro: mensagem, concluidaEm: new Date() },
    });
    throw erro;
  }
}

importar()
  .catch((erro) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
