import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocentesService {
  constructor(private readonly prisma: PrismaService) {}

  async listar() {
    const docentes = await this.prisma.docente.findMany({ orderBy: { nomeNormalizado: 'asc' } });
    return docentes.map((docente) => docente.dados);
  }

  async buscarPorId(id: string) {
    const docente = await this.prisma.docente.findUnique({ where: { id } });
    if (!docente) throw new NotFoundException('Docente não encontrado.');
    return docente.dados;
  }

  async buscarDadosCompletos(id: string) {
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

    return {
      docente: docente.dados,
      producoes: docente.producoes.map((item) => item.producao.dados),
      orientacoes: docente.orientacoes.map((item) => item.orientacao.dados),
      projetos: docente.projetos.map((item) => item.projeto.dados),
      formacoes: docente.formacoes.map((item) => item.dados),
    };
  }
}
