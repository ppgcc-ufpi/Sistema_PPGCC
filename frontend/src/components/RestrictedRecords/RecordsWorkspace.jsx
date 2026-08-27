import { useCallback, useEffect, useMemo, useState } from 'react';

const recordTypes = [
  { value: 'PRODUCAO', label: 'Produções' },
  { value: 'ORIENTACAO', label: 'Orientações' },
  { value: 'PROJETO', label: 'Projetos' },
];

const filtersByType = {
  PRODUCAO: [
    { key: 'natureza', label: 'Natureza', placeholder: 'Todas as naturezas' },
    { key: 'tipos', label: 'Tipo de produção', placeholder: 'Todos os tipos' },
  ],
  ORIENTACAO: [
    { key: 'nivel_normalizado', label: 'Nível', placeholder: 'Todos os níveis' },
    { key: 'situacao_normalizada', label: 'Situação', placeholder: 'Todas as situações' },
  ],
  PROJETO: [
    { key: 'situacao_normalizada', label: 'Situação', placeholder: 'Todas as situações' },
    { key: 'naturezas', label: 'Natureza', placeholder: 'Todas as naturezas' },
  ],
};

const fieldsByType = {
  PRODUCAO: [
    { key: 'titulo', label: 'Título' },
    { key: 'ano', label: 'Ano', number: true },
    { key: 'natureza', label: 'Natureza' },
  ],
  ORIENTACAO: [
    { key: 'orientando', label: 'Orientando(a)' },
    { key: 'ano', label: 'Ano', number: true },
    { key: 'nivel_normalizado', label: 'Nível' },
    { key: 'situacao_normalizada', label: 'Situação' },
  ],
  PROJETO: [
    { key: 'titulo', label: 'Título' },
    { key: 'ano_inicio', label: 'Ano de início', number: true },
    { key: 'ano_conclusao', label: 'Ano de conclusão', number: true },
    { key: 'situacao_normalizada', label: 'Situação' },
  ],
};

const formatPersonName = (value = '') => String(value).toLocaleUpperCase('pt-BR');

const entityTypeLabels = {
  PRODUCAO: 'Produção',
  ORIENTACAO: 'Orientação',
  PROJETO: 'Projeto',
};

const fieldLabels = {
  anos_registrados: 'Anos registrados',
  categorias_especificas: 'Categorias específicas',
  titulos_alternativos: 'Títulos alternativos',
  locais_evento: 'Locais do evento',
  editoras_ou_publicadores: 'Editoras ou publicadores',
  numeros_registro: 'Números de registro',
  instituicoes_registro: 'Instituições de registro',
  areas_concentracao: 'Áreas de concentração',
  linhas_pesquisa: 'Linhas de pesquisa',
  projetos_pesquisa: 'Projetos de pesquisa',
  vinculada_tcc: 'Vinculada a TCC',
  ano_inicio: 'Ano de início',
  ano_conclusao: 'Ano de conclusão',
  nivel_normalizado: 'Nível',
  situacao_normalizada: 'Situação',
};

const valueLabels = {
  tecnica: 'Técnica',
  bibliografica: 'Bibliográfica',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
  concluida: 'Concluída',
  mestrado: 'Mestrado',
  doutorado: 'Doutorado',
  pos_doutorado: 'Pós-doutorado',
};

const hiddenDetailFields = new Set([
  'id_producao', 'id_orientacao', 'id_projeto', 'id_docente', 'docente_ids',
]);

const titleOf = (record) => record.data?.titulo
  || (record.data?.orientando && formatPersonName(record.data.orientando))
  || entityTypeLabels[record.entityType]
  || 'Registro';

const searchableText = (record) => JSON.stringify(record.data || {}).toLocaleLowerCase('pt-BR');

const valuesOf = (record, field) => {
  const value = record.data?.[field];
  if (value === null || value === undefined || value === '') return [];
  return (Array.isArray(value) ? value : [value])
    .filter((item) => ['string', 'number'].includes(typeof item))
    .map(String);
};

const integerOf = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isInteger(number) ? number : null;
};

const yearsOf = (record) => {
  if (record.entityType === 'PROJETO') {
    const start = integerOf(record.data?.ano_inicio);
    const conclusion = integerOf(record.data?.ano_conclusao);
    if (start === null) return conclusion === null ? [] : [String(conclusion)];
    const currentYear = new Date().getFullYear();
    const end = conclusion ?? Math.max(start, currentYear);
    return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => String(start + index));
  }
  return [...new Set([
    ...valuesOf(record, 'ano'),
    ...valuesOf(record, 'anos_registrados'),
  ])];
};

