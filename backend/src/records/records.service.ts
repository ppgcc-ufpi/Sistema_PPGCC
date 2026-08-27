import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { TipoEntidade as EntityType } from '@prisma/client';
import { AuthenticatedUser } from '../auth/auth.types';
import { CorrectionsService } from '../corrections/corrections.service';
import { PrismaService } from '../prisma/prisma.service';
import { sanitizePersonalNames } from '../public/public-data.mapper';

const MANAGED_TYPES = new Set<EntityType>([
  EntityType.PRODUCAO,
  EntityType.ORIENTACAO,
  EntityType.PROJETO,
]);

const DETAIL_FIELDS: Record<string, readonly string[]> = {
  [EntityType.PRODUCAO]: ['titulo', 'titulo_normalizado', 'titulos_alternativos', 'ano', 'anos_registrados', 'natureza', 'categorias_especificas', 'tipos', 'subtipos', 'autores', 'veiculos', 'locais_evento', 'editoras_ou_publicadores', 'observacoes', 'numeros_registro', 'instituicoes_registro', 'areas_concentracao', 'linhas_pesquisa', 'projetos_pesquisa', 'vinculada_tcc'],
  [EntityType.ORIENTACAO]: ['orientando', 'orientando_normalizado', 'nivel_normalizado', 'titulos', 'tipos', 'instituicoes', 'ano', 'anos_registrados', 'situacao_normalizada'],
  [EntityType.PROJETO]: ['titulo', 'titulo_normalizado', 'ano_inicio', 'ano_conclusao', 'situacao_normalizada', 'naturezas', 'integrantes', 'financiamentos', 'areas_concentracao', 'linhas_pesquisa', 'descricoes'],
};

const sanitizeDetails = (type: EntityType, value: Record<string, unknown>) =>
  sanitizePersonalNames(
    Object.fromEntries(DETAIL_FIELDS[type].filter((field) => Object.hasOwn(value, field)).map((field) => [field, value[field]])),
  ) as Record<string, unknown>;

type SourceRecord = {
  idExterno: string;
  dadosOriginais: unknown;
  elegivelCoordenacao: boolean;
  elegivelPublico: boolean;
  exibirPorPadraoCoordenacao: boolean;
  exibirPorPadraoPublico: boolean;
  permiteOcultarCoordenacao: boolean;
  ocultaCoordenacao: boolean;
  docentes: Array<{ docente: { idExterno: string; nome: string } }>;
};

type FacultyRelation = {
  elegivelDocente: boolean;
  exibirPorPadrao: boolean;
  permiteOcultar: boolean;
  ocultaDocente: boolean;
};

type ManagedRecord = {
  entityType: EntityType;
  externalId: string;
  data: Record<string, unknown>;
  faculty?: Array<{ idExterno: string; nome: string }>;
  visibility: {
    eligible: boolean;
    defaultVisible: boolean;
    canHide: boolean;
    hidden: boolean;
    hiddenByCoordination?: boolean;
    publicEligible?: boolean;
    publicDefaultVisible?: boolean;
    publicVisible?: boolean;
  };
};

@Injectable()
export class RecordsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly corrections: CorrectionsService,
  ) {}

  async forFaculty(user: AuthenticatedUser, type: EntityType): Promise<ManagedRecord[]> {
    this.validateType(type);
    if (!user.docenteId) throw new ForbiddenException('Conta sem vínculo docente.');

    if (type === EntityType.PRODUCAO) {
      const relations = await this.prisma.producaoDocente.findMany({
        where: { docenteId: user.docenteId, elegivelDocente: true, producao: { programaId: user.programaId } },
        include: { producao: true },
      });
      return this.mapFaculty(user.programaId, type, relations.map(({ producao, ...visibility }) => ({ record: producao, visibility })));
    }
    if (type === EntityType.ORIENTACAO) {
      const relations = await this.prisma.orientacaoDocente.findMany({
        where: { docenteId: user.docenteId, elegivelDocente: true, orientacao: { programaId: user.programaId } },
        include: { orientacao: true },
      });
      return this.mapFaculty(user.programaId, type, relations.map(({ orientacao, ...visibility }) => ({ record: orientacao, visibility })));
    }
    const relations = await this.prisma.projetoDocente.findMany({
      where: { docenteId: user.docenteId, elegivelDocente: true, projeto: { programaId: user.programaId } },
      include: { projeto: true },
    });
    return this.mapFaculty(user.programaId, type, relations.map(({ projeto, ...visibility }) => ({ record: projeto, visibility })));
  }

  async forCoordination(user: AuthenticatedUser, type: EntityType): Promise<ManagedRecord[]> {
    this.validateType(type);
    const include = { docentes: { include: { docente: { select: { idExterno: true, nome: true } } } } } as const;
    let records: SourceRecord[];

    if (type === EntityType.PRODUCAO) {
      records = await this.prisma.producao.findMany({ where: { programaId: user.programaId, elegivelCoordenacao: true }, include });
    } else if (type === EntityType.ORIENTACAO) {
      records = await this.prisma.orientacao.findMany({ where: { programaId: user.programaId, elegivelCoordenacao: true }, include });
    } else {
      records = await this.prisma.projeto.findMany({ where: { programaId: user.programaId, elegivelCoordenacao: true }, include });
    }

    const effective = await this.corrections.materialize(user.programaId, type, records);
    return records.map((record, index) => ({
      entityType: type,
      externalId: record.idExterno,
      data: sanitizeDetails(type, effective[index]),
      faculty: record.docentes.map(({ docente }) => ({ ...docente, nome: docente.nome.toLocaleUpperCase('pt-BR') })),
      visibility: {
        eligible: record.elegivelCoordenacao,
        defaultVisible: record.exibirPorPadraoCoordenacao,
        canHide: record.permiteOcultarCoordenacao,
        hidden: record.ocultaCoordenacao,
        publicEligible: record.elegivelPublico,
        publicDefaultVisible: record.exibirPorPadraoPublico,
        publicVisible: record.elegivelPublico && !record.ocultaCoordenacao,
      },
    }));
  }

  private async mapFaculty(
    programaId: string,
    type: EntityType,
    items: Array<{ record: { idExterno: string; dadosOriginais: unknown; ocultaCoordenacao: boolean }; visibility: FacultyRelation }>,
  ): Promise<ManagedRecord[]> {
    const effective = await this.corrections.materialize(programaId, type, items.map(({ record }) => record));
    return items.map(({ record, visibility }, index) => ({
      entityType: type,
      externalId: record.idExterno,
      data: sanitizeDetails(type, effective[index]),
      visibility: {
        eligible: visibility.elegivelDocente,
        defaultVisible: visibility.exibirPorPadrao,
        canHide: visibility.permiteOcultar,
        hidden: visibility.ocultaDocente,
        hiddenByCoordination: record.ocultaCoordenacao,
      },
    }));
  }

  private validateType(type: EntityType) {
    if (!MANAGED_TYPES.has(type)) {
      throw new BadRequestException('Consulta detalhada disponível apenas para produção, orientação e projeto.');
    }
  }
}
