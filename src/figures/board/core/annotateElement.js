// Annotate a live DOM element: a transparent whiteboard overlay that writes notes in the margins around it
// and draws marks on the parts it is talking about. Parts are found with CSS selectors (inside the element)
// or given as fractions of the element's box, so it works on any component, not only images.
//
//   const a = annotateElement(el, [
//     { selector: ".price", text: "Anchor the price first", kind: "circle", color: "red", side: "right" },
//     { rect: [0, 0.8, 1, 0.2], text: "One loud action", kind: "box" },
//   ], { margin: [120, 300], animate: "inview" });
//   a.destroy();

import { mountBoard } from "./mount.js";

const num = (v, d) => (Array.isArray(v) ? v : [d, d]);

export function annotateElement(target, notes, opts = {}) {
  const [my, mx] = num(opts.margin, 200);        // [vertical, horizontal] room around the element, in px
  const cs = getComputedStyle(target);
  const restore = cs.position === "static" ? (target.style.position = "relative", true) : false;
  const overlay = document.createElement("div");
  overlay.setAttribute("aria-hidden", "true");   // the notes are decoration for sighted readers; give the content its own description
  overlay.style.cssText = "position:absolute;pointer-events:none;overflow:visible;z-index:" + (opts.zIndex ?? 5);
  target.appendChild(overlay);
  let ctl = null, ro = null, timer = 0;

  const toSpec = () => {
    const tr = target.getBoundingClientRect();
    const w = Math.max(1, tr.width), h = Math.max(1, tr.height);
    const resolved = notes.map((n) => {
      let rect = n.rect;
      if (n.selector) {
        const el = target.querySelector(n.selector);
        if (el) {
          const r = el.getBoundingClientRect();
          rect = [(r.left - tr.left) / w, (r.top - tr.top) / h, r.width / w, r.height / h];
        }
      }
      return { ...n, rect: rect ?? undefined, at: rect ? undefined : n.at ?? [0.5, 0.5] };
    });
    overlay.style.left = -mx + "px";
    overlay.style.top = -my + "px";
    overlay.style.width = w + 2 * mx + "px";
    overlay.style.height = h + 2 * my + "px";
    return {
      layout: "annotate", overlay: true, bg: "none", surface: "clean",
      w: w + 2 * mx, h: h + 2 * my, marginX: mx, marginY: my,
      target: { x: mx, y: my, w, h }, image: { w, h },
      notes: resolved, seed: opts.seed ?? "annot", noteSize: opts.noteSize ?? 30, pen: opts.pen ?? 4.2,
      pace: opts.pace ?? 1, maxDuration: opts.maxDuration ?? 14,
    };
  };

  const mount = (animate) => {
    ctl?.destroy();
    ctl = mountBoard(overlay, toSpec(), { animate, speed: opts.speed ?? 1, onDone: opts.onDone });
  };
  mount(opts.animate ?? "inview");
  if (typeof ResizeObserver === "function") {
    ro = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => { mount(false); }, 150);   // a resized layout re-lays out as a finished board
    });
    ro.observe(target);
  }
  return {
    get board() { return ctl; },
    replay: () => ctl?.replay(),
    finish: () => ctl?.finish(),
    destroy() {
      ro?.disconnect();
      clearTimeout(timer);
      ctl?.destroy();
      overlay.remove();
      if (restore) target.style.position = "";
    },
  };
}
