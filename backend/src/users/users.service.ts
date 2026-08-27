import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PerfilUsuario as UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';
import { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async list(user: AuthenticatedUser) {
    const users = await this.prisma.usuario.findMany({ where: { programaId: user.programaId },
      select: { id: true, email: true, nome: true, perfil: true, ativo: true, docente: { select: { idExterno: true, nome: true } }, criadoEm: true },
      orderBy: { nome: 'asc' } });
    return users.map((item) => ({
      ...item,
      nome: item.nome?.toLocaleUpperCase('pt-BR') ?? null,
      docente: item.docente ? { ...item.docente, nome: item.docente.nome.toLocaleUpperCase('pt-BR') } : null,
    }));
  }
  async create(user: AuthenticatedUser, dto: CreateUserDto) {
    const email = dto.email.trim().toLowerCase();
    if (await this.prisma.usuario.findUnique({ where: { email } })) throw new ConflictException('E-mail já cadastrado.');
    let docenteId: string | null = null;
    if (dto.role === UserRole.DOCENTE) {
      const docente = await this.prisma.docente.findUnique({ where: { programaId_idExterno: { programaId: user.programaId, idExterno: dto.facultyExternalId! } } });
      if (!docente) throw new NotFoundException('Docente não encontrado no programa.');
      if (await this.prisma.usuario.findUnique({ where: { docenteId: docente.id } })) throw new ConflictException('Docente já possui conta.');
      docenteId = docente.id;
    }
    const created = await this.prisma.usuario.create({ data: { programaId: user.programaId, email, nome: dto.name, perfil: dto.role, docenteId, senhaHash: await hash(dto.password, 12) },
      select: { id: true, email: true, nome: true, perfil: true, ativo: true, docenteId: true } });
    return { ...created, nome: created.nome?.toLocaleUpperCase('pt-BR') ?? null };
  }

  async update(currentUser: AuthenticatedUser, id: string, dto: UpdateUserDto) {
    const target = await this.prisma.usuario.findFirst({ where: { id, programaId: currentUser.programaId } });
    if (!target) throw new NotFoundException('Usuário não encontrado.');
    if (target.id === currentUser.id && dto.active === false) {
      throw new ConflictException('A coordenação não pode desativar a própria conta nesta sessão.');
    }
    const updated = await this.prisma.usuario.update({ where: { id }, data: { nome: dto.name, ativo: dto.active },
      select: { id: true, email: true, nome: true, perfil: true, ativo: true, docenteId: true } });
    if (dto.active === false) await this.prisma.sessaoRefresh.updateMany({ where: { usuarioId: id, revogadaEm: null }, data: { revogadaEm: new Date() } });
    return { ...updated, nome: updated.nome?.toLocaleUpperCase('pt-BR') ?? null };
  }
}
