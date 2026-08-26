import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import ProducoesChart from './ProducoesChart';
import ProducoesSerieTemporalChart from './ProducoesSerieTemporalChart';
import OrientacoesChart from './OrientacoesChart';
import OrientacoesNivelChart from './OrientacoesNivelChart';
import ProjetosChart from './ProjetosChart';
import ProducaoOrientacoesScatterChart from './ProducaoOrientacoesScatterChart';
import {
  loadLattesData,
  getListaDocentes,
  findDocente,
  getDocenteInfo,
  processProducoes,
  processProducoesPorAnoETipo,
  processOrientacoes,
  processOrientacoesPorNivel,
  processProjectos,
  processProducaoOrientacoesDocenteScatter,
} from '../../utils/lattesDataProcessor';
import './CurriculoDocente.css';

const CurriculoDocente = () => {
  const [data, setData] = useState(null);
  const [docentes, setDocentes] = useState([]);
  const [selectedDocente, setSelectedDocente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [producoesPorAno, setProducoesPorAno] = useState({});
  const [producoesPorAnoTipo, setProducoesPorAnoTipo] = useState({});
  const [orientacoesPorAno, setOrientacoesPorAno] = useState({});
  const [orientacoesPorNivel, setOrientacoesPorNivel] = useState({});
  const [projetosPorAno, setProjetosPorAno] = useState({});
  const [formacao, setFormacao] = useState([]);
  const [producaoOrientacoesScatter, setProducaoOrientacoesScatter] = useState({
    docenteData: [],
    maxProducoes: 0,
    maxOrientacoes: 0,
    nome: 'Docente',
  });

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
      setProducoesPorAnoTipo({});
      setOrientacoesPorAno({});
      setProjetosPorAno({});
      setFormacao([]);
      setProducaoOrientacoesScatter({
        docenteData: [],
        maxProducoes: 0,
        maxOrientacoes: 0,
        nome: 'Docente',
      });
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

      // Processa série temporal de produções por tipo
      const prodsPorTipo = processProducoesPorAnoETipo(info.producoes);
      setProducoesPorAnoTipo(prodsPorTipo);

      // Processa formação
      setFormacao(Array.isArray(info.formacao) ? info.formacao : []);

      // Processa orientações
      const ors = processOrientacoes(info.orientacoes);
      setOrientacoesPorAno(ors);
      // Processa orientações por nível (barras)
      const orsPorNivel = processOrientacoesPorNivel(info.orientacoes);
      setOrientacoesPorNivel(orsPorNivel);

      // Processa projetos
      const projs = processProjectos(info.projetos);
      setProjetosPorAno(projs);

      // Processa scatter plot produção × orientações concluídas
      const scatterData = processProducaoOrientacoesDocenteScatter(docente);
      setProducaoOrientacoesScatter(scatterData);

      setError(null);
    } catch (err) {
      console.error('Erro ao processar docente:', err);
      setError('Erro ao processar dados do docente');
    }
  }, [selectedDocente, data]);

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      color: '#fff',
      cursor: 'pointer',
      '&:hover': {
        borderColor: 'rgba(255, 255, 255, 0.2)',
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
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? 'var(--clr-pumpkin)' : state.isFocused ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.5)',
      color: '#fff',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: 'var(--clr-pumpkin)',
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
        <div className="selector-grid">
          <div className="selector-field">
            <label htmlFor="docente-select">Selecione um professor:</label>
            <Select
              inputId="docente-select"
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
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {selectedDocente && (
        <div className="curriculo-content">
          <div className="curriculo-info">
            <h2>{selectedDocente.label}</h2>

            <div className="formacao-section">
              <h3>Formação</h3>

              {formacao.length > 0 ? (
                <ul className="formacao-list">
                  {formacao.map((item, index) => {
                    const nivel = item['nível'] || item.nivel || 'Formação';
                    const instituicao = item['instituição'] || item.instituicao || 'Instituição não informada';
                    const anoInicio = item.ano_inicio;
                    const anoConclusao = item.ano_conclusao;

                    let periodo = 'Período não informado';
                    if (anoInicio && anoConclusao) periodo = `${anoInicio} - ${anoConclusao}`;
                    else if (anoInicio) periodo = `Início: ${anoInicio}`;
                    else if (anoConclusao) periodo = `Conclusão: ${anoConclusao}`;

                    return (
                      <li className="formacao-item" key={`${selectedDocente.id}-formacao-${index}`}>
                        <div className="formacao-nivel">{nivel}</div>
                        <div className="formacao-instituicao">{instituicao}</div>
                        <div className="formacao-periodo">{periodo}</div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="formacao-empty">Formação não informada no currículo.</p>
              )}
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-container">
              <ProducoesChart 
                producoesPorAno={producoesPorAno}
                chartName="Produções por Ano"
              />
            </div>

            <div className="chart-container">
              <ProducoesSerieTemporalChart
                producoesPorAnoTipo={producoesPorAnoTipo}
                chartName="Série Temporal de Produção por Ano e Tipo"
              />
            </div>

            <div className="chart-container">
              <OrientacoesChart
                orientacoesPorAno={orientacoesPorAno}
                chartName="Orientações por Ano"
              />
            </div>

            <div className="chart-container">
              <OrientacoesNivelChart
                orientacoesPorNivel={orientacoesPorNivel}
                chartName="Orientações por Nível"
              />
            </div>

            <div className="chart-container">
              <ProjetosChart
                projetosPorAno={projetosPorAno}
                chartName="Projetos por Ano"
              />

              </div>

              <div className="chart-container">
                <ProducaoOrientacoesScatterChart
                  docenteData={producaoOrientacoesScatter.docenteData}
                  maxProducoes={producaoOrientacoesScatter.maxProducoes}
                  maxOrientacoes={producaoOrientacoesScatter.maxOrientacoes}
                  docente={producaoOrientacoesScatter.nome}
                  chartName="Produção × Orientações Concluídas"
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
