import React from "react";
import ReactApexChart from "react-apexcharts";
import "./Savings.css";

const Savings = () => {
  const chartData = {
    series: [
      {
        name: "Com participação de discentes ",
        data: [0, 23, 21, 36, 50, 52, 34, 35, 23, 21, 20],
      },
      {
        name: "Com participação de egressos",
        data: [0, 0, 0, 0, 0, 0, 0, 21, 21, 33, 29],
      },
      {
        name: "Sem participação de discentes",
        data: [0, 16, 17, 24, 23, 25, 27, 43, 52, 71, 52],
      },
      {
        name: "Total de Produções",
        data: [0, 39, 38, 60, 73, 77, 61, 78, 75, 92, 72],
      },
    ],
    options: {
      chart: {
        type: "area",
        height: 350,
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false
          }
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
      },
      xaxis: {
        categories: ["2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022"],
        labels: {
          style: {
            colors: '#B0C4DE',
            fontSize: '10px',
            fontWeight: 'bold',
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: '#B0C4DE',
            fontSize: '8px',
            fontWeight: 'bold',
          },
        },
      },
      title: {
        text: "Produção-Bibliográfica",
      },
      legend: {
        position: "bottom",
        offsetY: 0,
        labels: {
          colors: 'B0C4DE',
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.9,
          stops: [0, 100],
        },
      },
      tooltip: {
        x: {
          format: "dd/MM",
        },
      },
    },
  };

  return (
    <div className="subgrid-two-item grid-common grid-c6">
      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="bar"
        height={283}
      />
    </div>
  )
}

export default Savings;
