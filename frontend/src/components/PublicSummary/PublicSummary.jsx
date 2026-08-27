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

const PublicSummary = () => {
  const [summary, setSummary] = useState(null);
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
      .catch(() => {
        if (active) setError('Não foi possível consultar a API do programa.');
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
        <span className="public-summary-source">API atualizada</span>
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
