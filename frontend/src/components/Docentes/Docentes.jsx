import React from "react";
import ReactApexChart from "react-apexcharts";
import "./Docentes.css";

const Docentes = () => {
  const chartData = {
    series: [
      {
        name: "Docente-Permanente",
        data: [10, 9, 9, 10, 10, 13, 14, 14, 17, 17, 18],
      },
      {
        name: "Docente-Colaborador",
        data: [1, 1, 2, 2, 2, 1, 1, 1, 0, 0, 0],
      },
      {
        name: "Docente-Visitante",
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
            fontSize: '10px',
            fontWeight: 'bold',
          },
        },
      },
      title: {
        text: "Docentes",
      },
      legend: {
        position: "top",
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
    <div className="grid-two-item grid-common grid-c4">
      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="area"
        height={350}
      />
    </div>
  );
}

export default Docentes;

