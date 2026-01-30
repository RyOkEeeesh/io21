import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { createRequestHandler } from "react-router";

const app = new Hono();

// --- API定義 ---
const routes = app.get("/api/hello", (c) => {
  return c.json({
    message: "Hono APIから取得したデータです",
    time: new Date().toISOString(),
  });
});

export type AppType = typeof routes;

// --- SSR / 静的ファイル処理 ---

// 1. 本番環境のみ: ビルド済みの静的ファイルを配信
if (process.env.NODE_ENV === "production") {
  app.use("/assets/*", serveStatic({ root: "./build/client" }));
}

// 2. React Router ハンドラーの設定
app.all("*", async (c) => {
  // 開発モードと本番モードで読み込み先を切り替える
  const build =
    process.env.NODE_ENV === "production"
      ? // @ts-ignore
        await import("./build/server/index.js")
      : // @ts-ignore
        await import("virtual:react-router/server-build"); // Vite開発用仮想モジュール

  const handler = createRequestHandler(build, process.env.NODE_ENV);
  return handler(c.req.raw);
});

// 3. 本番環境のみ: 自前でポートをリッスンする
// 開発時は @hono/vite-dev-server がリッスンするのでここは実行しない
if (process.env.NODE_ENV === "production") {
  const port = 3000;
  console.log(`Server is running on http://localhost:${port}`);
  serve({
    fetch: app.fetch,
    port,
  });
}

export default app;