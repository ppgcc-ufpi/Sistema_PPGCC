import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { SupabaseAuthService } from './supabase-auth.service';
import { UsuarioAutenticado } from './auth.types';

export interface RequestAutenticada extends Request {
  usuario: UsuarioAutenticado;
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly auth: SupabaseAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestAutenticada>();
    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];

    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Envie o token em Authorization: Bearer <token>.');
    }

    request.usuario = await this.auth.authenticate(token);
    return true;
  }
}
