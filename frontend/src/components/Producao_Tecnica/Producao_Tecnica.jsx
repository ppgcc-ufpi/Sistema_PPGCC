import React from "react";
import ReactApexChart from "react-apexcharts";
import "./Producao_Tecnica.css";

const Producao_Tecnica = () => {
  const chartData = {
    series: [
      {
        name: "Com participação de discentes",
        data: [0, 0, 4, 0, 3, 3, 1, 0, 0, 1, 0],
      },
      {
        name: "Sem participação de discentes",
        data: [0, 2, 4, 5, 4, 2, 5, 8, 1, 3, 6],
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
        text: "Produção - Técnica",
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

export default Producao_Tecnica;
