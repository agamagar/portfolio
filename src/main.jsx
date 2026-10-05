import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./tailwind.css";
import "@fontsource-variable/stack-sans-headline"; // Stack Sans Headline (OFL-1.1, Fontsource) for the case header, 2026-09-06
import "./index.css";
import { startSmoothScroll } from "./ui/smoothScroll";

// inertial wheel scroll for the whole site; no-op under reduced motion
startSmoothScroll();

// Agentation visual-feedback toolbar — dev-only, so it never ships in a production
// build. `endpoint` points at the local agentation-mcp server (`npm run dev:all`),
// which now persists annotations to ~/.agentation/store.db. Click the toolbar
// (bottom-right) to annotate any element; annotations sync to :4747 for the agent.
const Agentation = import.meta.env.DEV
  ? React.lazy(() =>
      import("agentation").then((m) => ({ default: m.Agentation }))
    )
  : null;

// NOTE: Agentation is rendered OUTSIDE <StrictMode>. StrictMode double-invokes
// mount→unmount→remount in dev; the toolbar attaches imperatively to document.body
// and its guarded remount doesn't re-add the floater, so it appears then vanishes.
// Keeping it out of StrictMode keeps the floater stable. App stays in StrictMode.
ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <React.StrictMode>
      <App />
    </React.StrictMode>
    {Agentation && (
      <React.Suspense fallback={null}>
        <Agentation endpoint="http://localhost:4747" />
      </React.Suspense>
    )}
  </>
);
