import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardsService {
  constructor(private readonly prisma: PrismaService) {}

  async coordenacao() {
    const [docentes, producoes, orientacoes, projetos, ultimaImportacao] = await Promise.all([
      this.prisma.docente.count(),
      this.prisma.producao.count({ where: { integravel: true } }),
      this.prisma.orientacao.count({ where: { integravel: true } }),
      this.prisma.projeto.count({ where: { integravel: true } }),
      this.prisma.importacao.findFirst({
        where: { status: 'CONCLUIDA' },
        orderBy: { concluidaEm: 'desc' },
      }),
    ]);

    return {
      docentes,
      producoes,
      orientacoes,
      projetos,
      atualizadoEm: ultimaImportacao?.concluidaEm ?? null,
    };
  }

  async docente(docenteId: string | null) {
    if (!docenteId) throw new NotFoundException('Usuário sem vínculo com docente.');

    const [docente, producoes, orientacoes, projetos] = await Promise.all([
      this.prisma.docente.findUnique({ where: { id: docenteId } }),
      this.prisma.producaoDocente.count({
        where: { docenteId, producao: { integravel: true } },
      }),
      this.prisma.orientacaoDocente.count({
        where: { docenteId, orientacao: { integravel: true } },
      }),
      this.prisma.projetoDocente.count({
        where: { docenteId, projeto: { integravel: true } },
      }),
    ]);

    if (!docente) throw new NotFoundException('Docente não encontrado.');
    return { docente: docente.dados, producoes, orientacoes, projetos };
  }
}