const uniqueOptions = (values) => [...new Set(values)]
  .sort((left, right) => String(left).localeCompare(String(right), 'pt-BR', { numeric: true }));

const displayValue = (value, field) => {
  if (value === null || value === undefined || value === '') return 'Não informado';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (Array.isArray(value)) return value.length ? value.map((item) => displayValue(item, field)).join(' • ') : 'Não informado';
  if (typeof value === 'object') {
    const visibleEntries = Object.entries(value).filter(([key]) => key !== 'nome_normalizado');
    if (typeof value.nome === 'string') return formatPersonName(value.nome);
    return visibleEntries.map(([key, item]) => `${fieldLabels[key] || fieldLabel(key)}: ${displayValue(item, key)}`).join('; ');
  }
  if (typeof value === 'string' && ['nome', 'orientando', 'orientador', 'autores', 'integrantes'].includes(field)) {
    return formatPersonName(value);
  }
  if (typeof value === 'string' && valueLabels[value.toLocaleLowerCase('pt-BR')]) {
    return valueLabels[value.toLocaleLowerCase('pt-BR')];
  }
  return String(value);
};

const isRedundantNormalizedField = (field, data) => field.endsWith('_normalizado')
  && Object.prototype.hasOwnProperty.call(data, field.replace(/_normalizado$/, ''));

function fieldLabel(field) {
  return fieldLabels[field] || field
    .replaceAll('_', ' ')
    .replace(/^./, (letter) => letter.toLocaleUpperCase('pt-BR'));
}

const hasInformation = (value) => {
  if (value === null || value === undefined || value === '') return false;
  if (Array.isArray(value)) return value.some(hasInformation);
  if (typeof value === 'object') return Object.entries(value)
    .some(([field, item]) => field !== 'nome_normalizado' && hasInformation(item));
  return true;
};

const complementaryDetails = (record) => {
  const summaryFields = new Set((fieldsByType[record.entityType] || []).map(({ key }) => key));
  return Object.entries(record.data || {}).filter(([field, value]) => {
    if (hiddenDetailFields.has(field) || summaryFields.has(field) || !hasInformation(value)) return false;
    if (isRedundantNormalizedField(field, record.data || {})) return false;
    if (field === 'anos_registrados') {
      const years = Array.isArray(value) ? value : [value];
      if (years.length === 1 && String(years[0]) === String(record.data?.ano)) return false;
    }
    return true;
  });
};

const statusLabels = {
  PENDENTE: 'Pendente',
  APROVADA: 'Aprovada',
  REJEITADA: 'Rejeitada',
  CANCELADA: 'Cancelada',
};

