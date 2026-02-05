import { Welcome } from "@/welcome/welcome";
import { client } from "@/lib/api";
import { useLoaderData } from "react-router";
import { useEffect, useRef, useState } from "react";

export async function loader({ request }: { request: Request }) {
  const data = {
    events: [] as any,
    temperature: null as any,
    humidity: null as any
  };
  const headers = request.headers;
  const eventRes = await client.api.calendar.$get({}, {
    headers: {
      cookie: headers.get("cookie") || "",
    }
  });
  const eventData = await eventRes.json();
  if (eventRes.ok && eventData.success && eventData.events) data.events = eventData.events;

  const tempRes = await client.api.temperature.$get();
  const tempData = await tempRes.json();
  if (tempData.temperature) data.temperature = tempData.temperature;
  if (tempData.humidity) data.humidity = tempData.humidity;

  return data;
}

export default function Home() {
  const { events, temperature, humidity } = useLoaderData<typeof loader>();
  const [temp ,setTemp] = useState({temperature, humidity});

  const tempFetch = async () => {
    const tempRes = await client.api.temperature.$get();
    const tempData = await tempRes.json();
    setTemp(tempData);
  }

  const wsRef = useRef<WebSocket>(null!);

  useEffect(() => {
    try {
      wsRef.current = new WebSocket(`ws://${(window as Window).location.hostname}:3001`);
    } catch {
      return;
    }
    wsRef.current.onopen = () => { tempFetch(); }
    wsRef.current.onmessage = msg => {
      const data = JSON.parse(msg.data);
      if (data.type === 'data_updated') tempFetch();
    };
    return () => { wsRef.current.close(); }
  }, []);

  return (
    <div>
      <h2>予定一覧</h2>
      <ul>
        {events.map((event: any) => (
          <li key={event.id}>{event.summary}</li>
        ))}
      </ul>
      <p>温度: {temp.temperature}</p>
      <p>湿度: {temp.humidity}</p>
    </div>
  );
}