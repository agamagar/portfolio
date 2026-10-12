// ONE CONTINUOUS SHAPE FOR A FOOTER BUBBLE (12 Oct 2026, mv4zdmlv-88gvx4: "the
// tails are not properly connected to the pills. Can we make them an SVG shape so
// that the shadows don't break, especially in white mode?").
//
// Before, the pill was a CSS box and the tail a separate clipped piece beside it,
// so the glass film, the rim and the shadow all showed a seam at the joint. Now
// the whole bubble (pill AND tail) is ONE path, and everything is built from it:
//   - the GLASS: an element with the film and backdrop blur, masked by path(d)
//   - the RIM: that path stroked (clipped to its inside) with a vertical gradient:
//     a bright top edge, a soft side, a faint dark bottom (the old inset shadows)
//   - the SHADOW: a blurred copy of the path, clipped so it only shows OUTSIDE the
//     shape (a frame minus the bubble, even-odd), painted AFTER the glass. As a sibling, not an ancestor (a filter on
//     an ancestor would make it the backdrop root and the glass would stop
//     blurring the page); and after, not before, because Safari applies a
//     backdrop-filter to the element's whole rectangle (a mask or clip-path does
//     not cut it), so a shadow underneath was blurred and tinted into a visible
//     rectangle around each bubble.
// The width animates (the text opens), so the path is regenerated from the
// bubble's measured width on every resize, imperatively (no React state per frame).
// The tail geometry is the original curl's: the exact outline of the old painted
// tail (a 16 px corner, a 10 px cut, the pill's own 17 px circle).

import { useEffect, useId, useRef } from "react";

const H = 34;      // the pill's height
const R = H / 2;   // fully rounded ends
const PAD = 7;     // how far the tail reaches beyond the pill
const SH = 24;     // room around the shape for the shadow's blur

function bubblePath(W, mirror, ox = 0, oy = 0) {
  const bw = W + 2 * PAD;
  const X0 = PAD;
  const fx = (x) => +((mirror ? bw - x : x) + ox).toFixed(2);
  const sw = (s) => (mirror ? 1 - s : s);
  const x = (v) => fx(X0 + v);
  const y = (v) => +(v + oy).toFixed(2);
  return [
    `M${x(R)} ${y(0)}`,
    `L${x(W - R)} ${y(0)}`,
    `A${R} ${R} 0 0 ${sw(1)} ${x(W)} ${y(R)}`,
    `L${x(W)} ${y(24)}`,
    `A10 10 0 0 ${sw(0)} ${x(W + 7)} ${y(33.54)}`,
    `L${x(W + 7)} ${y(H)}`,
    `L${x(W + 3)} ${y(H)}`,
    `A16 16 0 0 ${sw(1)} ${x(W - 6.83)} ${y(30.62)}`,
    `A${R} ${R} 0 0 ${sw(1)} ${x(W - R)} ${y(H)}`,
    `L${x(R)} ${y(H)}`,
    `A${R} ${R} 0 0 ${sw(1)} ${x(0)} ${y(R)}`,
    `A${R} ${R} 0 0 ${sw(1)} ${x(R)} ${y(0)}`,
    "Z",
  ].join("");
}

export default function BubbleShape({ side }) {
  const raw = useId();
  const id = "bs" + raw.replace(/[^a-zA-Z0-9]/g, "");
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    const bubble = el?.parentElement;
    if (!el || !bubble) return undefined;
    const glass = el.querySelector(".hello-foot__shape-glass");
    const paths = el.querySelectorAll("path[data-shape]");
    const narrow = window.matchMedia("(max-width: 720px)");
    let last = "";
    const apply = () => {
      const W = bubble.offsetWidth;
      if (!W) return;
      // both tails point left on phones (hello3.css), otherwise toward the figure
      const mirror = narrow.matches || side === "right";
      const key = W + ":" + mirror;
      if (key === last) return;
      last = key;
      const d = bubblePath(W, mirror);
      const bw = W + 2 * PAD;
      el.style.width = bw + 2 * SH + "px";
      el.style.left = -(PAD + SH) + "px";
      glass.style.width = bw + "px";
      el.querySelector(".hello-foot__shape-rim").style.width = bw + "px";
      // a MASK from the same path, not clip-path: Safari does not clip a
      // backdrop-filter by clip-path, and the blurred shadow beneath showed as a
      // tinted rectangle around the whole box
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${bw}" height="${H}" viewBox="0 0 ${bw} ${H}"><path d="${d}" fill="#000"/></svg>`;
      const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
      glass.style.webkitMaskImage = url;
      glass.style.maskImage = url;
      glass.style.webkitMaskSize = glass.style.maskSize = `${bw}px ${H}px`;
      glass.style.webkitMaskRepeat = glass.style.maskRepeat = "no-repeat";
      el.querySelectorAll("svg").forEach((s) => s.setAttribute("viewBox", `0 0 ${s.dataset.pad ? bw + 2 * SH : bw} ${s.dataset.pad ? H + 2 * SH : H}`));
      paths.forEach((p) => p.setAttribute("d", d));
      // an explicit pixel filter region (percentages of the bounding box were not
      // honoured in Safari, which cut the blurred shadow at the shape's own box)
      const f = el.querySelector(".hello-foot__shape-blur");
      f.setAttribute("x", -21); f.setAttribute("y", -21); f.setAttribute("width", bw + 42); f.setAttribute("height", H + 42);
      // THE SHADOW'S OUTSIDE-ONLY CLIP: a frame the size of the whole shadow svg
      // with the bubble cut out of it (even-odd). (An SVG mask did this first, but
      // Safari confined it to the masked shape's own bounding box, which cut the
      // blurred shadow to a rectangle around each bubble; this clip has no
      // percentage units, so nothing to misread.)
      const tw = bw + 2 * SH, th = H + 2 * SH;
      el.querySelector(".hello-foot__shape-outside").setAttribute("d", `M0 0H${tw}V${th}H0Z ${bubblePath(W, mirror, SH, SH)}`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(bubble);
    narrow.addEventListener("change", apply);
    return () => { ro.disconnect(); narrow.removeEventListener("change", apply); };
  }, [side]);

  return (
    <span className="hello-foot__shape" ref={root} aria-hidden="true">
      <span className="hello-foot__shape-glass" />
      <svg className="hello-foot__shape-shadow" data-pad="1">
        <defs>
          <filter id={id + "b"} className="hello-foot__shape-blur" filterUnits="userSpaceOnUse" x="-21" y="-21" width="200" height="76"><feGaussianBlur stdDeviation="7" /></filter>
          <clipPath id={id + "m"}><path className="hello-foot__shape-outside" clipRule="evenodd" /></clipPath>
        </defs>
        <g clipPath={`url(#${id}m)`}>
          <g transform={`translate(${SH} ${SH + 5})`} filter={`url(#${id}b)`}><path data-shape className="hello-foot__shape-shadow-fill" /></g>
        </g>
      </svg>
      <svg className="hello-foot__shape-rim">
        <defs>
          <linearGradient id={id + "g"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className="rim-top" />
            <stop offset="0.22" className="rim-mid" />
            <stop offset="0.78" className="rim-mid" />
            <stop offset="1" className="rim-bottom" />
          </linearGradient>
          <clipPath id={id + "c"}><path data-shape /></clipPath>
        </defs>
        <path data-shape fill="none" stroke={`url(#${id}g)`} strokeWidth="2" clipPath={`url(#${id}c)`} />
      </svg>
    </span>
  );
}
