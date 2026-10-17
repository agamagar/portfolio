// DEV-ONLY ?morphdebug=1: live timeline of the hero's load, ms since navigation start (performance.now()).
// Marks come from Hello.jsx and HeroMorph.jsx; each is recorded once. The overlay (bottom left) lists them with
// the gap to the one above, and window.__md holds the same object. Off (a no-op) unless the flag is in the URL.
const ON = import.meta.env.DEV && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("morphdebug") === "1";
const ORDER = ["stage_reveal", "build_ready", "morph_first_frame", "morph_t0.1", "face_glow_onset", "reveal_T0", "first_data_in", "morph_t0.5", "morph_t1", "last_data_in"];
let box;
const paint = () => {
  if (!box) {
    box = document.createElement("pre");
    box.style.cssText = "position:fixed;left:8px;bottom:8px;z-index:99999;margin:0;padding:8px 10px;font:11px/1.45 ui-monospace,monospace;color:#fff;background:rgba(0,0,0,.78);border-radius:8px;pointer-events:none";
    document.body.appendChild(box);
  }
  const got = ORDER.filter((k) => k in window.__md);
  let prev = null;
  box.textContent = "morphdebug (ms since navigation)\n" + got.map((k) => { const v = window.__md[k]; const s = `${k.padEnd(18)} ${String(Math.round(v)).padStart(6)}${prev == null ? "" : `  +${Math.round(v - prev)}`}`; prev = v; return s; }).join("\n");
};
export const mark = (k) => {
  if (!ON) return;
  const md = (window.__md ||= {});
  if (k in md) return;
  md[k] = performance.now();
  console.log(`[morphdebug] ${k} ${Math.round(md[k])} ms`);
  if (document.body) paint();
};
