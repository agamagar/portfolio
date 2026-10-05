// The window scene is the folio page's default hero (Agam, 2026-09-30: "can we make it
// the default view"). ?scene=off (or classic) shows the page without it, the old Living
// Sky band; ?scene=window forces it on.
//
// PHONES GET THE CLASSIC HERO (Agam, 2026-10-05: "push the non-three.js view for mobile
// viewing"): on a narrow screen, or a touch screen up to tablet width, the scene is off
// unless the URL asks for it with ?scene=window. The scene is a heavy WebGPU/WebGL
// render built for a desk-sized view, and its interactions (hover, drag) need a mouse.
const MOBILE_QUERY = "(max-width: 720px), (pointer: coarse) and (max-width: 1024px)";

export function windowSceneOn(search = typeof window !== "undefined" ? window.location.search : "") {
  const v = new URLSearchParams(search).get("scene");
  if (v === "off" || v === "classic") return false;
  if (v === "window") return true;
  const mobile = typeof window !== "undefined" && !!window.matchMedia?.(MOBILE_QUERY).matches;
  return !mobile;
}
