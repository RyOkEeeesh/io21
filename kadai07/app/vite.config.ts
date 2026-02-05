import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import devServer from "@hono/vite-dev-server";

const port = Number(process.env.APP_PORT) || 8000;

export default defineConfig({
  server: {
    port
  },
  plugins: [
    devServer({
      entry: "server.ts",
      exclude: [/^\/(app)\/.+/, /^\/@.+$/, /^\/node_modules\/.*/],
    }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths()
  ],
});
