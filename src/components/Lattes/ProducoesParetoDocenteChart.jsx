import React from 'react';
import Chart from 'react-apexcharts';

const ProducoesParetoDocenteChart = ({
  dadosPareto,
  chartName = 'Curva de Pareto da Produção por Docente',
}) => {
  const categories = dadosPareto?.categories || [];
  const producoes = dadosPareto?.producoes || [];
  const acumuladoPercentual = dadosPareto?.acumuladoPercentual || [];

  const abreviarNomeDocente = (nome) => {
    if (!nome || typeof nome !== 'string') return '';
    const partes = nome.trim().split(/\s+/).filter(Boolean);
    if (partes.length <= 2) return nome;
    return `${partes[0]} ${partes[partes.length - 1]}`;
  };

  const categoriesResumidas = categories.map(abreviarNomeDocente);

  if (!categories.length || !producoes.length) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        Sem dados de produção disponíveis para a curva de Pareto
      </div>
    );
  }

  const options = {
    chart: {
      height: 380,
      type: 'line',
      stacked: false,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
    },
    stroke: {
      width: [0, 3],
      curve: 'smooth',
    },
    plotOptions: {
      bar: {
        columnWidth: '60%',
        borderRadius: 3,
      },
    },
    xaxis: {
      categories: categoriesResumidas,
      tickPlacement: 'on',
      labels: {
        rotate: -45,
        rotateAlways: true,
        hideOverlappingLabels: false,
        trim: false,
        maxHeight: 120,
        style: {
          colors: '#B0C4DE',
          fontSize: '11px',
        },
      },
    },
    yaxis: [
      {
        min: 0,
        title: {
          text: 'Produções',
          style: { color: '#B0C4DE' },
        },
        labels: {
          style: { colors: '#B0C4DE' },
        },
      },
      {
        min: 0,
        max: 100,
        tickAmount: 5,
        opposite: true,
        title: {
          text: 'Acumulado (%)',
          style: { color: '#B0C4DE' },
        },
        labels: {
          formatter: (val) => `${Math.round(val)}%`,
          style: { colors: '#B0C4DE' },
        },
      },
    ],
    colors: ['#6366F1', '#F59E0B'],
    dataLabels: {
      enabled: false,
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
      x: {
        formatter: (_, { dataPointIndex }) => categories[dataPointIndex] || '',
      },
      y: {
        formatter: (val, { seriesIndex }) => (seriesIndex === 1 ? `${val}%` : `${Math.round(val)} produção(ões)`),
      },
    },
    grid: {
      borderColor: 'rgba(176, 196, 222, 0.2)',
      strokeDashArray: 4,
    },
    annotations: {
      yaxis: [
        {
          y: 80,
          yAxisIndex: 1,
          borderColor: '#EF4444',
          strokeDashArray: 4,
          label: {
            text: '80%',
            style: {
              color: '#fff',
              background: '#EF4444',
            },
          },
        },
      ],
    },
  };

  const series = [
    {
      name: 'Produções',
      type: 'column',
      data: producoes,
    },
    {
      name: 'Acumulado (%)',
      type: 'line',
      data: acumuladoPercentual,
    },
  ];

  return (
    <div style={{ width: '100%', minHeight: '460px', background: '#1a1f3a', borderRadius: '8px', padding: '20px' }}>
      <Chart options={options} series={series} type="line" height={420} />
    </div>
  );
};

export default ProducoesParetoDocenteChart;
