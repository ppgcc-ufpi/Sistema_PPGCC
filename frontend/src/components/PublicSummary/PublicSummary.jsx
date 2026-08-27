import { useEffect, useState } from 'react';
import { PROGRAM_ID } from '../../config/api';
import { publicRequest } from '../../services/apiClient';
import { loadPublicData } from '../../services/publicDataService';
import PublicOverviewCharts from './PublicOverviewCharts';
import './PublicSummary.css';

const PublicSummary = () => {
  const [summary, setSummary] = useState(null);
  const [publicData, setPublicData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30_000);

    Promise.all([
      publicRequest(`/api/public/dashboard?program=${encodeURIComponent(PROGRAM_ID)}`, {
        signal: controller.signal,
      }),
      loadPublicData(),
    ])
      .then(([dashboard, detailedData]) => {
        if (active) {
          setSummary(dashboard);
          setPublicData(detailedData);
        }
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
  if (!summary || !publicData) return <p className="public-summary-loading">Carregando dados atualizados...</p>;

  return (
    <section className="public-summary" aria-label="Visão geral do programa">
      <PublicOverviewCharts data={publicData} sucupiraLastValidatedYear={summary.sucupiraLastValidatedYear} />
    </section>
  );
};

export default PublicSummary;
