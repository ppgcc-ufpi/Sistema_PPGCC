import 'dotenv/config';
import { Prisma, PrismaClient, StatusImportacao } from '@prisma/client';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

type Objeto = Record<string, unknown>;
type Escopo = { disponivel: boolean; exibir_por_padrao: boolean; permite_ocultar?: boolean };
const prisma = new PrismaClient();
const origem = resolve(process.cwd(), process.env.DATA_SOURCE_DIR ?? '../frontend/src/data');
const SCHEMAS_SUPORTADOS = new Set(['3.8']);

const objeto = (v: unknown): v is Objeto => v !== null && typeof v === 'object' && !Array.isArray(v);
const texto = (i: Objeto, c: string) => typeof i[c] === 'string' ? i[c] : '';
const numero = (i: Objeto, c: string) => typeof i[c] === 'number' && Number.isFinite(i[c]) ? i[c] : null;
const json = (i: unknown) => i as Prisma.InputJsonValue;
const ids = (i: Objeto, campo = 'docente_ids') => Array.isArray(i[campo]) ? i[campo].filter((v): v is string => typeof v === 'string') : [];

async function ler(nome: string): Promise<unknown> {
  return JSON.parse(await readFile(resolve(origem, nome), 'utf8')) as unknown;
}
async function lista(nome: string): Promise<Objeto[]> {
  const valor = await ler(nome);
  if (!Array.isArray(valor) || !valor.every(objeto)) throw new Error(`${nome} deve conter um array de objetos.`);
  return valor;
}
const escopo = (item: Objeto, perfil: 'coordenacao' | 'docente' | 'publico'): Escopo => {
  const raiz = objeto(item.escopo_visualizacao) ? item.escopo_visualizacao : {};
  const valor = objeto(raiz[perfil]) ? raiz[perfil] : {};
  return {
    disponivel: valor.disponivel === true,
    exibir_por_padrao: valor.exibir_por_padrao === true,
    permite_ocultar: valor.permite_ocultar === true,
  };
};
const idsVisiveis = (item: Objeto) => {
  const raiz = objeto(item.escopo_visualizacao) ? item.escopo_visualizacao : {};
  const docente = objeto(raiz.docente) ? raiz.docente : {};
  return ids(docente, 'docente_ids_visiveis');
};
function validarIds(nome: string, itens: Objeto[], campo: string) {
  const valores = itens.map((item) => texto(item, campo));
  if (valores.some((id) => !id)) throw new Error(`${nome}: há registros sem ${campo}.`);
  if (new Set(valores).size !== valores.length) throw new Error(`${nome}: ${campo} duplicado.`);
}

