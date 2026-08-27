import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { sanitizePersonalNames } from '../public/public-data.mapper';

@Injectable()
export class DashboardsService {
  constructor(private readonly prisma: PrismaService) {}

  async coordination(programaId: string) {
    const [docentes, producoes, orientacoes, projetos, ultimaImportacao] = await Promise.all([
      this.prisma.docente.count({ where: { programaId } }),
      this.prisma.producao.count({ where: { programaId, elegivelCoordenacao: true } }),
      this.prisma.orientacao.count({ where: { programaId, elegivelCoordenacao: true } }),
      this.prisma.projeto.count({ where: { programaId, elegivelCoordenacao: true } }),
      this.prisma.importacao.findFirst({
        where: { programaId, status: 'CONCLUIDA' },
        orderBy: { concluidaEm: 'desc' },
      }),
    ]);

    return { faculty: docentes, productions: producoes, advising: orientacoes,
      projects: projetos, updatedAt: ultimaImportacao?.concluidaEm ?? null };
  }

  async faculty(docenteId: string | null) {
    if (!docenteId) throw new NotFoundException('Usuário sem vínculo com docente.');

    const [docente, producoes, orientacoes, projetos] = await Promise.all([
      this.prisma.docente.findUnique({ where: { id: docenteId } }),
      this.prisma.producaoDocente.count({
        where: { docenteId, elegivelDocente: true, ocultaDocente: false },
      }),
      this.prisma.orientacaoDocente.count({
        where: { docenteId, elegivelDocente: true, ocultaDocente: false },
      }),
      this.prisma.projetoDocente.count({
        where: { docenteId, elegivelDocente: true, ocultaDocente: false },
      }),
    ]);

    if (!docente) throw new NotFoundException('Docente não encontrado.');
    return { faculty: sanitizePersonalNames(docente.dadosOriginais), productions: producoes, advising: orientacoes, projects: projetos };
  }
}
