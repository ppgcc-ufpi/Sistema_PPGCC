import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';
import { UsuarioAutenticado } from './auth.types';

@Injectable()
export class SupabaseAuthService {
  private readonly supabase: SupabaseClient;

  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.supabase = createClient(
      config.getOrThrow<string>('SUPABASE_URL'),
      config.getOrThrow<string>('SUPABASE_ANON_KEY'),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }

  async authenticate(accessToken: string): Promise<UsuarioAutenticado> {
    const { data, error } = await this.supabase.auth.getUser(accessToken);
    if (error || !data.user?.email) {
      throw new UnauthorizedException('Token do Supabase inválido ou expirado.');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: data.user.id },
      select: {
        id: true,
        email: true,
        nome: true,
        perfil: true,
        ativo: true,
        docenteId: true,
      },
    });

    if (!usuario?.ativo) {
      throw new UnauthorizedException('Usuário não cadastrado ou inativo no sistema.');
    }

    return usuario;
  }
}
