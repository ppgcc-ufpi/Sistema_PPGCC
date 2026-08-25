import React from 'react';
import Chart from 'react-apexcharts';
import './LattesCharts.css';

const ProducoesChart = ({ producoesPorAno, chartName = "Produções por Ano" }) => {
  const anos = Object.keys(producoesPorAno)
    .map(a => parseInt(a))
    .sort((a, b) => a - b);

  if (anos.length === 0) {
    return (
      <div className="lattes-chart lattes-chart--empty">
        Sem dados de produções disponíveis
      </div>
    );
  }

  const data = anos.map(ano => producoesPorAno[ano]?.length || 0);
  const maxY = Math.max(...data, 0);
  const maxYCeil = Math.max(1, Math.ceil(maxY));
  const desiredTickCount = 6;
  const useCompactTicks = maxYCeil > desiredTickCount;
  const yTickAmount = useCompactTicks ? desiredTickCount : maxYCeil;
  const yStep = useCompactTicks ? Math.ceil(maxYCeil / desiredTickCount) : 1;
  const yMax = yStep * yTickAmount;
  const showDataLabels = anos.length <= 12;

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
      enabled: showDataLabels,
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
      y: {
        formatter: (val) => Math.round(val),
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
    <div className="lattes-chart">
      <Chart options={options} series={series} type="bar" height={350} />
    </div>
  );
};

export default ProducoesChart;