const RecordEditor = ({ record, onClose, onSubmit }) => {
  const fields = fieldsByType[record.entityType];
  const [values, setValues] = useState(() => Object.fromEntries(fields.map(({ key }) => [key, record.data?.[key] ?? ''])));
  const [justification, setJustification] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    const changes = {};
    fields.forEach(({ key, number }) => {
      const original = record.data?.[key] ?? '';
      const current = number && values[key] !== '' ? Number(values[key]) : values[key];
      if (String(current) !== String(original)) changes[key] = current === '' ? null : current;
    });
    if (!Object.keys(changes).length) {
      setError('Altere ao menos um campo antes de enviar.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSubmit(changes, justification);
      onClose();
    } catch (submitError) {
      setError(submitError.message || 'Não foi possível enviar a correção.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="record-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="record-modal" role="dialog" aria-modal="true" aria-labelledby="record-editor-title" onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <div>
            <span>Correção auditável</span>
            <h3 id="record-editor-title">{titleOf(record)}</h3>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar">×</button>
        </header>
        <form onSubmit={submit}>
          {fields.map(({ key, label, number }) => (
            <label key={key}>
              {label}
              <input
                type={number ? 'number' : 'text'}
                value={values[key]}
                onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
              />
            </label>
          ))}
          <label>
            Justificativa
            <textarea
              value={justification}
              onChange={(event) => setJustification(event.target.value)}
              minLength={10}
              required
              placeholder="Explique o motivo da alteração (mínimo de 10 caracteres)."
            />
          </label>
          {error && <p className="workspace-error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="secondary-action" onClick={onClose}>Cancelar</button>
            <button type="submit" disabled={saving}>{saving ? 'Enviando...' : 'Enviar para revisão'}</button>
          </div>
        </form>
      </section>
    </div>
  );
};

const SuggestionsPanel = ({ isCoordination, request, refreshToken, onRecordChanged }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [decision, setDecision] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    const endpoint = isCoordination ? '/api/suggestions/coordination' : '/api/suggestions/mine';
    return request(endpoint)
      .then(setSuggestions)
      .catch((loadError) => setError(loadError.message || 'Não foi possível carregar as sugestões.'))
      .finally(() => setLoading(false));
  }, [isCoordination, request]);

  useEffect(() => { load(); }, [load, refreshToken]);

  const decide = async (event) => {
    event.preventDefault();
    try {
      await request(`/api/suggestions/${decision.id}/decision`, {
        method: 'POST',
        body: JSON.stringify({ type: decision.type, justification: decision.justification }),
      });
      setDecision(null);
      await load();
      onRecordChanged();
    } catch (decisionError) {
      setError(decisionError.message || 'Não foi possível registrar a decisão.');
    }
  };

  return (
    <section className="suggestions-panel">
      <div className="workspace-section-heading">
        <div>
          <h2>{isCoordination ? 'Revisão de sugestões' : 'Minhas sugestões'}</h2>
          <p>{isCoordination ? 'Aprovações geram correções preservadas nas próximas importações.' : 'Acompanhe o resultado das correções que você enviou.'}</p>
        </div>
        <button type="button" className="secondary-action" onClick={load}>Atualizar</button>
      </div>
      {loading && <p>Carregando sugestões...</p>}
      {error && <p className="workspace-error" role="alert">{error}</p>}
      {!loading && !suggestions.length && <p>Nenhuma sugestão registrada.</p>}
      <div className="suggestion-list">
        {suggestions.map((item) => (
          <article key={item.id}>
            <div className="suggestion-title">
              <strong>{entityTypeLabels[item.tipoEntidade] || item.tipoEntidade}</strong>
              <span className={`status-pill status-${item.status.toLowerCase()}`}>{statusLabels[item.status] || item.status}</span>
            </div>
              {item.autor && <p>Enviada por {item.autor.nome ? formatPersonName(item.autor.nome) : item.autor.email}</p>}
            <p>{item.justificativa}</p>
            <dl className="changes-list">
              {Object.entries(item.alteracoes || {}).map(([field, value]) => (
                <div key={field}><dt>{fieldLabel(field)}</dt><dd>{displayValue(value, field)}</dd></div>
              ))}
            </dl>
            {isCoordination && item.status === 'PENDENTE' && (
              <div className="decision-actions">
                <button type="button" onClick={() => setDecision({ id: item.id, type: 'APROVACAO', justification: '' })}>Aprovar</button>
                <button type="button" className="danger-action" onClick={() => setDecision({ id: item.id, type: 'REJEICAO', justification: '' })}>Rejeitar</button>
              </div>
            )}
          </article>
        ))}
      </div>
      {decision && (
        <div className="record-modal-backdrop" role="presentation" onMouseDown={() => setDecision(null)}>
          <form className="record-modal decision-modal" onSubmit={decide} onMouseDown={(event) => event.stopPropagation()}>
            <h3>{decision.type === 'APROVACAO' ? 'Aprovar correção' : 'Rejeitar correção'}</h3>
            <label>
              Justificativa da decisão
              <textarea
                required
                minLength={10}
                value={decision.justification}
                onChange={(event) => setDecision((current) => ({ ...current, justification: event.target.value }))}
              />
            </label>
            <div className="modal-actions">
              <button type="button" className="secondary-action" onClick={() => setDecision(null)}>Cancelar</button>
              <button type="submit">Confirmar decisão</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};

const RecordsWorkspace = ({ isCoordination, request }) => {
  const [activeType, setActiveType] = useState('PRODUCAO');
  const [records, setRecords] = useState([]);
  const [query, setQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [facultyFilter, setFacultyFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [detailFilters, setDetailFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const loadRecords = useCallback(() => {
    setLoading(true);
    setError('');
    const scope = isCoordination ? 'coordination' : 'faculty';
    return request(`/api/records/${scope}?type=${activeType}`)
      .then(setRecords)
      .catch((loadError) => {
        setRecords([]);
        setError(loadError.status === 404
          ? 'A API publicada ainda não possui a consulta de registros detalhados. Atualize o backend e tente novamente.'
          : loadError.message || 'Não foi possível carregar os registros.');
      })
      .finally(() => setLoading(false));
  }, [activeType, isCoordination, request]);

  useEffect(() => { loadRecords(); }, [loadRecords, refreshToken]);

  useEffect(() => {
    setFacultyFilter('all');
    setYearFilter('all');
    setDetailFilters({});
  }, [activeType]);

  const facultyOptions = useMemo(() => records.flatMap((record) =>
    (record.faculty || []).map(({ idExterno, nome }) => ({ value: idExterno, label: formatPersonName(nome) })))
    .reduce((options, option) => {
      if (!options.some(({ value }) => value === option.value)) options.push(option);
      return options;
    }, [])
    .sort((left, right) => left.label.localeCompare(right.label, 'pt-BR')), [records]);

  const yearOptions = useMemo(() => uniqueOptions(records.flatMap(yearsOf)).reverse(), [records]);

  const detailFilterOptions = useMemo(() => Object.fromEntries(
    (filtersByType[activeType] || []).map(({ key }) => [
      key,
      uniqueOptions(records.flatMap((record) => valuesOf(record, key))),
    ]),
  ), [activeType, records]);

  const visibleRecords = useMemo(() => records
    .filter((record) => !query || searchableText(record).includes(query.toLocaleLowerCase('pt-BR')))
    .filter((record) => visibilityFilter === 'all'
      || (visibilityFilter === 'hidden' ? record.visibility.hidden : !record.visibility.hidden))
    .filter((record) => facultyFilter === 'all'
      || record.faculty?.some(({ idExterno }) => idExterno === facultyFilter))
    .filter((record) => yearFilter === 'all' || yearsOf(record).includes(yearFilter))
    .filter((record) => Object.entries(detailFilters)
      .every(([field, value]) => value === 'all' || valuesOf(record, field).includes(value))), [
    records, query, visibilityFilter, facultyFilter, yearFilter, detailFilters,
  ]);

  const clearFilters = () => {
    setQuery('');
    setVisibilityFilter('all');
    setFacultyFilter('all');
    setYearFilter('all');
    setDetailFilters({});
  };

  const updateVisibility = async (record) => {
    const scope = isCoordination ? 'coordination' : 'faculty';
    try {
      await request(`/api/visibility/${scope}/${record.entityType}/${encodeURIComponent(record.externalId)}`, {
        method: 'PATCH',
        body: JSON.stringify({ hidden: !record.visibility.hidden }),
      });
      await loadRecords();
    } catch (updateError) {
      setError(updateError.message || 'Não foi possível alterar a visibilidade.');
    }
  };

  const submitSuggestion = async (record, changes, justification) => {
    await request('/api/suggestions', {
      method: 'POST',
      body: JSON.stringify({ entityType: record.entityType, externalRecordId: record.externalId, changes, justification }),
    });
    setRefreshToken((value) => value + 1);
  };

  return (
    <section className="records-workspace">
      <div className="workspace-section-heading">
        <div>
          <h2>Dados detalhados</h2>
          <p>Consulte as flags de cada registro, controle sua exibição e proponha correções.</p>
        </div>
      </div>
      <div className="record-tabs" role="tablist" aria-label="Tipos de registro">
        {recordTypes.map((type) => (
          <button key={type.value} type="button" role="tab" aria-selected={activeType === type.value} onClick={() => setActiveType(type.value)}>
            {type.label}
          </button>
        ))}
      </div>
      <div className="record-filter-panel">
        <div className="record-filters">
          <label className="record-search-filter">
            <span>Buscar</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Título, pessoa ou outra informação" />
          </label>
          {isCoordination && (
            <label>
              <span>Docente</span>
              <select value={facultyFilter} onChange={(event) => setFacultyFilter(event.target.value)}>
                <option value="all">Todos os docentes</option>
                {facultyOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
          )}
          <label>
            <span>Ano</span>
            <select value={yearFilter} onChange={(event) => setYearFilter(event.target.value)}>
              <option value="all">Todos os anos</option>
              {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </label>
          {(filtersByType[activeType] || []).map(({ key, label, placeholder }) => (
            <label key={key}>
              <span>{label}</span>
              <select
                value={detailFilters[key] || 'all'}
                onChange={(event) => setDetailFilters((current) => ({ ...current, [key]: event.target.value }))}
              >
                <option value="all">{placeholder}</option>
                {(detailFilterOptions[key] || []).map((value) => (
                  <option key={value} value={value}>{displayValue(value, key)}</option>
                ))}
              </select>
            </label>
          ))}
          <label>
            <span>Visibilidade</span>
            <select value={visibilityFilter} onChange={(event) => setVisibilityFilter(event.target.value)}>
              <option value="all">Todos os registros</option>
              <option value="visible">Visíveis</option>
              <option value="hidden">Ocultos</option>
            </select>
          </label>
        </div>
        <div className="record-filter-summary" aria-live="polite">
          <span>{visibleRecords.length} de {records.length} registros</span>
          <button type="button" className="filter-clear-button" onClick={clearFilters}>Limpar filtros</button>
        </div>
      </div>
      {loading && <p>Carregando registros...</p>}
      {error && <p className="workspace-error" role="alert">{error}</p>}
      {!loading && !error && !visibleRecords.length && <p>Nenhum registro corresponde aos filtros.</p>}
      <div className="records-grid">
        {visibleRecords.map((record) => (
          <article className={record.visibility.hidden ? 'record-card is-hidden' : 'record-card'} key={record.externalId}>
            <div className="record-card-heading">
              <div>
                <h3>{titleOf(record)}</h3>
              </div>
              <span className={record.visibility.hidden ? 'visibility-pill hidden' : 'visibility-pill'}>
                {record.visibility.hidden ? 'Oculto' : 'Visível'}
              </span>
            </div>
            <dl className="record-details">
              {fieldsByType[record.entityType].filter(({ key }) => key !== 'titulo' && key !== 'orientando' && hasInformation(record.data?.[key])).map(({ key, label }) => (
                <div key={key}><dt>{label}</dt><dd>{displayValue(record.data?.[key], key)}</dd></div>
              ))}
              {record.faculty?.length > 0 && <div><dt>Docentes</dt><dd>{record.faculty.map((item) => formatPersonName(item.nome)).join(', ')}</dd></div>}
            </dl>
            <div className="flag-list" aria-label="Critérios de visibilidade">
              <span>{record.visibility.defaultVisible ? 'Exibição padrão' : 'Fora da exibição padrão'}</span>
              <span>{record.visibility.canHide ? 'Pode ser ocultado' : 'Exibição obrigatória'}</span>
              {isCoordination && <span>{record.visibility.publicVisible ? 'Disponível na API pública' : 'Não exibido na API pública'}</span>}
              {isCoordination && record.visibility.publicEligible && (
                <span>{record.visibility.publicDefaultVisible ? 'Exibição pública padrão' : 'Fora da exibição pública padrão'}</span>
              )}
              {!isCoordination && record.visibility.hiddenByCoordination && <span>Oculto pela coordenação</span>}
            </div>
            {complementaryDetails(record).length > 0 && (
              <details className="all-record-details">
                <summary>Ver informações complementares</summary>
                <dl>
                  {complementaryDetails(record).map(([field, value]) => (
                    <div key={field}><dt>{fieldLabel(field)}</dt><dd>{displayValue(value, field)}</dd></div>
                  ))}
                </dl>
              </details>
            )}
            <div className="record-actions">
              <button type="button" onClick={() => setEditing(record)}>Sugerir correção</button>
              <button
                type="button"
                className="secondary-action"
                disabled={!record.visibility.canHide && !record.visibility.hidden}
                title={!record.visibility.canHide && !record.visibility.hidden ? 'O contrato dos dados não permite ocultar este registro.' : ''}
                onClick={() => updateVisibility(record)}
              >
                {record.visibility.hidden ? 'Reexibir' : 'Ocultar'}
              </button>
            </div>
          </article>
        ))}
      </div>
      {editing && <RecordEditor record={editing} onClose={() => setEditing(null)} onSubmit={(changes, justification) => submitSuggestion(editing, changes, justification)} />}
      <SuggestionsPanel isCoordination={isCoordination} request={request} refreshToken={refreshToken} onRecordChanged={() => setRefreshToken((value) => value + 1)} />
    </section>
  );
};

export default RecordsWorkspace;
