import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestAutenticada } from './supabase-auth.guard';
import { PerfilUsuario } from './auth.types';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const perfis = this.reflector.getAllAndOverride<PerfilUsuario[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!perfis?.length) return true;

    const { usuario } = context.switchToHttp().getRequest<RequestAutenticada>();
    if (!usuario || !perfis.includes(usuario.perfil)) {
      throw new ForbiddenException('Seu perfil não possui acesso a este recurso.');
    }

    return true;
  }
}
