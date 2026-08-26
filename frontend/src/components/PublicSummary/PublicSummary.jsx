import { useEffect, useState } from 'react';
import { PROGRAM_ID } from '../../config/api';
import { publicRequest } from '../../services/apiClient';
import './PublicSummary.css';

const labels = {
  faculty: 'Docentes',
  productions: 'Produções públicas',
  advising: 'Orientações públicas',
  projects: 'Projetos públicos',
  education: 'Formações',
};

const loadFallback = async () => {
  const response = await fetch(`${process.env.PUBLIC_URL}/dados/metadados.json`);
  if (!response.ok) throw new Error('Snapshot público indisponível.');
  const metadata = await response.json();
  const counts = metadata?.contagens || {};
  return {
    faculty: counts.docentes,
    productions: counts.producoes,
    advising: counts.orientacoes,
    projects: counts.projetos,
    education: counts.formacoes,
  };
};

const PublicSummary = () => {
  const [summary, setSummary] = useState(null);
  const [source, setSource] = useState('api');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10_000);

    publicRequest(`/api/public/dashboard?program=${encodeURIComponent(PROGRAM_ID)}`, {
      signal: controller.signal,
    })
      .then((data) => {
        if (active) setSummary(data);
      })
      .catch(async () => {
        if (!active) return;
        try {
          const fallback = await loadFallback();
          if (active) {
            setSummary(fallback);
            setSource('snapshot');
          }
        } catch {
          if (active) setError('Não foi possível carregar o resumo do programa.');
        }
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, []);

  if (error) return <p className="public-summary-error">{error}</p>;
  if (!summary) return <p className="public-summary-loading">Carregando dados atualizados...</p>;

  return (
    <section className="public-summary" aria-labelledby="public-summary-title">
      <div className="public-summary-heading">
        <div>
          <h2 id="public-summary-title">Visão geral do programa</h2>
          <p>Dados públicos consolidados do PPGCC/UFPI.</p>
        </div>
        <span className={`public-summary-source ${source}`}>
          {source === 'api' ? 'API atualizada' : 'Snapshot de segurança'}
        </span>
      </div>
      <div className="public-summary-grid">
        {Object.keys(labels).map((key) => (
          <article key={key}>
            <strong>{summary[key] ?? 0}</strong>
            <span>{labels[key]}</span>
          </article>
        ))}
      </div>
    </section>
  );
};

export default PublicSummary;
