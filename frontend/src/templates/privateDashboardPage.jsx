import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import RecordsWorkspace from '../components/RestrictedRecords/RecordsWorkspace';
import './restrictedArea.css';

const labels = {
  faculty: 'Docentes',
  productions: 'Produções',
  advising: 'Orientações',
  projects: 'Projetos',
};

const PrivateDashboardPage = ({ role }) => {
  const { user, logout, request } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const isCoordination = role === 'COORDENACAO';
  const visibleMetrics = Object.entries(labels).filter(([key]) => isCoordination || key !== 'faculty');

  useEffect(() => {
    let active = true;
    const endpoint = isCoordination
      ? '/api/dashboards/coordination'
      : '/api/dashboards/faculty';

    request(endpoint)
      .then((data) => {
        if (active) setDashboard(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Não foi possível carregar o dashboard.');
      });

    return () => {
      active = false;
    };
  }, [isCoordination, request]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  return (
    <main className="restricted-page private-dashboard">
      <header className="private-header">
        <div>
          <p className="restricted-eyebrow">{isCoordination ? 'Coordenação' : 'Docente'}</p>
          <h1>{isCoordination ? 'Visão da coordenação' : 'Minha visão docente'}</h1>
          <p>{user?.nome || user?.email}</p>
        </div>
        <div className="private-actions">
          <button type="button" className="secondary" onClick={() => navigate('/dashboard')}>
            Dashboards públicos
          </button>
          <button type="button" onClick={handleLogout}>Sair</button>
        </div>
      </header>

      {error && <p className="restricted-error private-error" role="alert">{error}</p>}
      {!dashboard && !error && <p className="private-loading">Carregando dados protegidos...</p>}
      {dashboard && (
        <section className={`private-metrics ${isCoordination ? 'coordination-metrics' : 'faculty-metrics'}`} aria-label="Indicadores privados">
          {visibleMetrics.map(([key, label]) => (
            <article key={key}>
              <span>{label}</span>
              <strong>{dashboard[key] ?? 0}</strong>
            </article>
          ))}
        </section>
      )}

      <RecordsWorkspace isCoordination={isCoordination} request={request} />
    </main>
  );
};

export default PrivateDashboardPage;
