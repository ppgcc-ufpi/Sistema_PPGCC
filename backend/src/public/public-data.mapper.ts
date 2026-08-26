type JsonObject = Record<string, unknown>;

const toObject = (value: unknown): JsonObject =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonObject)
    : {};

const pick = (source: JsonObject, fields: readonly string[]): JsonObject =>
  Object.fromEntries(
    fields
      .filter((field) => Object.prototype.hasOwnProperty.call(source, field))
      .map((field) => [field, source[field]]),
  );

const publicProgramLink = { integrar: true };

export const sanitizeFaculty = (value: unknown) =>
  pick(toObject(value), [
    'id_docente',
    'nome',
    'nome_normalizado',
    'vinculo_institucional',
  ]);

export const sanitizeProduction = (value: unknown) => ({
  ...pick(toObject(value), [
    'id_producao',
    'titulo',
    'titulos_alternativos',
    'ano',
    'anos_registrados',
    'natureza',
    'categorias_especificas',
    'tipos',
    'subtipos',
    'autores',
    'veiculos',
    'locais_evento',
    'editoras_ou_publicadores',
    'numeros_registro',
    'instituicoes_registro',
    'areas_concentracao',
    'linhas_pesquisa',
    'projetos_pesquisa',
    'vinculada_tcc',
    'docente_ids',
  ]),
  vinculo_programa: publicProgramLink,
});

export const sanitizeAdvising = (value: unknown) => ({
  ...pick(toObject(value), [
    'id_orientacao',
    'docente_ids',
    'orientando',
    'nivel_normalizado',
    'titulos',
    'tipos',
    'instituicoes',
    'ano',
    'anos_registrados',
    'situacao_normalizada',
  ]),
  vinculo_programa: publicProgramLink,
});

export const sanitizeProject = (value: unknown) => ({
  ...pick(toObject(value), [
    'id_projeto',
    'docente_ids',
    'titulo',
    'titulo_normalizado',
    'ano_inicio',
    'ano_conclusao',
    'situacao_normalizada',
    'naturezas',
    'integrantes',
    'financiamentos',
    'areas_concentracao',
    'linhas_pesquisa',
    'descricoes',
  ]),
  vinculo_programa: publicProgramLink,
});

export const sanitizeEducation = (value: unknown) =>
  pick(toObject(value), [
    'id_formacao',
    'id_docente',
    'nivel',
    'nivel_normalizado',
    'instituicao',
    'instituicao_normalizada',
    'ano_inicio',
    'ano_conclusao',
    'orientador',
    'titulo',
    'escopo',
  ]);
