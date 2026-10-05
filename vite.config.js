import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // IPv4 loopback: Node resolved "localhost" to ::1 only, so http://127.0.0.1:5173
  // refused connections (2026-09-27); browsers still reach it as localhost
  server: { host: "127.0.0.1" },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
