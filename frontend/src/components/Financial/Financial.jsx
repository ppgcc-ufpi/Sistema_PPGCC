import React from "react";
import ReactApexChart from "react-apexcharts";

const Financial = () => {
  const chartData = {
    series: [
      {
        name: "Receitas",
        data: [150, 200, 250, 180, 300],
      },
      {
        name: "Despesas",
        data: [120, 170, 220, 150, 200],
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
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio"],
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
        text: "Valores",
      },
      legend: {
        position: "top",
        offsetY: 0,
        fontSize: '12px',
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
    <div className="subgrid-two-item grid-common grid-c8">
       <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="bar"
        height={235.5}
      />
    </div>
  )
}

export default Financial
