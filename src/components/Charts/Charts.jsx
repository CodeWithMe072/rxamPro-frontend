import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line as ChartLine, Bar as ChartBar, Pie as ChartPie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const LineChart = ({ data, options, className = 'h-64 w-full' }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#8d90a0',
          font: { family: 'Inter', size: 11 }
        }
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#8d90a0', font: { family: 'Inter', size: 10 } }
      },
      y: {
        grid: { color: 'rgba(141, 144, 160, 0.1)' },
        ticks: { color: '#8d90a0', font: { family: 'Inter', size: 10 } }
      }
    },
    ...options
  };

  return (
    <div className={className}>
      <ChartLine data={data} options={defaultOptions} />
    </div>
  );
};

export const BarChart = ({ data, options, className = 'h-64 w-full' }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#8d90a0',
          font: { family: 'Inter', size: 11 }
        }
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#8d90a0', font: { family: 'Inter', size: 10 } }
      },
      y: {
        grid: { color: 'rgba(141, 144, 160, 0.1)' },
        ticks: { color: '#8d90a0', font: { family: 'Inter', size: 10 } }
      }
    },
    ...options
  };

  return (
    <div className={className}>
      <ChartBar data={data} options={defaultOptions} />
    </div>
  );
};

export const PieChart = ({ data, options, className = 'h-64 w-full' }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#8d90a0',
          font: { family: 'Inter', size: 11 }
        }
      },
    },
    ...options
  };

  return (
    <div className={className}>
      <ChartPie data={data} options={defaultOptions} />
    </div>
  );
};
