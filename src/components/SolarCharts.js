import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export const SolarCharts = ({ monthlyData, monthlyLabels, dailyData, dailyLabels, isRealtime = false, dailyGhi = [] }) => {
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Energy Generation',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} kWh`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Energy Generation (kWh)',
          font: {
            weight: 'bold'
          }
        }
      }
    }
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Daily Energy Generation & Solar Irradiance Forecast',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y.toFixed(2);
            const unit = label.includes('GHI') ? 'kWh/m²' : 'kWh';
            return `${label}: ${value} ${unit}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Energy (kWh) / GHI (kWh/m²)',
          font: {
            weight: 'bold'
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date',
          font: {
            weight: 'bold'
          }
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  const barData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Monthly Generation',
        data: monthlyData,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }
    ],
  };

  const lineData = {
    labels: dailyLabels,
    datasets: [
      {
        label: 'Daily Generation',
        data: dailyData,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Daily GHI',
        data: dailyGhi,
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      }
    ],
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      {isRealtime ? (
        <Line options={lineOptions} data={lineData} />
      ) : (
        <Bar options={barOptions} data={barData} />
      )}
    </div>
  );
}; 