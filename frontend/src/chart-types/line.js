import React from 'react';
import Chart from 'react-apexcharts';


const LineChart = ({
  selectedYears,
  selectedInfo,
  getSelectedInfoData,
  chartName,
}) => {
  const options = {
    chart: {
      height: 400,
      type: 'line',
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
          reset: false
        }
      }
    },
    dataLabels: {
      enabled: true,
    },
    stroke: {
      width: 5,
      curve: 'straight', // stepline 
      dashArray: 0,
    },
    title: {
      text: chartName,
      align: 'left',
      style: {
        color: '#B0C4DE',
        fontSize: '20px',
        fontWeight: 'bold',
       },
    },
    // grid: {
    //   row: {
    //     colors: ['#f3f3f3', 'transparent'],
    //     opacity: 0.5,
    //   },
    // },
    legend: {
      labels: {
        colors: '#B0C4DE',
      },
    },
    markers: {
      size: 0,
      hover: {
        sizeOffset: 6
      }
    },
    xaxis: {
      categories: selectedInfo,
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
          colors: 'white',
          colors: '#B0C4DE',
          fontSize: '12px',
          fontWeight: 'bold',
        },
      },
    },
    fill: {
      opacity: 1
    }
  };

  const series = selectedYears.map((year) => ({
    name: year,
    data: selectedInfo.map((info) => getSelectedInfoData(info, year)),
  }))

  return (
    <div>
     <Chart options={options} 
     series={series} 
     type="line"
     height={500} 
     width={470} />
   </div>
  );
};

export default LineChart;
