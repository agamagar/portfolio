import { createElement, lazy } from "react";

// Lazy: the iframe component and the 80 KB catalog stay out of the main bundle.
export const PlaygroundEmbed = lazy(() => import("./PlaygroundEmbed.jsx"));

// Case-page figure registry hook: a section can say  fig: "sd:states"  or
// fig: "sd:flow-returns-cs-chat-exchange?case=EX-003&fit=auto". Components are cached
// so React keeps the same element type between renders.
const cache = new Map();
export function sdFigure(spec) {
  if (!cache.has(spec)) {
    const [id, qs = ""] = spec.split("?");
    const q = Object.fromEntries(new URLSearchParams(qs));
    const props = { id, caseId: q.case, state: q.state, fit: q.fit || "auto", maxHeight: q.max ? +q.max : undefined };
    const Fig = () => createElement(PlaygroundEmbed, props);
    Fig.displayName = `SdFigure(${id})`;
    cache.set(spec, Fig);
  }
  return cache.get(spec);
}
