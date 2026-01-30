import { hc } from "hono/client";
import type { AppType } from "../../server";

// SSR時（server-side）は app.fetch を直接叩くこともできますが、
// まずは一番シンプルな「ベースURLの自動切り替え」で対応します
const baseUrl = typeof window === "undefined" 
  ? "http://localhost:5173" 
  : "/";

export const client = hc<AppType>(baseUrl);