async function executar() {
  const registro = await prisma.importacao.create({ data: { origem, status: StatusImportacao.INICIADA } });
  try {
    const [metaValor, docentes, formacoes, producoes, orientacoes, projetos] = await Promise.all([
      ler('metadados.json'), lista('docentes.json'), lista('formacoes.json'), lista('producoes.json'),
      lista('orientacoes.json'), lista('projetos.json'),
    ]);
    if (!objeto(metaValor) || !objeto(metaValor.programa)) throw new Error('metadados.json sem programa válido.');
    const schemaVersao = texto(metaValor, 'schema_versao');
    if (!SCHEMAS_SUPORTADOS.has(schemaVersao)) throw new Error(`Schema ${schemaVersao || '(ausente)'} não suportado. Esperado: 3.8.`);
    const programaId = texto(metaValor.programa, 'id');
    if (!programaId) throw new Error('metadados.programa.id é obrigatório.');
    validarIds('docentes', docentes, 'id_docente'); validarIds('formacoes', formacoes, 'id_formacao');
    validarIds('producoes', producoes, 'id_producao'); validarIds('orientacoes', orientacoes, 'id_orientacao');
    validarIds('projetos', projetos, 'id_projeto');
    const docentesExternos = new Set(docentes.map((i) => texto(i, 'id_docente')));
    for (const item of [...formacoes, ...producoes, ...orientacoes, ...projetos]) {
      const referencias = 'id_docente' in item ? [texto(item, 'id_docente')] : ids(item);
      if (referencias.some((id) => !docentesExternos.has(id))) throw new Error('Há referência para docente inexistente no artefato.');
    }

    await prisma.$transaction(async (tx) => {
      await tx.programa.upsert({ where: { id: programaId }, create: {
        id: programaId, nome: texto(metaValor.programa as Objeto, 'nome'), sigla: texto(metaValor.programa as Objeto, 'sigla'),
      }, update: { nome: texto(metaValor.programa as Objeto, 'nome'), sigla: texto(metaValor.programa as Objeto, 'sigla') } });

      for (const item of docentes) await tx.docente.upsert({
        where: { programaId_idExterno: { programaId, idExterno: texto(item, 'id_docente') } },
        create: { programaId, idExterno: texto(item, 'id_docente'), nome: texto(item, 'nome'), nomeNormalizado: texto(item, 'nome_normalizado'), anoIngresso: numero(item, 'ano_ingresso_programa'), dadosOriginais: json(item) },
        update: { nome: texto(item, 'nome'), nomeNormalizado: texto(item, 'nome_normalizado'), anoIngresso: numero(item, 'ano_ingresso_programa'), dadosOriginais: json(item) },
      });
      const docentesDb = await tx.docente.findMany({ where: { programaId } });
      const docentePorExterno = new Map(docentesDb.map((d) => [d.idExterno, d.id]));

      for (const item of producoes) {
        const c = escopo(item, 'coordenacao'), p = escopo(item, 'publico');
        await tx.producao.upsert({ where: { programaId_idExterno: { programaId, idExterno: texto(item, 'id_producao') } },
          create: { programaId, idExterno: texto(item, 'id_producao'), titulo: texto(item, 'titulo'), ano: numero(item, 'ano'), natureza: texto(item, 'natureza') || null, elegivelCoordenacao: c.disponivel, elegivelPublico: p.disponivel, exibirPorPadraoCoordenacao: c.exibir_por_padrao, exibirPorPadraoPublico: p.exibir_por_padrao, permiteOcultarCoordenacao: c.permite_ocultar, dadosOriginais: json(item) },
          update: { titulo: texto(item, 'titulo'), ano: numero(item, 'ano'), natureza: texto(item, 'natureza') || null, elegivelCoordenacao: c.disponivel, elegivelPublico: p.disponivel, exibirPorPadraoCoordenacao: c.exibir_por_padrao, exibirPorPadraoPublico: p.exibir_por_padrao, permiteOcultarCoordenacao: c.permite_ocultar, dadosOriginais: json(item) } });
      }
      for (const item of orientacoes) {
        const c = escopo(item, 'coordenacao'), p = escopo(item, 'publico');
        await tx.orientacao.upsert({ where: { programaId_idExterno: { programaId, idExterno: texto(item, 'id_orientacao') } },
          create: { programaId, idExterno: texto(item, 'id_orientacao'), orientando: texto(item, 'orientando'), ano: numero(item, 'ano'), nivel: texto(item, 'nivel_normalizado') || null, situacao: texto(item, 'situacao_normalizada') || null, elegivelCoordenacao: c.disponivel, elegivelPublico: p.disponivel, exibirPorPadraoCoordenacao: c.exibir_por_padrao, exibirPorPadraoPublico: p.exibir_por_padrao, permiteOcultarCoordenacao: c.permite_ocultar, monitoramento: item.monitoramento_atualizacao ? json(item.monitoramento_atualizacao) : Prisma.JsonNull, dadosOriginais: json(item) },
          update: { orientando: texto(item, 'orientando'), ano: numero(item, 'ano'), nivel: texto(item, 'nivel_normalizado') || null, situacao: texto(item, 'situacao_normalizada') || null, elegivelCoordenacao: c.disponivel, elegivelPublico: p.disponivel, exibirPorPadraoCoordenacao: c.exibir_por_padrao, exibirPorPadraoPublico: p.exibir_por_padrao, permiteOcultarCoordenacao: c.permite_ocultar, monitoramento: item.monitoramento_atualizacao ? json(item.monitoramento_atualizacao) : Prisma.JsonNull, dadosOriginais: json(item) } });
      }
      for (const item of projetos) {
        const c = escopo(item, 'coordenacao'), p = escopo(item, 'publico');
        await tx.projeto.upsert({ where: { programaId_idExterno: { programaId, idExterno: texto(item, 'id_projeto') } },
          create: { programaId, idExterno: texto(item, 'id_projeto'), titulo: texto(item, 'titulo'), anoInicio: numero(item, 'ano_inicio'), anoConclusao: numero(item, 'ano_conclusao'), situacao: texto(item, 'situacao_normalizada') || null, elegivelCoordenacao: c.disponivel, elegivelPublico: p.disponivel, exibirPorPadraoCoordenacao: c.exibir_por_padrao, exibirPorPadraoPublico: p.exibir_por_padrao, permiteOcultarCoordenacao: c.permite_ocultar, dadosOriginais: json(item) },
          update: { titulo: texto(item, 'titulo'), anoInicio: numero(item, 'ano_inicio'), anoConclusao: numero(item, 'ano_conclusao'), situacao: texto(item, 'situacao_normalizada') || null, elegivelCoordenacao: c.disponivel, elegivelPublico: p.disponivel, exibirPorPadraoCoordenacao: c.exibir_por_padrao, exibirPorPadraoPublico: p.exibir_por_padrao, permiteOcultarCoordenacao: c.permite_ocultar, dadosOriginais: json(item) } });
      }

      const [prodDb, oriDb, projDb] = await Promise.all([
        tx.producao.findMany({ where: { programaId } }), tx.orientacao.findMany({ where: { programaId } }), tx.projeto.findMany({ where: { programaId } }),
      ]);
      const prodMap = new Map(prodDb.map((x) => [x.idExterno, x.id])), oriMap = new Map(oriDb.map((x) => [x.idExterno, x.id])), projMap = new Map(projDb.map((x) => [x.idExterno, x.id]));
      const ocultasProd = await tx.producaoDocente.findMany({ where: { producao: { programaId }, ocultaDocente: true }, include: { producao: true, docente: true } });
      const ocultasOri = await tx.orientacaoDocente.findMany({ where: { orientacao: { programaId }, ocultaDocente: true }, include: { orientacao: true, docente: true } });
      const ocultasProj = await tx.projetoDocente.findMany({ where: { projeto: { programaId }, ocultaDocente: true }, include: { projeto: true, docente: true } });
      const chave = (a: string, b: string) => `${a}\u0000${b}`;
      const op = new Map(ocultasProd.map((x) => [chave(x.producao.idExterno, x.docente.idExterno), x]));
      const oo = new Map(ocultasOri.map((x) => [chave(x.orientacao.idExterno, x.docente.idExterno), x]));
      const oj = new Map(ocultasProj.map((x) => [chave(x.projeto.idExterno, x.docente.idExterno), x]));
      await tx.producaoDocente.deleteMany({ where: { producao: { programaId } } });
      await tx.orientacaoDocente.deleteMany({ where: { orientacao: { programaId } } });
      await tx.projetoDocente.deleteMany({ where: { projeto: { programaId } } });

      const relacoes = (itens: Objeto[], campo: string, mapa: Map<string, string>, antigas: Map<string, { ocultaDocente: boolean; ocultadaPorId: string | null; ocultadaEm: Date | null }>) => itens.flatMap((item) => {
        const d = escopo(item, 'docente'), visiveis = new Set(idsVisiveis(item));
        return ids(item).map((externo) => { const antiga = antigas.get(chave(texto(item, campo), externo)); return {
          entidadeId: mapa.get(texto(item, campo))!, docenteId: docentePorExterno.get(externo)!, elegivelDocente: visiveis.has(externo), exibirPorPadrao: d.exibir_por_padrao, permiteOcultar: d.permite_ocultar,
          ocultaDocente: antiga?.ocultaDocente ?? false, ocultadaPorId: antiga?.ocultadaPorId ?? null, ocultadaEm: antiga?.ocultadaEm ?? null,
        }; });
      });
      await tx.producaoDocente.createMany({ data: relacoes(producoes, 'id_producao', prodMap, op).map(({ entidadeId, ...x }) => ({ producaoId: entidadeId, ...x })) });
      await tx.orientacaoDocente.createMany({ data: relacoes(orientacoes, 'id_orientacao', oriMap, oo).map(({ entidadeId, ...x }) => ({ orientacaoId: entidadeId, ...x })) });
      await tx.projetoDocente.createMany({ data: relacoes(projetos, 'id_projeto', projMap, oj).map(({ entidadeId, ...x }) => ({ projetoId: entidadeId, ...x })) });

      for (const item of formacoes) await tx.formacao.upsert({ where: { programaId_idExterno: { programaId, idExterno: texto(item, 'id_formacao') } },
        create: { programaId, idExterno: texto(item, 'id_formacao'), docenteId: docentePorExterno.get(texto(item, 'id_docente'))!, nivel: texto(item, 'nivel') || null, instituicao: texto(item, 'instituicao') || null, anoInicio: numero(item, 'ano_inicio'), anoConclusao: numero(item, 'ano_conclusao'), dadosOriginais: json(item) },
        update: { docenteId: docentePorExterno.get(texto(item, 'id_docente'))!, nivel: texto(item, 'nivel') || null, instituicao: texto(item, 'instituicao') || null, anoInicio: numero(item, 'ano_inicio'), anoConclusao: numero(item, 'ano_conclusao'), dadosOriginais: json(item) } });

      await tx.formacao.deleteMany({ where: { programaId, idExterno: { notIn: formacoes.map((i) => texto(i, 'id_formacao')) } } });
      await tx.producao.deleteMany({ where: { programaId, idExterno: { notIn: producoes.map((i) => texto(i, 'id_producao')) } } });
      await tx.orientacao.deleteMany({ where: { programaId, idExterno: { notIn: orientacoes.map((i) => texto(i, 'id_orientacao')) } } });
      await tx.projeto.deleteMany({ where: { programaId, idExterno: { notIn: projetos.map((i) => texto(i, 'id_projeto')) } } });
      await tx.docente.deleteMany({ where: { programaId, idExterno: { notIn: docentes.map((i) => texto(i, 'id_docente')) }, usuario: null } });
      await tx.importacao.update({ where: { id: registro.id }, data: { programaId, schemaVersao, metadados: json(metaValor), contagens: { docentes: docentes.length, formacoes: formacoes.length, producoes: producoes.length, orientacoes: orientacoes.length, projetos: projetos.length }, status: StatusImportacao.CONCLUIDA, concluidaEm: new Date() } });
    }, { maxWait: 30_000, timeout: 600_000 });
    console.info('Importação 3.8 concluída com sucesso.');
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : String(erro);
    await prisma.importacao.update({ where: { id: registro.id }, data: { status: StatusImportacao.FALHOU, erro: mensagem, concluidaEm: new Date() } });
    throw erro;
  }
}

executar().catch((erro) => { console.error(erro); process.exitCode = 1; }).finally(() => prisma.$disconnect());
