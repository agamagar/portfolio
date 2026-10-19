/// <reference types="vitest/config" />
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { handleApi, type ApiModule } from "./scripts/node-adapter";

/**
 * `npm run dev` serves the Vercel Functions in api/ from the same origin, so
 * there's no need for `vercel dev` locally. Env comes from .env / .env.local.
 */
function vercelApiInDev(): Plugin {
  return {
    name: "vercel-api-in-dev",
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), "");
      for (const [k, v] of Object.entries(env)) if (process.env[k] === undefined) process.env[k] = v;
      server.middlewares.use(async (req, res, next) => {
        try {
          const handled = await handleApi(req, res, async (name) => (await server.ssrLoadModule(`/api/${name}.ts`)) as ApiModule);
          if (!handled) next();
        } catch (err) {
          next(err);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), vercelApiInDev()],
  worker: { format: "es" },
  build: {
    target: "es2022",
    chunkSizeWarningLimit: 1200,
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    testTimeout: 30_000,
  },
});
