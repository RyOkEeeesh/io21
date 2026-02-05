import { Welcome } from "@/welcome/welcome";
import { client } from "@/lib/api";

export async function loader() {
  // APIからhelloメッセージを取得
  const helloRes = await client.api.hello.$get();
  const helloData = await helloRes.json();
  return {
    message: helloData.message
  };
}

export default function Home({ loaderData }: any) {
  return (
    <div>
      <h1>API Data: {loaderData.message}</h1>
      
      <h2>Upcoming Events:</h2>
      <ul>
        {loaderData.events.map((event: any) => (
          <li key={event.id}>
            {event.start?.dateTime || event.start?.date} - {event.summary}
          </li>
        ))}
      </ul>

      <Welcome />
    </div>
  );
}