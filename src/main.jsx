import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { Guard, StaticFallback } from "./ui/Guard.jsx";
import "./tailwind.css";
import "@fontsource-variable/stack-sans-headline"; // Stack Sans Headline (OFL-1.1, Fontsource) for the case header, 2026-09-06
import "./index.css";
import { startSmoothScroll } from "./ui/smoothScroll";
import { startScrollHoverGuard } from "./ui/scrollHover";
import { startVideoGate } from "./ui/videoGate";
import { startFavicon3d } from "./lib/favicon3d";
import { introIsPlaying, introRevealed } from "./hello3/useStage";
import { heroMorphSettledOrTimeout } from "./hello3/heroMorphGate";
import "./hello3/inspect-overrides.css"; // Inspect mode's written overrides; last on purpose

// inertial wheel scroll for the whole site; no-op under reduced motion
startSmoothScroll();
startScrollHoverGuard(); // no hover while the page scrolls (ui/scrollHover.js)
startVideoGate(); // autoplay videos decode only near the viewport (ui/videoGate.js)

// tab icon morphs through solids, one-sided surfaces and 4D shapes (src/lib/favicon3d.js);
// static face under reduced motion or without WebGL2.
// LOAD ORDER (11 Oct 2026, "make the loading more smooth"): it no longer starts with the
// bundle. Its first frames compile and draw a ray-marcher, measured at 50 to 310 ms of
// main thread per frame on the home page's reveal (headless Chromium on Metal, dev and
// production), so it waits for the load event, the home intro's reveal plus its ~2 s entrance, the hero's
// morph (each capped), then an idle moment. The static face.svg shows until then.
{
  const quiet = () => (window.requestIdleCallback ? window.requestIdleCallback(() => startFavicon3d(), { timeout: 2000 }) : setTimeout(startFavicon3d, 300));
  const afterLoad = async () => {
    // the load event can fire before React has mounted the page, so look after a first idle
    // moment: the home intro, if it is playing, has flagged itself by then; any other page
    // starts straight away
    await new Promise((r) => (window.requestIdleCallback ? window.requestIdleCallback(r, { timeout: 1000 }) : setTimeout(r, 300)));
    if (introIsPlaying()) {
      await Promise.race([introRevealed, new Promise((r) => setTimeout(r, 12000))]);
      // introRevealed is now the END of the page's reveal on the morph's clock; a short breath after it
      await Promise.all([new Promise((r) => setTimeout(r, 600)), heroMorphSettledOrTimeout(6000)]);
    }
    quiet();
  };
  if (document.readyState === "complete") afterLoad();
  else window.addEventListener("load", afterLoad, { once: true });
}

// Agentation visual-feedback toolbar — dev-only, so it never ships in a production
// build. `endpoint` points at the local agentation-mcp server (`npm run dev:all`),
// which now persists annotations to ~/.agentation/store.db. Click the toolbar
// (bottom-right) to annotate any element; annotations sync to :4747 for the agent.
// QA notes layer (10 Oct): numbered tooltip pins from the full-page QA pass,
// dev-only like the toolbar below (src/ui/QaNotes.jsx, notes in qaNotesData.js; not qaNotes.js, which a case-insensitive disk resolves for "./ui/QaNotes")
const QaNotes = import.meta.env.DEV ? React.lazy(() => import("./ui/QaNotes.jsx")) : null;

// Inspect mode (12 Oct): dev-only spacing redlines + draggers, src/hello3/InspectMode.jsx (Shift+I)
const InspectMode = import.meta.env.DEV ? React.lazy(() => import("./hello3/InspectMode.jsx")) : null;

// the visitor's morphing cursor (src/ui/ContextCursor.jsx), fine pointers only
const ContextCursor = React.lazy(() => import("./ui/ContextCursor.jsx"));

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
      <Guard name="app" fallback={<StaticFallback />}><App /></Guard>
    </React.StrictMode>
    <Guard name="context-cursor"><React.Suspense fallback={null}><ContextCursor /></React.Suspense></Guard>
    {QaNotes && (
      <Guard name="qa-notes"><React.Suspense fallback={null}>
        <QaNotes />
      </React.Suspense></Guard>
    )}
    {InspectMode && (
      <Guard name="inspect-mode"><React.Suspense fallback={null}><InspectMode /></React.Suspense></Guard>
    )}
    {Agentation && (
      <Guard name="agentation"><React.Suspense fallback={null}>
        <Agentation endpoint="http://localhost:4747" />
      </React.Suspense></Guard>
    )}
  </>
);
