import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // IPv4 loopback: Node resolved "localhost" to ::1 only, so http://127.0.0.1:5173
  // refused connections (2026-09-27); browsers still reach it as localhost
  // PORT (set by the desktop app's preview when 5173 is taken by another chat's
  // server) wins; without it Vite keeps its default 5173
  server: { host: "127.0.0.1", ...(process.env.PORT ? { port: Number(process.env.PORT), strictPort: true } : {}) },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
