import React from 'react';
import Chart from 'react-apexcharts';
import { prepareDadosOrientacoesPorNivel } from '../../utils/lattesDataProcessor';
import './LattesCharts.css';

const OrientacoesNivelChart = ({ orientacoesPorNivel, chartName = 'Orientações por Nível' }) => {
  const { series, categories } = prepareDadosOrientacoesPorNivel(orientacoesPorNivel || {});

  if (!categories || categories.length === 0) {
    return (
      <div className="lattes-chart lattes-chart--empty">
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
    <div className="lattes-chart">
      <Chart options={options} series={series} type="bar" height={350} />
    </div>
  );
};

export default OrientacoesNivelChart;
