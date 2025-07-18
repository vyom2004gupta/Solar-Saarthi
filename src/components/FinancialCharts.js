import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const FinancialCharts = ({ 
  monthlySavings, 
  monthlyLabels,
  currentMonthlyBill,
  currentYearlyBill,
  solarMonthlyBill,
  solarYearlyBill,
  exportIncome = [0],
  billDecrement = [0],
  exportLabels = ["Export Income"],
  decrementLabels = ["Bill Decrement"]
}) => {
  // Monthly Savings Bar Chart
  const monthlySavingsOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Solar Savings',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '₹ (Rupees)'
        }
      }
    }
  };

  const monthlySavingsData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Monthly Savings (₹)',
        data: monthlySavings,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }
    ],
  };

  // Bill Comparison Chart (now only monthly)
  const billComparisonData = {
    labels: ['Current Monthly Bill', 'Monthly Bill with Solar'],
    datasets: [
      {
        data: [currentMonthlyBill, solarMonthlyBill],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      }
    ],
  };

  // Export Income & Bill Decrement Bar Chart
  const exportDecrementOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Export Income & Bill Decrement',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '₹ (Rupees)'
        }
      }
    }
  };

  const exportDecrementData = {
    labels: [...exportLabels, ...decrementLabels],
    datasets: [
      {
        label: 'Amount (₹)',
        data: [...exportIncome, ...billDecrement],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)', // Export Income
          'rgba(255, 206, 86, 0.6)', // Bill Decrement
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      }
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <Bar options={monthlySavingsOptions} data={monthlySavingsData} />
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-poppins text-xl font-bold text-gray-800 mb-4">Electricity Bill Comparison</h3>
        <Doughnut 
          data={billComparisonData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom',
              },
              title: {
                display: true,
                text: 'Monthly Electricity Cost',
              },
            }
          }}
        />
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="text-center">
            <div className="text-lg font-bold text-red-500">₹{Math.round(currentMonthlyBill).toLocaleString('en-IN')}</div>
            <div className="text-sm text-gray-600">Current Monthly Bill</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-500">₹{Math.round(solarMonthlyBill).toLocaleString('en-IN')}</div>
            <div className="text-sm text-gray-600">Monthly Bill with Solar</div>
          </div>
        </div>
      </div>
      {/* Export Income & Bill Decrement Bar Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6 col-span-1 md:col-span-2">
        <Bar options={exportDecrementOptions} data={exportDecrementData} />
      </div>
    </div>
  );
}; 