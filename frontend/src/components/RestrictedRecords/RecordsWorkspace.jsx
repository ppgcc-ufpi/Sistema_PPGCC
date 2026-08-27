import { useCallback, useEffect, useMemo, useState } from 'react';

const recordTypes = [
  { value: 'PRODUCAO', label: 'Produções' },
  { value: 'ORIENTACAO', label: 'Orientações' },
  { value: 'PROJETO', label: 'Projetos' },
];

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

const titleOf = (record) => record.data?.titulo || record.data?.orientando || record.externalId;

const searchableText = (record) => JSON.stringify(record.data || {}).toLocaleLowerCase('pt-BR');

const displayValue = (value) => {
  if (value === null || value === undefined || value === '') return 'Não informado';
  if (Array.isArray(value)) return value.length ? value.join(', ') : 'Não informado';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const fieldLabel = (field) => field
  .replaceAll('_', ' ')
  .replace(/^./, (letter) => letter.toLocaleUpperCase('pt-BR'));

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
              <strong>{item.tipoEntidade} · {item.registroIdExterno}</strong>
              <span className={`status-pill status-${item.status.toLowerCase()}`}>{statusLabels[item.status] || item.status}</span>
            </div>
            {item.autor && <p>Enviada por {item.autor.nome || item.autor.email}</p>}
            <p>{item.justificativa}</p>
            <dl className="changes-list">
              {Object.entries(item.alteracoes || {}).map(([field, value]) => (
                <div key={field}><dt>{field}</dt><dd>{displayValue(value)}</dd></div>
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

  const visibleRecords = useMemo(() => records
    .filter((record) => !query || searchableText(record).includes(query.toLocaleLowerCase('pt-BR')))
    .filter((record) => visibilityFilter === 'all'
      || (visibilityFilter === 'hidden' ? record.visibility.hidden : !record.visibility.hidden)), [records, query, visibilityFilter]);

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
      <div className="record-filters">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar nos registros" aria-label="Buscar nos registros" />
        <select value={visibilityFilter} onChange={(event) => setVisibilityFilter(event.target.value)} aria-label="Filtrar visibilidade">
          <option value="all">Todos</option>
          <option value="visible">Visíveis</option>
          <option value="hidden">Ocultos</option>
        </select>
      </div>
      {loading && <p>Carregando registros...</p>}
      {error && <p className="workspace-error" role="alert">{error}</p>}
      {!loading && !error && !visibleRecords.length && <p>Nenhum registro corresponde aos filtros.</p>}
      <div className="records-grid">
        {visibleRecords.map((record) => (
          <article className={record.visibility.hidden ? 'record-card is-hidden' : 'record-card'} key={record.externalId}>
            <div className="record-card-heading">
              <div>
                <span>{record.externalId}</span>
                <h3>{titleOf(record)}</h3>
              </div>
              <span className={record.visibility.hidden ? 'visibility-pill hidden' : 'visibility-pill'}>
                {record.visibility.hidden ? 'Oculto' : 'Visível'}
              </span>
            </div>
            <dl className="record-details">
              {fieldsByType[record.entityType].filter(({ key }) => key !== 'titulo' && key !== 'orientando').map(({ key, label }) => (
                <div key={key}><dt>{label}</dt><dd>{displayValue(record.data?.[key])}</dd></div>
              ))}
              {record.faculty?.length > 0 && <div><dt>Docentes</dt><dd>{record.faculty.map((item) => item.nome).join(', ')}</dd></div>}
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
            <details className="all-record-details">
              <summary>Ver todos os detalhes integrados</summary>
              <dl>
                {Object.entries(record.data || {}).map(([field, value]) => (
                  <div key={field}><dt>{fieldLabel(field)}</dt><dd>{displayValue(value)}</dd></div>
                ))}
              </dl>
            </details>
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
