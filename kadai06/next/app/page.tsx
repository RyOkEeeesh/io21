'use client';
import { useEffect, useRef, useState } from 'react';
import { Data } from '@/types/data';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Graph({ datas }: { datas: Data }) {
  const [isDark, setIsDark] = useState<boolean>(null!);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);

    function handleChange(e: MediaQueryListEvent) {
      setIsDark(e.matches);
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const data = {
    labels: datas.time,
    datasets: [
      {
        label: '温度',
        data: datas.temperature,
        borderColor: 'rgb(255, 32, 86, 0.5)',
        backgroundColor: 'rgb(255, 99, 132)',
        yAxisID: 'yl' as const,
      }, {
        label: '湿度',
        data: datas.humidity,
        borderColor: 'rgba(21, 93, 252, 0.5)',
        backgroundColor: 'rgb(53, 162, 235)',
        yAxisID: 'yr' as const,
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'IO21 課題6',
        font: {
          size: 32,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: isDark ? '#292524' : '#d6d3d1',
        }
      },
      yl: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: '温度 (°C)',
          color: 'rgb(255, 99, 132)',
          font: {
            size: 20,
          }
        },
        grid: {
          drawOnChartArea: true,
          color: isDark ? '#292524' : '#d6d3d1',
        },
        min: 10,
        max: 30,
      },
      yr: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: '湿度 (%)',
          color: 'rgb(53, 162, 235)',
          font: {
            size: 20,
          }
        },
        grid: {
          drawOnChartArea: false,
        },
        min: 0,
        max: 100,
      },
    },
  };

  return (
    <div className="h-[70vmin] aspect-video">
      <Line data={data} options={options} />
    </div>
  )
}

export default function App() {
  const [datas, setDatas] = useState<Data>({
    time: [],
    temperature: [],
    humidity: [],
  });

  async function dataFetch() {
    try {
      const res = await fetch('/api/data');
      if (!res.ok) return;
      const result = await res.json()
      if (!result.error) setDatas(result.data);
    } catch {
      console.error('データの取得に失敗しました');
    }
  }

  const wsRef = useRef<WebSocket>(null!);

  useEffect(() => {
    try {
      wsRef.current = new WebSocket(`ws://${(window as Window).location.hostname}:3001`);
    } catch {
      return;
    }
    wsRef.current.onopen = () => { dataFetch(); }
    wsRef.current.onmessage = msg => {
      const data = JSON.parse(msg.data);
      if (data.type === 'data_updated') dataFetch();
    };
    return () => { wsRef.current.close(); }
  }, []);

  return (
    <div className='h-full w-full flex items-center justify-center'>
      <Graph datas={datas} />
    </div>
  );
}
