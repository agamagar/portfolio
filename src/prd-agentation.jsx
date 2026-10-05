// Dev-only: mount the Agentation toolbar onto the STANDALONE PRD page
// (public/prd/away-prd.html), which is plain static HTML and never loads the
// React app (main.jsx). The PRD injects this module via a localhost-guarded
// <script type="module" src="/src/prd-agentation.jsx"> tag — Vite transforms it
// and resolves the bare imports below. In a production build this file isn't
// served, and the PRD's guard never adds the tag, so nothing ships.
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { Agentation } from "agentation";

const host = document.createElement("div");
host.id = "agentation-host";
document.body.appendChild(host);

createRoot(host).render(
  createElement(Agentation, { endpoint: "http://localhost:4747" })
);
