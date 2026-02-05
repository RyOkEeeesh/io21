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
  REDIRECT_URI,
);

// --- API定義 ---
const routes = app
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
  .get("/auth/google/callback", async (c) => {
    const code = c.req.query("code");
    if (!code) return c.text("No code found", 400);

    try {
      const { tokens } = await oauth2Client.getToken(code);
      setCookie(c, "google_tokens", JSON.stringify(tokens), {
        path: "/",
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7,
      });
      return c.redirect("/");
    } catch (error) {
      return c.text("Authentication failed", 500);
    }
  })
  .get("/api/calendar", async (c) => {
    const tokensJson = getCookie(c, "google_tokens");
    console.log(tokensJson);

    if (!tokensJson) return c.json({ need_login: true, success: false });

    try {
      const tokens = JSON.parse(tokensJson);
      oauth2Client.setCredentials(tokens);
      const calendar = google.calendar({ version: "v3", auth: oauth2Client });
      const response = await calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: "startTime",
      });

      console.log("Google API Response Status:", response.status); // 200ならOK
      console.log(response.data)

      const events = response.data.items;

      return c.json({
        success: true,
        events,
      });
    } catch (error) {
      console.error("Google Calendar API Error:", error);
      return c.json({ success: false }, 500);
    }
  });

export type AppType = typeof routes;

// --- SSR / 静的ファイル処理 ---
// (既存のコードと同じ)
if (process.env.NODE_ENV === "production") {
  app.use("/assets/*", serveStatic({ root: "./build/client" }));
}

app.all("*", async (c, next) => {
  const url = new URL(c.req.url);
  // .well-known や favicon など、React Routerで処理しなくていいものを除外
  if (url.pathname.startsWith("/.well-known") || url.pathname === "/favicon.ico") {
    return c.text("Not Found", 404);
  }
  await next();
});

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
