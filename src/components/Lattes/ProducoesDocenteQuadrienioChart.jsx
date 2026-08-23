import React from 'react';
import Chart from 'react-apexcharts';
import './LattesCharts.css';

const ProducoesDocenteQuadrienioChart = ({
  dadosQuadrenio,
  chartName = 'Produção por Docente no Quadriênio',
}) => {
  const categories = dadosQuadrenio?.categories || [];
  const series = dadosQuadrenio?.series || [];

  if (categories.length === 0 || series.length === 0) {
    return (
      <div className="lattes-chart lattes-chart--empty">
        Sem dados de produção disponíveis para o quadriênio selecionado
      </div>
    );
  }

  const chartHeight = Math.max(380, categories.length * 28);

  const options = {
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: {
        show: true,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 3,
        barHeight: '70%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      labels: {
        style: {
          colors: '#B0C4DE',
        },
      },
      title: {
        text: 'Quantidade de Produções',
        style: {
          color: '#B0C4DE',
        },
      },
    },
    yaxis: {
      categories,
      labels: {
        style: {
          colors: '#B0C4DE',
          fontSize: '11px',
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
      y: {
        formatter: (val) => `${Math.round(val)} produção(ões)`,
      },
    },
    grid: {
      borderColor: 'rgba(176, 196, 222, 0.2)',
      strokeDashArray: 4,
    },
    fill: {
      opacity: 1,
    },
  };

  return (
    <div className="lattes-chart lattes-chart--dynamic">
      <Chart options={options} series={series} type="bar" height={chartHeight} />
    </div>
  );
};

export default ProducoesDocenteQuadrienioChart;
