import { PerfilUsuario, Usuario } from '@prisma/client';

export type UsuarioAutenticado = Pick<
  Usuario,
  'id' | 'email' | 'nome' | 'perfil' | 'ativo' | 'docenteId'
>;

export { PerfilUsuario };
