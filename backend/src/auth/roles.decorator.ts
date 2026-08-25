import { SetMetadata } from '@nestjs/common';
import { PerfilUsuario } from './auth.types';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: PerfilUsuario[]) => SetMetadata(ROLES_KEY, roles);
