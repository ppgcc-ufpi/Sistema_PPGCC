import 'dotenv/config';
import { PerfilUsuario, PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const required = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Defina ${name} no .env antes de criar a conta docente.`);
  return value;
};

async function run() {
  const programId = process.env.DEFAULT_PROGRAM_ID?.trim() || required('PROGRAM_ID');
  const externalId = required('FACULTY_EXTERNAL_ID');
  const email = required('FACULTY_EMAIL').toLowerCase();
  const password = required('FACULTY_PASSWORD');
  const name = process.env.FACULTY_NAME?.trim() || undefined;

  if (password.length < 12) {
    throw new Error('FACULTY_PASSWORD deve ter pelo menos 12 caracteres.');
  }

  const faculty = await prisma.docente.findUnique({
    where: { programaId_idExterno: { programaId: programId, idExterno: externalId } },
  });
  if (!faculty) {
    throw new Error('Docente não encontrado. Importe os dados do pipeline e confira o identificador.');
  }

  const [userWithEmail, userWithFaculty] = await Promise.all([
    prisma.usuario.findUnique({ where: { email } }),
    prisma.usuario.findUnique({ where: { docenteId: faculty.id } }),
  ]);

  if (userWithEmail && userWithEmail.docenteId !== faculty.id) {
    throw new Error('O e-mail informado já pertence a outra conta.');
  }
  if (userWithFaculty && userWithFaculty.email !== email) {
    throw new Error('Este docente já está vinculado a outro e-mail.');
  }

  const passwordHash = await hash(password, 12);
  if (userWithEmail) {
    await prisma.usuario.update({
      where: { id: userWithEmail.id },
      data: {
        programaId: programId,
        nome: name || faculty.nome,
        senhaHash: passwordHash,
        perfil: PerfilUsuario.DOCENTE,
        docenteId: faculty.id,
        ativo: true,
      },
    });
  } else {
    await prisma.usuario.create({
      data: {
        programaId: programId,
        email,
        nome: name || faculty.nome,
        senhaHash: passwordHash,
        perfil: PerfilUsuario.DOCENTE,
        docenteId: faculty.id,
      },
    });
  }

  console.info('Conta docente vinculada ao registro importado com sucesso.');
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
