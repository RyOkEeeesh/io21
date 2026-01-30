import { Welcome } from "../welcome/welcome";
import { client } from "../lib/api";

export async function loader() {
  // これでポートやURLを意識せず、補完付きで API を叩けます
  const res = await client.api.hello.$get();
  return await res.json();
}
export default function Home({ loaderData }: any) {
  return (
    <div>
      <h1>API Data: {loaderData.message}</h1>
      <Welcome />
    </div>
  );
}
