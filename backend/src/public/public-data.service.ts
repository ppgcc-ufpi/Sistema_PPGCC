import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  sanitizarDocente,
  sanitizarFormacao,
  sanitizarOrientacao,
  sanitizarProducao,
  sanitizarProjeto,
} from './public-data.mapper';

@Injectable()
export class PublicDataService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const [docentes, producoes, orientacoes, projetos, formacoes, ultimaImportacao] =
      await Promise.all([
        this.prisma.docente.count(),
        this.prisma.producao.count({ where: { integravel: true } }),
        this.prisma.orientacao.count({ where: { integravel: true } }),
        this.prisma.projeto.count({ where: { integravel: true } }),
        this.prisma.formacao.count(),
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
      formacoes,
      atualizadoEm: ultimaImportacao?.concluidaEm ?? null,
    };
  }

  async docentes() {
    const dados = await this.prisma.docente.findMany({ orderBy: { nomeNormalizado: 'asc' } });
    return dados.map((item) => sanitizarDocente(item.dados));
  }

  async producoes() {
    const dados = await this.prisma.producao.findMany({
      where: { integravel: true },
      orderBy: [{ ano: 'desc' }, { titulo: 'asc' }],
    });
    return dados.map((item) => sanitizarProducao(item.dados));
  }

  async orientacoes() {
    const dados = await this.prisma.orientacao.findMany({
      where: { integravel: true },
      orderBy: [{ ano: 'desc' }, { orientando: 'asc' }],
    });
    return dados.map((item) => sanitizarOrientacao(item.dados));
  }

  async projetos() {
    const dados = await this.prisma.projeto.findMany({
      where: { integravel: true },
      orderBy: [{ anoInicio: 'desc' }, { titulo: 'asc' }],
    });
    return dados.map((item) => sanitizarProjeto(item.dados));
  }

  async formacoes() {
    const dados = await this.prisma.formacao.findMany({
      orderBy: [{ docenteId: 'asc' }, { anoConclusao: 'desc' }],
    });
    return dados.map((item) => sanitizarFormacao(item.dados));
  }
}
