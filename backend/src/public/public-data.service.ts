import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TipoEntidade } from '@prisma/client';
import { CorrectionsService } from '../corrections/corrections.service';
import { PrismaService } from '../prisma/prisma.service';
import { sanitizeFaculty, sanitizeEducation, sanitizeAdvising, sanitizeProduction, sanitizeProject } from './public-data.mapper';

@Injectable()
export class PublicDataService {
  constructor(private readonly prisma: PrismaService, private readonly corrections: CorrectionsService,
    private readonly config: ConfigService) {}

  private program(id?: string): string {
    return id || this.config.get<string>('DEFAULT_PROGRAM_ID') || 'ppgcc-ufpi';
  }

  async dashboard(id?: string) {
    const programaId = this.program(id);
    const filtro = { programaId, elegivelPublico: true, ocultaCoordenacao: false };
    const [docentes, producoes, orientacoes, projetos, formacoes, ultimaImportacao] = await Promise.all([
      this.prisma.docente.count({ where: { programaId } }), this.prisma.producao.count({ where: filtro }),
      this.prisma.orientacao.count({ where: filtro }), this.prisma.projeto.count({ where: filtro }),
      this.prisma.formacao.count({ where: { programaId } }),
      this.prisma.importacao.findFirst({ where: { programaId, status: 'CONCLUIDA' }, orderBy: { concluidaEm: 'desc' } }),
    ]);
    return { programId: programaId, faculty: docentes, productions: producoes, advising: orientacoes, projects: projetos, education: formacoes,
      updatedAt: ultimaImportacao?.concluidaEm ?? null };
  }

  async faculty(id?: string) {
    const programaId = this.program(id);
    const registros = await this.prisma.docente.findMany({ where: { programaId }, orderBy: { nomeNormalizado: 'asc' } });
    return (await this.corrections.materialize(programaId, TipoEntidade.DOCENTE, registros)).map(sanitizeFaculty);
  }

  async productions(id?: string) {
    const programaId = this.program(id);
    const registros = await this.prisma.producao.findMany({ where: { programaId, elegivelPublico: true, ocultaCoordenacao: false }, orderBy: [{ ano: 'desc' }, { titulo: 'asc' }] });
    return (await this.corrections.materialize(programaId, TipoEntidade.PRODUCAO, registros)).map(sanitizeProduction);
  }

  async advising(id?: string) {
    const programaId = this.program(id);
    const registros = await this.prisma.orientacao.findMany({ where: { programaId, elegivelPublico: true, ocultaCoordenacao: false }, orderBy: [{ ano: 'desc' }, { orientando: 'asc' }] });
    return (await this.corrections.materialize(programaId, TipoEntidade.ORIENTACAO, registros)).map(sanitizeAdvising);
  }

  async projects(id?: string) {
    const programaId = this.program(id);
    const registros = await this.prisma.projeto.findMany({ where: { programaId, elegivelPublico: true, ocultaCoordenacao: false }, orderBy: [{ anoInicio: 'desc' }, { titulo: 'asc' }] });
    return (await this.corrections.materialize(programaId, TipoEntidade.PROJETO, registros)).map(sanitizeProject);
  }

  async education(id?: string) {
    const programaId = this.program(id);
    const registros = await this.prisma.formacao.findMany({ where: { programaId }, orderBy: [{ docenteId: 'asc' }, { anoConclusao: 'desc' }] });
    return (await this.corrections.materialize(programaId, TipoEntidade.FORMACAO, registros)).map(sanitizeEducation);
  }
}
