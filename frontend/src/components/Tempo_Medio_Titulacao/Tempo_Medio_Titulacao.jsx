import React from "react";
import ReactApexChart from "react-apexcharts";
import "./Tempo_Medio_Titulacao.css";

const Tempo_Medio_Titulacao = () => {
  // Dados fictícios para o gráfico de barras
  const chartData = {
    series: [
      {
        name: "Tempo Médio de Titulação",
        data: [0, 0, 25, 27, 27, 27, 26, 28, 26, 28, 28],
      },
    ],
    options: {
      chart: {
        type: "bar",
        height: 350,
      },
      plotOptions: {
        bar: {
          horizontal: true,
          columnWidth: "55%",
          endingShape: "rounded",
        },
      },
      dataLabels: {
        enabled: true,
        style: {
          colors: ['#B0C4DE'],
          fontSize: '12px',
          fontWeight: 'bold',
        },
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: ["2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022"],
        labels: {
          style: {
            colors: '#B0C4DE',
            fontSize: '12px',
            fontWeight: 'bold',
        },
      },
      },
      yaxis: {
        labels: {
          style: {
            colors: '#B0C4DE',
            fontSize: '12px',
            fontWeight: 'bold',
          },
        },
      },
      title: {
        text: "Tempo Médio de Titulação",
      },
      legend: {
        position: "top",
        offsetY: 0,
        labels: {
          colors: 'B0C4DE',
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " unidades";
          },
        },
      },
    },
  };

  return (
    <div className="grid-one-item grid-common grid-c2">
      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="bar"
        height={283}
      />
    </div>
  );
}

export default Tempo_Medio_Titulacao;
