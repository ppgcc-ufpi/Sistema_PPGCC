import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { TipoEntidade as EntityType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/auth.types';

@Injectable()
export class VisibilityService {
  constructor(private readonly prisma: PrismaService) {}

  async coordination(user: AuthenticatedUser, type: EntityType, externalId: string, hidden: boolean) {
    const data = { ocultaCoordenacao: hidden, ocultadaPorId: hidden ? user.id : null, ocultadaEm: hidden ? new Date() : null };
    if (type === EntityType.PRODUCAO) {
      const item = await this.prisma.producao.findUnique({ where: { programaId_idExterno: { programaId: user.programaId, idExterno: externalId } } });
      this.validateCoordination(item, hidden); return this.prisma.producao.update({ where: { id: item!.id }, data });
    }
    if (type === EntityType.ORIENTACAO) {
      const item = await this.prisma.orientacao.findUnique({ where: { programaId_idExterno: { programaId: user.programaId, idExterno: externalId } } });
      this.validateCoordination(item, hidden); return this.prisma.orientacao.update({ where: { id: item!.id }, data });
    }
    if (type === EntityType.PROJETO) {
      const item = await this.prisma.projeto.findUnique({ where: { programaId_idExterno: { programaId: user.programaId, idExterno: externalId } } });
      this.validateCoordination(item, hidden); return this.prisma.projeto.update({ where: { id: item!.id }, data });
    }
    throw new BadRequestException('Visibilidade gerenciável apenas para produção, orientação e projeto.');
  }

  async faculty(user: AuthenticatedUser, type: EntityType, externalId: string, hidden: boolean) {
    if (!user.docenteId) throw new ForbiddenException('Conta sem vínculo docente.');
    const data = { ocultaDocente: hidden, ocultadaPorId: hidden ? user.id : null, ocultadaEm: hidden ? new Date() : null };
    if (type === EntityType.PRODUCAO) {
      const item = await this.prisma.producaoDocente.findFirst({ where: { docenteId: user.docenteId, producao: { programaId: user.programaId, idExterno: externalId } } });
      this.validateFaculty(item, hidden); return this.prisma.producaoDocente.update({ where: { producaoId_docenteId: { producaoId: item!.producaoId, docenteId: item!.docenteId } }, data });
    }
    if (type === EntityType.ORIENTACAO) {
      const item = await this.prisma.orientacaoDocente.findFirst({ where: { docenteId: user.docenteId, orientacao: { programaId: user.programaId, idExterno: externalId } } });
      this.validateFaculty(item, hidden); return this.prisma.orientacaoDocente.update({ where: { orientacaoId_docenteId: { orientacaoId: item!.orientacaoId, docenteId: item!.docenteId } }, data });
    }
    if (type === EntityType.PROJETO) {
      const item = await this.prisma.projetoDocente.findFirst({ where: { docenteId: user.docenteId, projeto: { programaId: user.programaId, idExterno: externalId } } });
      this.validateFaculty(item, hidden); return this.prisma.projetoDocente.update({ where: { projetoId_docenteId: { projetoId: item!.projetoId, docenteId: item!.docenteId } }, data });
    }
    throw new BadRequestException('Visibilidade gerenciável apenas para produção, orientação e projeto.');
  }

  private validateCoordination(item: { elegivelCoordenacao: boolean; permiteOcultarCoordenacao: boolean } | null, hidden: boolean) {
    if (!item) throw new NotFoundException('Registro não encontrado.');
    if (!item.elegivelCoordenacao) throw new ForbiddenException('Registro indisponível para a coordenação.');
    if (hidden && !item.permiteOcultarCoordenacao) throw new ForbiddenException('O contrato não permite ocultar este registro.');
  }
  private validateFaculty(item: { elegivelDocente: boolean; permiteOcultar: boolean } | null, hidden: boolean) {
    if (!item) throw new NotFoundException('Registro não vinculado ao docente.');
    if (!item.elegivelDocente) throw new ForbiddenException('Registro indisponível para este docente.');
    if (hidden && !item.permiteOcultar) throw new ForbiddenException('O contrato não permite ocultar este registro.');
  }
}
