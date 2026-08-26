import React from "react";
import ReactApexChart from "react-apexcharts";
import "./Projetos_Pesquisa.css";

const Projetos_Pesquisa = () => {
  const chartData = {
    series: [
      {
        name: "Projetos de Pesquisa em Andamento",
        data: [13, 13, 16, 15, 15, 12, 13, 23, 24, 29, 32],
      },
      {
        name: "Projetos de Pesquisa Concluídos",
        data: [9, 2, 3, 2, 1, 4, 2, 0, 4, 5, 5],
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
          horizontal: true,
          borderRadius: 5,
          dataLabels: {
            total: {
              enabled: true,
              style: {
                fontSize: "13px",
                fontWeight: 900,
                color: '#B0C4DE',
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
            fontSize: '8px',
            fontWeight: 'bold',
          },
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
        text: "Projetos de Pesquisa",
      },
      legend: {
        position: "bottom",
        offsetY: 10,
        fontSize: '10px',
        labels: {
          colors: 'B0C4DE',
        },
        markers: {
          fillColors: ['#D2691E' , '#006400']
        }
      },
      fill: {
        opacity: 1,
        colors: ['#D2691E', '#006400']
      },
      tooltip: {
        style: {
          fontSize: '14px',
          color: 'red', // Cor do texto da informação do tooltip
        },
      },
    },
  };
  return (
    <div className="subgrid-two-item grid-common grid-c5">
      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="bar"
        height={350}
      />
    </div>
  )
}

export default Projetos_Pesquisa;
