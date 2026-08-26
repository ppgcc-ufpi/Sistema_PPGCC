import { createHash, randomBytes } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { AuthenticatedUser } from './auth.types';

type JwtPayload = { sub: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.usuario.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
    });
    if (!user?.ativo || !(await compare(dto.password, user.senhaHash))) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }
    return this.createTokens(user.id);
  }

  async authenticateToken(token: string): Promise<AuthenticatedUser> {
    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token);
      const user = await this.prisma.usuario.findUnique({
        where: { id: payload.sub },
        select: {
          id: true, email: true, nome: true, perfil: true, ativo: true,
          docenteId: true, programaId: true,
        },
      });
      if (!user?.ativo) throw new Error('Usuário inativo');
      return user;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.hash(refreshToken);
    const session = await this.prisma.sessaoRefresh.findUnique({ where: { tokenHash } });
    if (!session || session.revogadaEm || session.expiraEm <= new Date()) {
      throw new UnauthorizedException('Sessão inválida ou expirada.');
    }
    const reivindicada = await this.prisma.sessaoRefresh.updateMany({
      where: { id: session.id, revogadaEm: null, expiraEm: { gt: new Date() } },
      data: { revogadaEm: new Date() },
    });
    if (reivindicada.count !== 1) throw new UnauthorizedException('Sessão já utilizada.');
    return this.createTokens(session.usuarioId);
  }

  async logout(refreshToken: string) {
    await this.prisma.sessaoRefresh.updateMany({
      where: { tokenHash: this.hash(refreshToken), revogadaEm: null },
      data: { revogadaEm: new Date() },
    });
    return { encerrada: true };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.usuario.findUnique({ where: { id: userId } });
    if (!user || !(await compare(currentPassword, user.senhaHash))) {
      throw new UnauthorizedException('Senha atual inválida.');
    }
    await this.prisma.$transaction([
      this.prisma.usuario.update({ where: { id: userId }, data: { senhaHash: await hash(newPassword, 12) } }),
      this.prisma.sessaoRefresh.updateMany({ where: { usuarioId: userId, revogadaEm: null }, data: { revogadaEm: new Date() } }),
    ]);
    return { changed: true };
  }

  private async createTokens(usuarioId: string) {
    const accessSeconds = Number(this.config.get('JWT_ACCESS_SECONDS', 900));
    const refreshDays = Number(this.config.get('JWT_REFRESH_DAYS', 30));
    const accessToken = await this.jwt.signAsync({ sub: usuarioId }, { expiresIn: accessSeconds });
    const refreshToken = randomBytes(48).toString('base64url');
    await this.prisma.sessaoRefresh.create({
      data: {
        usuarioId,
        tokenHash: this.hash(refreshToken),
        expiraEm: new Date(Date.now() + refreshDays * 86_400_000),
      },
    });
    return { accessToken, refreshToken, expiresIn: accessSeconds };
  }

  private hash(value: string) {
    return createHash('sha256').update(value).digest('hex');
  }
}
