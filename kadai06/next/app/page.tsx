"use client";
import { useEffect, useRef, useState } from "react";
import { Data } from "@/types/data";
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
import { Line } from "react-chartjs-2";

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
  const data = {
    labels: datas.time,
    datasets: [
      {
        label: '温度',
        data: datas.temperature,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        
      }, {
        label: '湿度',
        data: datas.humidity,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'yRight' as const,
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
        text: '温度・湿度',
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: '温度 (°C)',
        },
        grid: {
          drawOnChartArea: true,
        },
        min: 0,
        max: 40,
      },
      yRight: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: '湿度 (%)',
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
    <Line className="w-full" data={data} options={options} />
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

  // useEffect(() => {
  //   try {
  //     wsRef.current = new WebSocket(`ws://${(window as Window).location.hostname}:3001`);
  //     console.log('wsに接続しました');
  //   } catch {
  //     console.error('wsに接続できません');
  //     return;
  //   }
  //   wsRef.current.onopen = () => { dataFetch(); }
  //   wsRef.current.onmessage = msg => {
  //     const data = JSON.parse(msg.data);
  //     if (data.type === 'data_updated') {
  //       console.log('csv update');
  //       dataFetch();
  //     }
  //   };
  //   return () => { wsRef.current.close(); }
  // }, []);

  useEffect(() => {
    dataFetch();
  }, []);

  console.log(datas)

  return (
    <div className="h-full w-full flex items-center justify-center">
      <Graph datas={datas} />
    </div>

  );
}
