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

const NAME_FIELDS = new Set(['nome', 'orientando', 'orientador', 'docente', 'autores', 'integrantes']);

export const sanitizePersonalNames = (value: unknown, parentField?: string): unknown => {
  if (Array.isArray(value)) return value.map((item) => sanitizePersonalNames(item, parentField));
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value)
      .filter(([field]) => field !== 'nome_normalizado')
      .map(([field, item]) => [field, sanitizePersonalNames(item, field)]));
  }
  if (typeof value === 'string' && parentField && NAME_FIELDS.has(parentField)) {
    return value.toLocaleUpperCase('pt-BR');
  }
  return value;
};

export const sanitizeFaculty = (value: unknown) =>
  sanitizePersonalNames(pick(toObject(value), [
    'id_docente',
    'nome',
    'vinculo_institucional',
    'ano_ingresso_programa',
    'vinculos_programa',
  ]));

export const sanitizeProduction = (value: unknown) => sanitizePersonalNames({
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

export const sanitizeAdvising = (value: unknown) => sanitizePersonalNames({
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

export const sanitizeProject = (value: unknown) => sanitizePersonalNames({
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
  sanitizePersonalNames(pick(toObject(value), [
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
  ]));
