import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const prisma = new PrismaClient();
const outputFile = resolve(
  process.cwd(),
  process.env.CORRECTIONS_EXPORT_FILE ?? './exports/approved-corrections.json',
);
const programId = process.env.DEFAULT_PROGRAM_ID ?? 'ppgcc-ufpi';

async function run() {
  const corrections = await prisma.correcaoAprovada.findMany({
    where: { programaId: programId, ativa: true },
    include: {
      sugestao: { select: { justificativa: true } },
    },
    orderBy: { aprovadaEm: 'asc' },
  });

  const artifact = {
    schema_version: '1.0',
    program_id: programId,
    generated_at: new Date().toISOString(),
    corrections: corrections.map((correction) => ({
      entity_type: correction.tipoEntidade,
      external_record_id: correction.registroIdExterno,
      changes: correction.alteracoes,
      justification: correction.sugestao.justificativa,
      approved_at: correction.aprovadaEm.toISOString(),
    })),
  };

  await mkdir(dirname(outputFile), { recursive: true });
  await writeFile(outputFile, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
  console.info(`Approved corrections exported: ${corrections.length}.`);
}

run()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
