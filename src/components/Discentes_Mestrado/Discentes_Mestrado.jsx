import React from "react";
import ReactApexChart from "react-apexcharts";
import "./Discentes_Mestrado.css";

const Discentes_Mestrado = () => {
  // Dados fictícios para o gráfico de coluna
  const chartData = {
    series: [
      {
        name: "Matriculado",
        data: [9, 20, 27, 33, 36, 37, 37, 33, 38, 33, 21],
      },
      {
        name: "Titulado",
        data: [0, 0, 8, 8, 18, 13, 20, 15, 16, 14, 18],
      },
      {
        name: "Desligado",
        data: [1, 0, 3, 0, 0, 2, 4, 3, 0, 4, 7],
      },
      {
        name: "Abandonou",
        data: [0, 0, 1, 1, 1, 1, 0, 2, 2, 1, 0],
      },
    ],
    options: {
      chart: {
        type: "bar",
        height: 350,
        stacked: true,
        toolbar: {
          show: true,
        },
        zoom: {
          enabled: true,
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              position: "bottom",
              offsetX: -10,
              offsetY: 0,
            },
          },
        },
      ],
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 5,
          dataLabels: {
            total: {
              enabled: true,
              style: {
                color: '#B0C4DE',
                fontSize: "13px",
                fontWeight: 900,
              },
            },
          },
        },
      },
      xaxis: {
        categories: [
          "2012",
          "2013",
          "2014",
          "2015",
          "2016",
          "2017",
          "2018",
          "2019",
          "2020",
          "2021",
          "2022"
        ],
        labels: {
          show: false,
          style: {
            colors: '#B0C4DE',
            fontSize: '12px',
            fontWeight: 'bold',
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      yaxis: {
        stepSize: 10,
        labels: {
          style: {
            colors: '#B0C4DE',
            fontSize: '12px',
            fontWeight: 'bold',
          },
        },
      },
      title: {
        text: "Discentes-Mestrado",
      },
      legend: {
        position: "bottom",
        offsetY: 10,
        fontSize: '10px',
        labels: {
          colors: 'B0C4DE',
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        style: {
          fontSize: '14px',
          color: 'red',
        },
      },
    },
  };

  return (
    <div className="grid-one-item grid-common grid-c1">
      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="bar"
        height={300}
      />
    </div>
  );
};

export default Discentes_Mestrado;
