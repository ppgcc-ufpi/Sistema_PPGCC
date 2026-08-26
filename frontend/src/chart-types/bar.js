import React from 'react';
import Chart from 'react-apexcharts';

const BarChart = ({
  selectedYears,
  selectedInfo,
  getSelectedInfoData,
  chartName,
}) => {
  const options = {
    chart: {
      type: 'bar',
      height: 400,
      stacked:false,
      zoom: {
        enabled: true,
      },
      selection: {
        enabled: true,
      },
      zoomedArea: {
        fill: {
          color: '#90CAF9',
          opacity: 0.4,
        },
        stroke: {
          color: '#0D47A1',
          opacity: 0.7,
          width: 1,
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
    },
    responsive: [{
      breakpoint: 480,
      options: {
        legend: {
          position: 'bottom',
          offsetX: -10,
          offsetY: 0
        }
      }
    }],
    plotOptions: {
      bar: {
        borderRadius: 5,
        // borderRadiusApplication: 'end',
        horizontal: true,
        //columnWidth: '55%',
        //endingShape: 'rounded',
        dataLabels: {
          //position: 'top', // top, center, bottom
          total: {
            enabled: true,
            style: {
              fontSize: '13px',
              fontWeight: 900
            }
          }
        },
      }
    },
    dataLabels: {
      position: 'top',
      enabled: false,
      offsetY: 0,
      style: {
        fontSize: '12px',
        colors: ["#ADD8E6"]
      }
    },
    stroke: {
      show: true,
      width: 4,
      colors: ['transparent']
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
    legend: {
      labels: {
        colors: '#B0C4DE',
      },
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
  }));

  return (
    <div>
     <Chart options={options} 
     series={series} 
     type="bar"
     height={500} 
     width={470} />
    </div>
  );
};

export default BarChart;
