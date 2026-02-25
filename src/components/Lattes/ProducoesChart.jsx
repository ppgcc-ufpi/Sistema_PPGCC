import React from 'react';
import Chart from 'react-apexcharts';

const ProducoesChart = ({ producoesPorAno, chartName = "Produções por Ano" }) => {
  const anos = Object.keys(producoesPorAno)
    .map(a => parseInt(a))
    .sort((a, b) => a - b);

  if (anos.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        Sem dados de produções disponíveis
      </div>
    );
  }

  const data = anos.map(ano => producoesPorAno[ano]?.length || 0);

  const options = {
    chart: {
      type: 'bar',
      height: 350,
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
        colors: ['#304758'],
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
      colors: ['#6366F1'],
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
    tooltip: {
      theme: 'dark',
      style: {
        fontSize: '12px',
      },
    },
  };

  const series = [
    {
      name: 'Produções',
      data: data,
    },
  ];

  return (
    <div style={{ width: '100%', height: '400px', background: '#1a1f3a', borderRadius: '8px', padding: '20px' }}>
      <Chart options={options} series={series} type="bar" height={350} />
    </div>
  );
};

export default ProducoesChart;
