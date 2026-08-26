import { PerfilUsuario, Usuario } from '@prisma/client';

export type AuthenticatedUser = Pick<
  Usuario,
  'id' | 'email' | 'nome' | 'perfil' | 'ativo' | 'docenteId' | 'programaId'
>;

export { PerfilUsuario as UserRole };
