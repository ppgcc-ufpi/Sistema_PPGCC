import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const prisma = new PrismaClient();
const outputDir = resolve(process.cwd(), process.env.STATIC_FALLBACK_DIR ?? '../public/dados');

async function escrever(nome: string, dados: unknown) {
  await writeFile(resolve(outputDir, nome), `${JSON.stringify(dados, null, 2)}\n`, 'utf8');
}

async function exportar() {
  await mkdir(outputDir, { recursive: true });
  const [docentes, producoes, orientacoes, projetos, formacoes, importacao] = await Promise.all([
    prisma.docente.findMany({ orderBy: { nomeNormalizado: 'asc' } }),
    prisma.producao.findMany({ orderBy: [{ ano: 'desc' }, { titulo: 'asc' }] }),
    prisma.orientacao.findMany({ orderBy: [{ ano: 'desc' }, { orientando: 'asc' }] }),
    prisma.projeto.findMany({ orderBy: [{ anoInicio: 'desc' }, { titulo: 'asc' }] }),
    prisma.formacao.findMany({ orderBy: [{ docenteId: 'asc' }, { anoConclusao: 'desc' }] }),
    prisma.importacao.findFirst({ where: { status: 'CONCLUIDA' }, orderBy: { concluidaEm: 'desc' } }),
  ]);

  await Promise.all([
    escrever('docentes.json', docentes.map((item) => item.dados)),
    escrever('producoes.json', producoes.map((item) => item.dados)),
    escrever('orientacoes.json', orientacoes.map((item) => item.dados)),
    escrever('projetos.json', projetos.map((item) => item.dados)),
    escrever('formacoes.json', formacoes.map((item) => item.dados)),
    escrever('metadados.json', {
      gerado_em: new Date().toISOString(),
      ultima_importacao: importacao?.concluidaEm?.toISOString() ?? null,
      contagens: {
        docentes: docentes.length,
        producoes: producoes.length,
        orientacoes: orientacoes.length,
        projetos: projetos.length,
        formacoes: formacoes.length,
      },
    }),
  ]);

  console.info(`Snapshot exportado para ${outputDir}`);
}

exportar()
  .catch((erro) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
