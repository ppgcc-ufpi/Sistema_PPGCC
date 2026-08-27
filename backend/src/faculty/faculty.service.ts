import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CorrectionsService } from '../corrections/corrections.service';
import { TipoEntidade } from '@prisma/client';
import { sanitizePersonalNames } from '../public/public-data.mapper';

@Injectable()
export class FacultyService {
  constructor(private readonly prisma: PrismaService, private readonly corrections: CorrectionsService) {}

  async list(programaId: string) {
    const faculty = await this.prisma.docente.findMany({ where: { programaId }, orderBy: { nomeNormalizado: 'asc' } });
    return (await this.corrections.materialize(programaId, TipoEntidade.DOCENTE, faculty))
      .map((item) => sanitizePersonalNames(item));
  }

  async findById(id: string) {
    const docente = await this.prisma.docente.findUnique({ where: { id } });
    if (!docente) throw new NotFoundException('Docente não encontrado.');
    return sanitizePersonalNames(docente.dadosOriginais);
  }

  async getFullProfile(id: string) {
    const docente = await this.prisma.docente.findUnique({
      where: { id },
      include: {
        producoes: { include: { producao: true } },
        orientacoes: { include: { orientacao: true } },
        projetos: { include: { projeto: true } },
        formacoes: true,
      },
    });
    if (!docente) throw new NotFoundException('Docente não encontrado.');

    const producoes = docente.producoes.filter((item) => item.elegivelDocente && !item.ocultaDocente).map((item) => item.producao);
    const orientacoes = docente.orientacoes.filter((item) => item.elegivelDocente && !item.ocultaDocente).map((item) => item.orientacao);
    const projetos = docente.projetos.filter((item) => item.elegivelDocente && !item.ocultaDocente).map((item) => item.projeto);
    const [docenteEfetivo, producoesEfetivas, orientacoesEfetivas, projetosEfetivos, formacoesEfetivas] = await Promise.all([
      this.corrections.materialize(docente.programaId, TipoEntidade.DOCENTE, [docente]),
      this.corrections.materialize(docente.programaId, TipoEntidade.PRODUCAO, producoes),
      this.corrections.materialize(docente.programaId, TipoEntidade.ORIENTACAO, orientacoes),
      this.corrections.materialize(docente.programaId, TipoEntidade.PROJETO, projetos),
      this.corrections.materialize(docente.programaId, TipoEntidade.FORMACAO, docente.formacoes),
    ]);
    return sanitizePersonalNames({ docente: docenteEfetivo[0], producoes: producoesEfetivas, orientacoes: orientacoesEfetivas, projetos: projetosEfetivos, formacoes: formacoesEfetivas });
  }

  async getFullProfileByExternalId(programaId: string, idExterno: string) {
    const docente = await this.prisma.docente.findUnique({ where: { programaId_idExterno: { programaId, idExterno } } });
    if (!docente) throw new NotFoundException('Docente não encontrado.');
    return this.getFullProfile(docente.id);
  }
}
