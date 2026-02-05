import { Welcome } from "@/welcome/welcome";
import { client } from "@/lib/api";
import { useLoaderData } from "react-router";

export async function loader({ request }: { request: Request }) {
  const headers = request.headers;
  const eventRes = await client.api.calendar.$get({}, {
    headers: {
      cookie: headers.get("cookie") || "",
    }
  });

  const eventData = await eventRes.json();
  
  if (!eventRes.ok || !eventData.success) {
    console.error("API Error or Login needed:", eventData);
    return { events: [] }; 
  }

  return {
    events: eventData.events || []
  };
}


export default function Home() {
  const { events } = useLoaderData<typeof loader>();
  console.log("クライアント側のイベント:", events);

  return (
    <div>
      <h2>予定一覧</h2>
      <ul>
        {events.map(event => (
          <li key={event.id}>{event.summary}</li>
        ))}
      </ul>
      <Welcome />
    </div>
  );
}