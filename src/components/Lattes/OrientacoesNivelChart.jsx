import React from 'react';
import Chart from 'react-apexcharts';
import { prepareDadosOrientacoesPorNivel } from '../../utils/lattesDataProcessor';

const OrientacoesNivelChart = ({ orientacoesPorNivel, chartName = 'Orientações por Nível' }) => {
  const { series, categories } = prepareDadosOrientacoesPorNivel(orientacoesPorNivel || {});

  const total = series && series.length ? series.reduce((sum, s) => sum + s.data.reduce((a, b) => a + b, 0), 0) : 0;

  if (!categories || categories.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        Sem dados de orientações por nível disponíveis
      </div>
    );
  }

  const maxY = Math.max(0, ...series.flatMap((serie) => serie.data));
  const maxYCeil = Math.max(1, Math.ceil(maxY));
  const desiredTickCount = 6;
  const useCompactTicks = maxYCeil > desiredTickCount;
  const yTickAmount = useCompactTicks ? desiredTickCount : maxYCeil;
  const yStep = useCompactTicks ? Math.ceil(maxYCeil / desiredTickCount) : 1;
  const yMax = yStep * yTickAmount;

  const options = {
    chart: {
      type: 'bar',
      height: 350,
      stacked: true,
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
      },
    },
    dataLabels: {
      enabled: categories.length <= 6,
      style: { colors: ['#fff'] },
    },
    xaxis: {
      categories,
      labels: { style: { colors: '#B0C4DE' } },
    },
    yaxis: {
      min: 0,
      max: yMax,
      tickAmount: yTickAmount,
      labels: { style: { colors: '#B0C4DE' }, formatter: (val) => `${Math.round(val)}` },
    },
    fill: { opacity: 1 },
    colors: ['#F59E0B', '#10B981'],
    title: { text: chartName, align: 'left', style: { color: '#B0C4DE', fontSize: '18px', fontWeight: 'bold' } },
    legend: { labels: { colors: '#B0C4DE' } },
    tooltip: { theme: 'dark', y: { formatter: (val) => Math.round(val) } },
  };

  return (
    <div style={{ width: '100%', height: '400px', background: '#1a1f3a', borderRadius: '8px', padding: '20px' }}>
      <div style={{ marginBottom: '8px', color: '#B0C4DE' }}>{chartName} — Total: {total}</div>
      <Chart options={options} series={series} type="bar" height={350} />
    </div>
  );
};

export default OrientacoesNivelChart;
