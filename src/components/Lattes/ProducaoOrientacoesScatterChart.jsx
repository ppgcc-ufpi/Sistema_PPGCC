import React from 'react';
import Chart from 'react-apexcharts';

const ProducaoOrientacoesScatterChart = ({
  docenteData,
  maxProducoes,
  maxOrientacoes,
  docente = 'Docente',
  chartName = 'Produção × Orientações Concluídas',
}) => {
  if (!docenteData || docenteData.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        Sem dados de produção e orientações disponíveis
      </div>
    );
  }

  // Formata dados para ApexCharts scatter
  const series = [
    {
      name: 'Produção × Orientações',
      data: docenteData.map((item) => ({
        x: item.x,
        y: item.y,
        ano: item.ano,
      })),
    },
  ];

  // Calcula eixos com margem de segurança
  const xMax = Math.max(maxProducoes * 1.1, 1);
  const yMax = Math.max(maxOrientacoes * 1.1, 1);

  const options = {
    chart: {
      type: 'scatter',
      height: 350,
      zoom: {
        enabled: true,
      },
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
          customIcons: [],
        },
      },
    },
    plotOptions: {
      scatter: {
        size: 8,
      },
    },
    xaxis: {
      type: 'numeric',
      tickAmount: Math.min(6, Math.max(3, Math.ceil(maxProducoes / 2))),
      min: 0,
      max: xMax,
      title: {
        text: 'Produções',
        style: {
          color: '#B0C4DE',
          fontSize: '12px',
          fontWeight: 'bold',
        },
      },
      labels: {
        style: {
          colors: '#B0C4DE',
          fontSize: '11px',
        },
        formatter: (value) => Math.round(value),
      },
      axisBorder: {
        color: 'rgba(176, 196, 222, 0.2)',
      },
    },
    yaxis: {
      tickAmount: Math.min(6, Math.max(3, Math.ceil(maxOrientacoes / 2))),
      min: 0,
      max: yMax,
      title: {
        text: 'Orientações Concluídas',
        style: {
          color: '#B0C4DE',
          fontSize: '12px',
          fontWeight: 'bold',
        },
      },
      labels: {
        style: {
          colors: '#B0C4DE',
          fontSize: '11px',
        },
        formatter: (value) => Math.round(value),
      },
      axisBorder: {
        color: 'rgba(176, 196, 222, 0.2)',
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
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const data = w.config.series[seriesIndex].data[dataPointIndex];
        if (!data) return '';
        return (
          '<div style="padding: 10px; background: rgba(0,0,0,0.8); border: 1px solid #B0C4DE; border-radius: 4px;">' +
          `<div style="color: #B0C4DE;"><b>Ano:</b> ${data.ano}</div>` +
          `<div style="color: #B0C4DE;"><b>Produções:</b> ${data.x}</div>` +
          `<div style="color: #B0C4DE;"><b>Orientações:</b> ${data.y}</div>` +
          '</div>'
        );
      },
    },
    grid: {
      borderColor: 'rgba(176, 196, 222, 0.2)',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    colors: ['#FF9A56'],
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '420px',
        background: '#1a1f3a',
        borderRadius: '8px',
        padding: '20px',
      }}
    >
      <Chart options={options} series={series} type="scatter" height={350} />
    </div>
  );
};

export default ProducaoOrientacoesScatterChart;
