import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  sanitizeFaculty,
  sanitizeEducation,
  sanitizeAdvising,
  sanitizeProduction,
  sanitizeProject,
} from '../src/public/public-data.mapper';
import { applyChanges } from '../src/corrections/effective-data';

const prisma = new PrismaClient();
const outputDir = resolve(process.cwd(), process.env.STATIC_FALLBACK_DIR ?? '../frontend/public/dados');
const programaId = process.env.DEFAULT_PROGRAM_ID ?? process.env.PROGRAM_ID ?? 'ppgcc-ufpi';

async function efetivos(tipoEntidade: 'DOCENTE' | 'FORMACAO' | 'PRODUCAO' | 'ORIENTACAO' | 'PROJETO', registros: { idExterno: string; dadosOriginais: unknown }[]) {
  const correcoes = await prisma.correcaoAprovada.findMany({
    where: { programaId, tipoEntidade, ativa: true }, orderBy: { aprovadaEm: 'asc' },
  });
  return registros.map((registro) => correcoes
    .filter((c) => c.registroIdExterno === registro.idExterno)
    .reduce((dados, c) => applyChanges(dados, c.alteracoes), applyChanges(registro.dadosOriginais, {})));
}

async function escrever(nome: string, dados: unknown) {
  await writeFile(resolve(outputDir, nome), `${JSON.stringify(dados, null, 2)}\n`, 'utf8');
}

async function exportar() {
  await mkdir(outputDir, { recursive: true });
  const [docentes, producoes, orientacoes, projetos, formacoes, importacao] = await Promise.all([
    prisma.docente.findMany({ where: { programaId }, orderBy: { nomeNormalizado: 'asc' } }),
    prisma.producao.findMany({
      where: { programaId, elegivelPublico: true, ocultaCoordenacao: false },
      orderBy: [{ ano: 'desc' }, { titulo: 'asc' }],
    }),
    prisma.orientacao.findMany({
      where: { programaId, elegivelPublico: true, ocultaCoordenacao: false },
      orderBy: [{ ano: 'desc' }, { orientando: 'asc' }],
    }),
    prisma.projeto.findMany({
      where: { programaId, elegivelPublico: true, ocultaCoordenacao: false },
      orderBy: [{ anoInicio: 'desc' }, { titulo: 'asc' }],
    }),
    prisma.formacao.findMany({ where: { programaId }, orderBy: [{ docenteId: 'asc' }, { anoConclusao: 'desc' }] }),
    prisma.importacao.findFirst({ where: { programaId, status: 'CONCLUIDA' }, orderBy: { concluidaEm: 'desc' } }),
  ]);
  const [docentesEfetivos, producoesEfetivas, orientacoesEfetivas, projetosEfetivos, formacoesEfetivas] = await Promise.all([
    efetivos('DOCENTE', docentes), efetivos('PRODUCAO', producoes), efetivos('ORIENTACAO', orientacoes),
    efetivos('PROJETO', projetos), efetivos('FORMACAO', formacoes),
  ]);

  await Promise.all([
    escrever('docentes.json', docentesEfetivos.map(sanitizeFaculty)),
    escrever('producoes.json', producoesEfetivas.map(sanitizeProduction)),
    escrever('orientacoes.json', orientacoesEfetivas.map(sanitizeAdvising)),
    escrever('projetos.json', projetosEfetivos.map(sanitizeProject)),
    escrever('formacoes.json', formacoesEfetivas.map(sanitizeEducation)),
    escrever('metadados.json', {
      gerado_em: new Date().toISOString(),
      ultima_importacao: importacao?.concluidaEm?.toISOString() ?? null,
      escopo: 'publico',
      programa_id: programaId,
      schema_origem: importacao?.schemaVersao ?? null,
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
