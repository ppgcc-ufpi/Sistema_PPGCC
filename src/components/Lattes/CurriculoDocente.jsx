import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import ProducoesChart from './ProducoesChart';
import OrientacoesChart from './OrientacoesChart';
import ProjetosChart from './ProjetosChart';
import {
  loadLattesData,
  getListaDocentes,
  findDocente,
  getDocenteInfo,
  processProducoes,
  processOrientacoes,
  processProjectos,
} from '../../utils/lattesDataProcessor';
import './CurriculoDocente.css';

const CurriculoDocente = () => {
  const [data, setData] = useState(null);
  const [docentes, setDocentes] = useState([]);
  const [selectedDocente, setSelectedDocente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [producoesPorAno, setProducoesPorAno] = useState({});
  const [orientacoesPorAno, setOrientacoesPorAno] = useState({});
  const [projetosPorAno, setProjetosPorAno] = useState({});

  // Carrega dados do JSON ao montar o componente
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const loadedData = await loadLattesData();
        
        if (!loadedData) {
          setError('Erro ao carregar dados de Lattes');
          return;
        }
        
        setData(loadedData);
        const listaDocentes = getListaDocentes(loadedData);
        setDocentes(listaDocentes);
        
        // Seleciona o primeiro docente por padrão
        if (listaDocentes.length > 0) {
          setSelectedDocente(listaDocentes[0]);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados de Lattes');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Processa dados quando um docente é selecionado
  useEffect(() => {
    if (!selectedDocente || !data) {
      setProducoesPorAno({});
      setOrientacoesPorAno({});
      setProjetosPorAno({});
      return;
    }

    try {
      const docente = findDocente(data, selectedDocente.nome);
      if (!docente) {
        setError('Docente não encontrado');
        return;
      }

      const info = getDocenteInfo(docente);
      if (!info) {
        setError('Erro ao processar informações do docente');
        return;
      }

      // Processa produções
      const prods = processProducoes(info.producoes);
      setProducoesPorAno(prods);

      // Processa orientações
      const ors = processOrientacoes(info.orientacoes);
      setOrientacoesPorAno(ors);

      // Processa projetos
      const projs = processProjectos(info.projetos);
      setProjetosPorAno(projs);

      setError(null);
    } catch (err) {
      console.error('Erro ao processar docente:', err);
      setError('Erro ao processar dados do docente');
    }
  }, [selectedDocente, data]);

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: '#1a1f3a',
      borderColor: '#444',
      color: '#fff',
      cursor: 'pointer',
      '&:hover': {
        borderColor: '#666',
      },
    }),
    input: (provided) => ({
      ...provided,
      color: '#fff',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#fff',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#1a1f3a',
      borderColor: '#444',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#6366F1' : state.isFocused ? '#2a3050' : '#1a1f3a',
      color: '#fff',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: '#6366F1',
      },
    }),
  };

  if (loading) {
    return (
      <div className="curriculo-container">
        <div className="loading">Carregando dados de Lattes...</div>
      </div>
    );
  }

  if (error && docentes.length === 0) {
    return (
      <div className="curriculo-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="curriculo-container">
      <div className="curriculo-header">
        <h1>Análise de Currículos Lattes</h1>
        <p>Selecione um professor para visualizar suas métricas de produção</p>
      </div>

      <div className="curriculo-selector">
        <label htmlFor="docente-select">Selecione um professor:</label>
        <Select
          id="docente-select"
          options={docentes}
          value={selectedDocente}
          onChange={setSelectedDocente}
          styles={customSelectStyles}
          getOptionLabel={(option) => option.label}
          getOptionValue={(option) => option.id}
          placeholder="Escolha um professor..."
          isSearchable
        />
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {selectedDocente && (
        <div className="curriculo-content">
          <div className="curriculo-info">
            <h2>{selectedDocente.label}</h2>
          </div>

          <div className="charts-grid">
            <div className="chart-container">
              <ProducoesChart 
                producoesPorAno={producoesPorAno}
                chartName="Produções por Ano"
              />
            </div>

            <div className="chart-container">
              <OrientacoesChart
                orientacoesPorAno={orientacoesPorAno}
                chartName="Orientações por Ano"
              />
            </div>

            <div className="chart-container">
              <ProjetosChart
                projetosPorAno={projetosPorAno}
                chartName="Projetos por Ano"
              />
            </div>
          </div>

          <div className="statistics">
            <div className="stat-card">
              <div className="stat-label">Total de Produções</div>
              <div className="stat-value">
                {Object.values(producoesPorAno).reduce((sum, arr) => sum + arr.length, 0)}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Total de Orientações</div>
              <div className="stat-value">
                {Object.values(orientacoesPorAno).reduce((sum, obj) => sum + obj.total, 0)}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Total de Projetos</div>
              <div className="stat-value">
                {Object.values(projetosPorAno).reduce((sum, obj) => sum + obj.total, 0)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculoDocente;
