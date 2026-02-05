import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { createRequestHandler } from "react-router";
import { google } from "googleapis"; // 追加
import { setCookie, getCookie } from "hono/cookie"; // 追加

const app = new Hono();

// --- Google OAuth2 設定 ---
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
// ポートを8000にするなら、Googleコンソールの登録も8000に変更してください
const REDIRECT_URI = "http://localhost:8000/auth/google/callback";

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// --- API定義 ---
const routes = app
  .get("/api/hello", (c) => {
    return c.json({
      message: "Hono APIから取得したデータです",
      time: new Date().toISOString(),
    });
  })
  // 1. 認証開始: ブラウザでここ（/auth/google）を叩くとログイン画面へ
  .get("/auth/google", (c) => {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/calendar.readonly",
      ],
      prompt: "consent",
    });
    return c.redirect(authUrl);
  })
  // 2. コールバック: Googleから戻ってくる場所
  .get("/auth/google/callback", async (c) => {
    const code = c.req.query("code");
    if (!code) return c.text("No code found", 400);

    try {
      const { tokens } = await oauth2Client.getToken(code);
      // トークンをCookieに保存（セキュアな設定）
      setCookie(c, "google_tokens", JSON.stringify(tokens), {
        path: "/",
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 1週間
      });
      return c.redirect("/"); // 認証完了後、トップページへ
    } catch (error) {
      return c.text("Authentication failed", 500);
    }
  });

export type AppType = typeof routes;

// --- SSR / 静的ファイル処理 ---
// (既存のコードと同じ)
if (process.env.NODE_ENV === "production") {
  app.use("/assets/*", serveStatic({ root: "./build/client" }));
}

app.all("*", async (c) => {
  const build =
    process.env.NODE_ENV === "production"
      ? // @ts-ignore
        await import("./build/server/index.js")
      : // @ts-ignore
        await import("virtual:react-router/server-build");

  const handler = createRequestHandler(build, process.env.NODE_ENV);
  // HonoのContextからリクエストをReact Routerへ渡す
  return handler(c.req.raw);
});

if (process.env.NODE_ENV === "production") {
  const port = 8000;
  console.log(`Server is running on http://localhost:${port}`);
  serve({ fetch: app.fetch, port });
}

export default app;