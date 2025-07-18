import React from 'react';
import { Radar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement
);

export const EnvironmentalCharts = ({ 
  co2SavedYearly,
  co2Saved25Years,
  treesEquivalent,
  waterSaved,
  coalSaved 
}) => {
  // Radar Chart Data
  const radarData = {
    labels: ['CO₂ Reduction', 'Trees Equivalent', 'Water Saved', 'Coal Saved', 'Grid Independence'],
    datasets: [{
      label: 'Environmental Impact',
      data: [
        co2SavedYearly / 200, // Normalized values for better visualization
        treesEquivalent / 2,
        waterSaved / 100,
        coalSaved / 20,
        80 // Fixed value for grid independence
      ],
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(75, 192, 192, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(75, 192, 192, 1)'
    }]
  };

  const radarOptions = {
    scales: {
      r: {
        beginAtZero: true,
        ticks: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  // Doughnut Chart Data
  const doughnutData = {
    labels: [
      'CO₂ Prevented',
      'Water Saved',
      'Coal Avoided'
    ],
    datasets: [{
      data: [co2Saved25Years, waterSaved * 25, coalSaved * 25],
      backgroundColor: [
        'rgba(75, 192, 192, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)'
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)'
      ],
      borderWidth: 1
    }]
  };

  const doughnutOptions = {
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Environmental Impact</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Overview Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Environmental Impact Overview</h3>
          <div className="w-full h-[300px] flex justify-center items-center">
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>

        {/* 25-Year Impact Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">25-Year Environmental Impact Breakdown</h3>
          <div className="w-full h-[300px] flex justify-center items-center">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Benefits Summary Section */}
      <div className="mt-8 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 p-8 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-800 text-center mb-6">Environmental Benefits Summary</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-4xl font-bold text-green-600">{Math.round(treesEquivalent)}</div>
            <div className="text-sm font-medium text-green-600">Trees Equivalent</div>
            <div className="text-xs text-gray-500">per year</div>
          </div>

          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-4xl font-bold text-blue-600">{Math.round(waterSaved)}</div>
            <div className="text-sm font-medium text-blue-600">Liters Water Saved</div>
            <div className="text-xs text-gray-500">per year</div>
          </div>

          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-4xl font-bold text-yellow-600">{Math.round(coalSaved)}</div>
            <div className="text-sm font-medium text-yellow-600">kg Coal Saved</div>
            <div className="text-xs text-gray-500">per year</div>
          </div>

          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-4xl font-bold text-red-600">{Math.round(co2SavedYearly)}kg</div>
            <div className="text-sm font-medium text-red-600">CO₂ Reduced</div>
            <div className="text-xs text-gray-500">per year</div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <h4 className="text-2xl font-bold text-purple-600">Over 25 Years: {(co2Saved25Years / 1000).toFixed(1)}T CO₂ Prevented</h4>
          <p className="text-gray-600 mt-2">
            Equivalent to planting {Math.round(treesEquivalent * 25)} trees and saving {Math.round(waterSaved * 25 / 1000)}K liters of water
          </p>
        </div>
      </div>
    </div>
  );
};