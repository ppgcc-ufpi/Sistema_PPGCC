import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import ProducoesDocenteQuadrienioChart from './ProducoesDocenteQuadrienioChart';
import ProducoesParetoDocenteChart from './ProducoesParetoDocenteChart';
import {
  getAnosProducoes,
  getQuadrieniosDisponiveis,
  loadLattesData,
  processParetoProducoesPorDocenteQuadrienio,
  processProducoesPorDocenteQuadrienio,
} from '../../utils/lattesDataProcessor';
import './VisaoGeralLattes.css';

const emptyQuadrienioData = {
  categories: [],
  series: [],
  anos: [],
  totalProducoes: 0,
  docentesAtivos: 0,
};

const emptyParetoData = {
  categories: [],
  producoes: [],
  acumuladoPercentual: [],
  totalProducoes: 0,
  docentesAtivos: 0,
  docentesPareto80: 0,
};

const selectStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    cursor: 'pointer',
    '&:hover': { borderColor: 'rgba(255, 255, 255, 0.2)' },
  }),
  input: (provided) => ({ ...provided, color: '#fff' }),
  singleValue: (provided) => ({ ...provided, color: '#fff' }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#202641',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? 'var(--clr-pumpkin)'
      : state.isFocused
        ? 'rgba(255, 255, 255, 0.1)'
        : '#202641',
    color: '#fff',
    cursor: 'pointer',
    '&:active': { backgroundColor: 'var(--clr-pumpkin)' },
  }),
};

const VisaoGeralLattes = () => {
  const [data, setData] = useState(null);
  const [modoVisualizacao, setModoVisualizacao] = useState('quadrienio');
  const [quadrienios, setQuadrienios] = useState([]);
  const [selectedQuadrienio, setSelectedQuadrienio] = useState(null);
  const [dadosQuadrienio, setDadosQuadrienio] = useState(emptyQuadrienioData);
  const [dadosPareto, setDadosPareto] = useState(emptyParetoData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const modosVisualizacao = [
    { value: 'quadrienio', label: 'Produção por docente no quadriênio' },
    { value: 'pareto', label: 'Curva de Pareto da produção por docente' },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedData = await loadLattesData();
        if (!loadedData) throw new Error('Dados de Lattes indisponíveis');

        const options = getQuadrieniosDisponiveis(
          getAnosProducoes(loadedData),
          2013,
          2026,
        ).map((ano) => ({ value: ano, label: `${ano} - ${ano + 3}` }));

        setData(loadedData);
        setQuadrienios(options);
        setSelectedQuadrienio(options[options.length - 1] || null);
      } catch (err) {
        console.error('Erro ao carregar a visão geral de currículos:', err);
        setError('Não foi possível carregar os indicadores gerais de currículos.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!data || !selectedQuadrienio) {
      setDadosQuadrienio(emptyQuadrienioData);
      setDadosPareto(emptyParetoData);
      return;
    }

    setDadosQuadrienio(
      processProducoesPorDocenteQuadrienio(data, selectedQuadrienio.value),
    );
    setDadosPareto(
      processParetoProducoesPorDocenteQuadrienio(data, selectedQuadrienio.value),
    );
  }, [data, selectedQuadrienio]);

  return (
    <section className="visao-geral-lattes" aria-labelledby="visao-geral-lattes-title">
      <div className="visao-geral-lattes__header">
        <div>
          <h2 id="visao-geral-lattes-title">Visão geral da produção docente</h2>
          <p>Indicadores consolidados do programa por quadriênio</p>
        </div>

        <div className="visao-geral-lattes__filters">
          <div className="visao-geral-lattes__filter visao-geral-lattes__filter--mode">
            <label htmlFor="producao-modo-select">Modo de visualização</label>
            <Select
              inputId="producao-modo-select"
              options={modosVisualizacao}
              value={modosVisualizacao.find((option) => option.value === modoVisualizacao)}
              onChange={(option) => setModoVisualizacao(option?.value || 'quadrienio')}
              styles={selectStyles}
              placeholder="Selecione..."
              isSearchable={false}
            />
          </div>

          <div className="visao-geral-lattes__filter">
            <label htmlFor="producao-quadrienio-select">Quadriênio</label>
            <Select
              inputId="producao-quadrienio-select"
              options={quadrienios}
              value={selectedQuadrienio}
              onChange={setSelectedQuadrienio}
              styles={selectStyles}
              placeholder="Selecione..."
              isSearchable={false}
              isDisabled={loading || quadrienios.length === 0}
            />
          </div>
        </div>
      </div>

      {loading && <div className="visao-geral-lattes__message">Carregando indicadores...</div>}
      {error && <div className="visao-geral-lattes__message visao-geral-lattes__message--error">{error}</div>}

      {!loading && !error && (
        <>
          {modoVisualizacao === 'quadrienio' && (
            <div className="visao-geral-lattes__chart">
              <ProducoesDocenteQuadrienioChart
                dadosQuadrenio={dadosQuadrienio}
                chartName={`Produção por Docente no Quadriênio ${selectedQuadrienio?.label || ''}`}
              />
            </div>
          )}

          {modoVisualizacao === 'pareto' && (
            <div className="visao-geral-lattes__chart">
              <ProducoesParetoDocenteChart
                dadosPareto={dadosPareto}
                chartName={`Curva de Pareto da Produção por Docente (${selectedQuadrienio?.label || ''})`}
              />
            </div>
          )}

          <div className="visao-geral-lattes__statistics">
            <div className="visao-geral-lattes__stat">
              <span>Total de produções</span>
              <strong>{dadosQuadrienio.totalProducoes}</strong>
            </div>
            <div className="visao-geral-lattes__stat">
              <span>Docentes com produção</span>
              <strong>{dadosQuadrienio.docentesAtivos}</strong>
            </div>
            {modoVisualizacao === 'quadrienio' ? (
              <div className="visao-geral-lattes__stat">
                <span>Total de docentes</span>
                <strong>{dadosQuadrienio.categories.length}</strong>
              </div>
            ) : (
              <div className="visao-geral-lattes__stat">
                <span>Docentes até 80% da produção</span>
                <strong>{dadosPareto.docentesPareto80}</strong>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default VisaoGeralLattes;
