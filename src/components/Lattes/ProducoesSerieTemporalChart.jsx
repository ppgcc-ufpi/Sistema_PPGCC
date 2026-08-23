import React from 'react';
import Chart from 'react-apexcharts';
import './LattesCharts.css';

const ProducoesSerieTemporalChart = ({ producoesPorAnoTipo, chartName = 'Série Temporal de Produção por Tipo' }) => {
  const anos = Object.keys(producoesPorAnoTipo)
    .map((a) => parseInt(a, 10))
    .sort((a, b) => a - b);

  if (anos.length === 0) {
    return (
      <div className="lattes-chart lattes-chart--empty">
        Sem dados de produções por tipo disponíveis
      </div>
    );
  }

  const tipos = Array.from(
    new Set(
      anos.flatMap((ano) => Object.keys(producoesPorAnoTipo[ano] || {}))
    )
  ).sort((a, b) => a.localeCompare(b, 'pt-BR'));

  const series = tipos.map((tipo) => ({
    name: tipo,
    data: anos.map((ano) => producoesPorAnoTipo[ano]?.[tipo] || 0),
  }));
  const maxY = Math.max(
    0,
    ...series.flatMap((serie) => serie.data)
  );
  const maxYCeil = Math.max(1, Math.ceil(maxY));
  const desiredTickCount = 6;
  const useCompactTicks = maxYCeil > desiredTickCount;
  const yTickAmount = useCompactTicks ? desiredTickCount : maxYCeil;
  const yStep = useCompactTicks ? Math.ceil(maxYCeil / desiredTickCount) : 1;
  const yMax = yStep * yTickAmount;

  const options = {
    chart: {
      type: 'line',
      height: 350,
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: true,
        tools: {
          selection: false,
          pan: false,
          download: true,
          zoom: false,
          zoomin: false,
          zoomout: false,
          reset: false,
        },
      },
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    markers: {
      size: 3,
      hover: {
        size: 5,
      },
    },
    xaxis: {
      categories: anos.map((a) => a.toString()),
      labels: {
        style: {
          colors: '#B0C4DE',
        },
      },
    },
    yaxis: {
      min: 0,
      max: yMax,
      tickAmount: yTickAmount,
      forceNiceScale: false,
      decimalsInFloat: 0,
      labels: {
        formatter: (val) => `${Math.round(val)}`,
        style: {
          colors: '#B0C4DE',
        },
      },
    },
    title: {
      text: chartName,
      align: 'left',
      style: {
        color: '#B0C4DE',
        fontSize: '18px',
        fontWeight: 'bold',
      },
    },
    legend: {
      position: 'bottom',
      labels: {
        colors: '#B0C4DE',
      },
    },
    tooltip: {
      theme: 'dark',
      shared: true,
      intersect: false,
      style: {
        fontSize: '12px',
      },
      y: {
        formatter: (val) => Math.round(val),
      },
    },
    grid: {
      borderColor: 'rgba(176, 196, 222, 0.2)',
      strokeDashArray: 4,
    },
  };

  return (
    <div className="lattes-chart">
      <Chart options={options} series={series} type="line" height={350} />
    </div>
  );
};

export default ProducoesSerieTemporalChart;
