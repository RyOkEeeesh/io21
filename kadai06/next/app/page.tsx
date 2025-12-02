"use client";
import { useEffect, useRef, useState } from "react";

type DataType = {
  time: string;
  temperature: number;
  humidity: number;
}

export default function App() {
  const [data, setData] = useState<DataType[]>([]);

  async function dataFetch() {
    try {
      const res = await fetch('/api/data');
      if (!res.ok) return;
      const result = await res.json()
      if (!result.error) setData(result.data);
    } catch {
      console.error('データの取得に失敗しました');
    }
  }

  const wsRef = useRef<WebSocket>(null!);

  useEffect(() => {
    try {
      wsRef.current = new WebSocket(`ws://${(window as Window).location.hostname}:3001`);
      console.log('wsに接続しました');
    } catch {
      console.error('wsに接続できません');
      return;
    }
    wsRef.current.onopen = () => { dataFetch(); }
    wsRef.current.onmessage = msg => {
      const data = JSON.parse(msg.data);
      if (data.type === 'data_updated') {
        console.log('csv update');
        dataFetch();
      }
    };
    return () => { wsRef.current.close(); }
  }, []);

  console.log(data);

  return (
    <div className="">

    </div>

  );
}
