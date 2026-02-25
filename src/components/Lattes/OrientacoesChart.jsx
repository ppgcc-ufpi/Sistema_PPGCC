import React from 'react';
import Chart from 'react-apexcharts';

const OrientacoesChart = ({ orientacoesPorAno, chartName = "Orientações por Ano" }) => {
  const anos = Object.keys(orientacoesPorAno)
    .map(a => parseInt(a))
    .sort((a, b) => a - b);

  if (anos.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        Sem dados de orientações disponíveis
      </div>
    );
  }

  const ativoData = anos.map(ano => orientacoesPorAno[ano]?.ativo || 0);
  const concluidoData = anos.map(ano => orientacoesPorAno[ano]?.concluido || 0);

  const options = {
    chart: {
      type: 'bar',
      height: 350,
      stacked: true,
      zoom: {
        enabled: true,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: -20,
      style: {
        fontSize: '12px',
        colors: ['#fff'],
      },
    },
    stroke: {
      show: true,
      width: 1,
      colors: ['#e0e0e0'],
    },
    xaxis: {
      categories: anos.map(a => a.toString()),
      labels: {
        style: {
          colors: '#B0C4DE',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#B0C4DE',
        },
      },
    },
    fill: {
      opacity: 1,
    },
    colors: ['#F59E0B', '#10B981'],
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
      labels: {
        colors: '#B0C4DE',
      },
    },
    tooltip: {
      theme: 'dark',
      style: {
        fontSize: '12px',
      },
    },
  };

  const series = [
    {
      name: 'Em Andamento',
      data: ativoData,
    },
    {
      name: 'Concluído',
      data: concluidoData,
    },
  ];

  return (
    <div style={{ width: '100%', height: '400px', background: '#1a1f3a', borderRadius: '8px', padding: '20px' }}>
      <Chart options={options} series={series} type="bar" height={350} />
    </div>
  );
};

export default OrientacoesChart;
