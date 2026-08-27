import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PerfilUsuario as UserRole, Prisma, StatusSugestao as SuggestionStatus, TipoDecisao as DecisionType, TipoEntidade as EntityType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/auth.types';
import { CreateSuggestionDto } from './dto/create-suggestion.dto';
import { DecideSuggestionDto } from './dto/decide-suggestion.dto';

@Injectable()
export class SuggestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthenticatedUser, dto: CreateSuggestionDto) {
    if (!Object.keys(dto.changes).length) throw new BadRequestException('Informe ao menos uma alteração.');
    this.validateFields(dto.entityType, dto.changes);
    await this.validateRecordAccess(user, dto.entityType, dto.externalRecordId);
    return this.prisma.sugestao.create({ data: {
      programaId: user.programaId, autorId: user.id, tipoEntidade: dto.entityType,
      registroIdExterno: dto.externalRecordId, alteracoes: dto.changes as Prisma.InputJsonValue,
      justificativa: dto.justification,
    } });
  }

  mine(user: AuthenticatedUser) {
    return this.prisma.sugestao.findMany({ where: { autorId: user.id }, include: { decisoes: true }, orderBy: { criadaEm: 'desc' } });
  }

  async listForCoordination(user: AuthenticatedUser, status?: SuggestionStatus) {
    const suggestions = await this.prisma.sugestao.findMany({ where: { programaId: user.programaId, status }, include: {
      autor: { select: { id: true, nome: true, email: true, perfil: true } }, decisoes: true,
    }, orderBy: { criadaEm: 'desc' } });
    return suggestions.map((item) => ({
      ...item,
      autor: { ...item.autor, nome: item.autor.nome?.toLocaleUpperCase('pt-BR') ?? null },
    }));
  }

  async decide(user: AuthenticatedUser, id: string, dto: DecideSuggestionDto) {
    const suggestion = await this.prisma.sugestao.findFirst({ where: { id, programaId: user.programaId } });
    if (!suggestion) throw new NotFoundException('Sugestão não encontrada.');
    if (suggestion.status !== SuggestionStatus.PENDENTE) throw new BadRequestException('Esta sugestão já foi decidida.');
    const status = dto.type === DecisionType.APROVACAO ? SuggestionStatus.APROVADA : SuggestionStatus.REJEITADA;
    return this.prisma.$transaction(async (tx) => {
      await tx.decisaoSugestao.create({ data: { sugestaoId: id, tipo: dto.type, justificativa: dto.justification, responsavelId: user.id } });
      const updated = await tx.sugestao.update({ where: { id }, data: { status } });
      if (dto.type === DecisionType.APROVACAO) await tx.correcaoAprovada.create({ data: {
        programaId: suggestion.programaId, sugestaoId: id, tipoEntidade: suggestion.tipoEntidade,
        registroIdExterno: suggestion.registroIdExterno, alteracoes: suggestion.alteracoes as Prisma.InputJsonValue,
        responsavelId: user.id,
      } });
      return updated;
    });
  }

  private async validateRecordAccess(user: AuthenticatedUser, type: EntityType, externalId: string) {
    if (user.perfil === UserRole.COORDENACAO) {
      if (!(await this.exists(user.programaId, type, externalId))) throw new NotFoundException('Registro não encontrado.');
      return;
    }
    if (!user.docenteId) throw new ForbiddenException('Conta sem vínculo docente.');
    let allowed = false;
    if (type === EntityType.DOCENTE) allowed = (await this.prisma.docente.count({ where: { id: user.docenteId, idExterno: externalId } })) > 0;
    if (type === EntityType.FORMACAO) allowed = (await this.prisma.formacao.count({ where: { docenteId: user.docenteId, idExterno: externalId } })) > 0;
    if (type === EntityType.PRODUCAO) allowed = (await this.prisma.producaoDocente.count({ where: { docenteId: user.docenteId, elegivelDocente: true, producao: { programaId: user.programaId, idExterno: externalId } } })) > 0;
    if (type === EntityType.ORIENTACAO) allowed = (await this.prisma.orientacaoDocente.count({ where: { docenteId: user.docenteId, elegivelDocente: true, orientacao: { programaId: user.programaId, idExterno: externalId } } })) > 0;
    if (type === EntityType.PROJETO) allowed = (await this.prisma.projetoDocente.count({ where: { docenteId: user.docenteId, elegivelDocente: true, projeto: { programaId: user.programaId, idExterno: externalId } } })) > 0;
    if (!allowed) throw new ForbiddenException('Você só pode sugerir alterações em seus registros.');
  }

  private validateFields(type: EntityType, changes: Record<string, unknown>) {
    const allowed: Record<EntityType, Set<string>> = {
      DOCENTE: new Set(['nome', 'nome_normalizado', 'vinculo_institucional', 'vinculos_programa', 'ano_ingresso_programa']),
      FORMACAO: new Set(['nivel', 'nivel_normalizado', 'instituicao', 'instituicao_normalizada', 'ano_inicio', 'ano_conclusao', 'orientador', 'orientador_normalizado', 'titulo', 'titulo_normalizado', 'escopo']),
      PRODUCAO: new Set(['titulo', 'titulo_normalizado', 'titulos_alternativos', 'ano', 'anos_registrados', 'natureza', 'categorias_especificas', 'tipos', 'subtipos', 'autores', 'veiculos', 'locais_evento', 'editoras_ou_publicadores', 'observacoes', 'numeros_registro', 'instituicoes_registro', 'areas_concentracao', 'linhas_pesquisa', 'projetos_pesquisa', 'vinculada_tcc']),
      ORIENTACAO: new Set(['orientando', 'orientando_normalizado', 'nivel_normalizado', 'titulos', 'tipos', 'instituicoes', 'ano', 'anos_registrados', 'situacao_normalizada']),
      PROJETO: new Set(['titulo', 'titulo_normalizado', 'ano_inicio', 'ano_conclusao', 'situacao_normalizada', 'naturezas', 'integrantes', 'financiamentos', 'areas_concentracao', 'linhas_pesquisa', 'descricoes']),
    };
    const invalid = Object.keys(changes).filter((field) => !allowed[type].has(field));
    if (invalid.length) throw new BadRequestException(`Campos não permitidos para correção: ${invalid.join(', ')}.`);
  }

  private async exists(programaId: string, type: EntityType, externalId: string) {
    const where = { programaId, idExterno: externalId };
    if (type === EntityType.DOCENTE) return (await this.prisma.docente.count({ where })) > 0;
    if (type === EntityType.FORMACAO) return (await this.prisma.formacao.count({ where })) > 0;
    if (type === EntityType.PRODUCAO) return (await this.prisma.producao.count({ where: { ...where, elegivelCoordenacao: true } })) > 0;
    if (type === EntityType.ORIENTACAO) return (await this.prisma.orientacao.count({ where: { ...where, elegivelCoordenacao: true } })) > 0;
    return (await this.prisma.projeto.count({ where: { ...where, elegivelCoordenacao: true } })) > 0;
  }
}
