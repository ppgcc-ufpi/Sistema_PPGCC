import React from 'react';
import Chart from 'react-apexcharts';

const ProjetosChart = ({ projetosPorAno, chartName = "Projetos por Ano" }) => {
  const anos = Object.keys(projetosPorAno)
    .map(a => parseInt(a))
    .sort((a, b) => a - b);

  if (anos.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        Sem dados de projetos disponíveis
      </div>
    );
  }

  const ativoData = anos.map(ano => projetosPorAno[ano]?.ativo || 0);
  const concluidoData = anos.map(ano => projetosPorAno[ano]?.concluido || 0);
  const totalData = anos.map((_, index) => ativoData[index] + concluidoData[index]);
  const maxY = Math.max(...totalData, 0);
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
      enabled: showDataLabels,
      offsetY: -20,
      formatter: (value, opts) => {
        const dataPointIndex = opts.dataPointIndex;
        const seriesIndex = opts.seriesIndex;
        const lastSeriesIndex = opts.w.config.series.length - 1;
        const lastSeriesValue = opts.w.config.series[lastSeriesIndex].data[dataPointIndex] || 0;
        const total = totalData[dataPointIndex] || 0;

        if (total === 0) return '';

        // Regra: mostra o total na série do topo;
        // se a série do topo for 0, mostra na série imediatamente abaixo.
        if (seriesIndex === lastSeriesIndex) return total;
        if (lastSeriesValue === 0 && seriesIndex === lastSeriesIndex - 1) return total;

        return '';
      },
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
    },
    colors: ['#EF4444', '#8B5CF6'],
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
      y: {
        formatter: (val) => Math.round(val),
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

export default ProjetosChart;
