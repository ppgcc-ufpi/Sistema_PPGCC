import 'dotenv/config';
import { PerfilUsuario, PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const obrigatoria = (nome: string) => {
  const valor = process.env[nome]?.trim();
  if (!valor) throw new Error(`Defina ${nome} no .env antes de criar a coordenação.`);
  return valor;
};

async function executar() {
  const programaId = obrigatoria('PROGRAM_ID');
  const email = obrigatoria('ADMIN_EMAIL').toLowerCase();
  const senha = obrigatoria('ADMIN_PASSWORD');
  if (senha.length < 12) throw new Error('ADMIN_PASSWORD deve ter pelo menos 12 caracteres.');

  await prisma.programa.upsert({
    where: { id: programaId },
    create: {
      id: programaId,
      nome: obrigatoria('PROGRAM_NAME'),
      sigla: obrigatoria('PROGRAM_ACRONYM'),
    },
    update: {
      nome: obrigatoria('PROGRAM_NAME'),
      sigla: obrigatoria('PROGRAM_ACRONYM'),
    },
  });

  await prisma.usuario.upsert({
    where: { email },
    create: {
      programaId,
      email,
      nome: process.env.ADMIN_NAME?.trim() || 'Coordenação',
      senhaHash: await hash(senha, 12),
      perfil: PerfilUsuario.COORDENACAO,
    },
    update: {
      programaId,
      nome: process.env.ADMIN_NAME?.trim() || 'Coordenação',
      senhaHash: await hash(senha, 12),
      perfil: PerfilUsuario.COORDENACAO,
      ativo: true,
    },
  });
  console.info('Conta inicial de coordenação preparada com sucesso.');
}

executar()
  .catch((erro) => { console.error(erro); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
