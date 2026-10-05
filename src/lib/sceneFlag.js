// The window scene is the folio page's default hero (Agam, 2026-09-30: "can we make it
// the default view"). ?scene=off (or classic) shows the page without it, the old Living
// Sky band; ?scene=window still works and changes nothing.
export function windowSceneOn(search = typeof window !== "undefined" ? window.location.search : "") {
  const v = new URLSearchParams(search).get("scene");
  return v !== "off" && v !== "classic";
}
