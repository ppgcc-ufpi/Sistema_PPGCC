import React from "react";
import ReactApexChart from "react-apexcharts";
import "./Turmas_Ofertadas.css";

const Turmas_Ofertadas = () => {
  // Dados fictícios para o gráfico de linha
  const chartData = {
    series: [
      {
        name: "Turmas Ofertadas",
        data: [0, 23, 26, 24, 23, 27, 19, 21, 25, 25, 20],
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
          show: true,
          style: {
            colors: '#B0C4DE',
            fontSize: '9px',
            fontWeight: 'bold',
            cssClass: 'apexcharts-xaxis-label',
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
        text: "Turmas Ofertadas",
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
        colors: ['#DAA520'],
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
    <div className="grid-one-item grid-common grid-c3">
      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="bar"
        height={283}
      />
    </div>
  );
}

export default Turmas_Ofertadas;
