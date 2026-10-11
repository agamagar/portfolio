// Scene -> SVG string. Letters are outline paths from the font (no font file needed), so an export is a
// single self-contained SVG. In animated mode each outlined letter is revealed by a mask that follows its
// centre-line pen strokes, which is what makes the text look written rather than wiped in.

import { HAND } from "../data/markerHand.data.js";
import { glyphTransform } from "./text.js";
import { f1 } from "./geom.js";
import { makeRng, hashSeed } from "./rng.js";
import { STICKY } from "./shapes.js";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const t3 = (v) => (Math.round(v * 1000) / 1000).toString();
const MASK_W = Math.round(HAND.pen * 1.5);

function surface(scene, id) {
  const { w, h, bg } = scene;
  if (bg === "none" || bg === "transparent") return "";
  let s = `<rect width="${w}" height="${h}" fill="${esc(bg)}"/>`;
  if (scene.surface === "used") {
    // a whiteboard that has been written on before: faint ghosts of erased marker and a soft gloss
    const r = makeRng(hashSeed(String(scene.seed) + "surface"));
    let g = "";
    for (let i = 0; i < 9; i++) {
      const x = r.range(0.04, 0.9) * w, y = r.range(0.05, 0.95) * h, L = r.range(0.12, 0.34) * w, a = r.sym(0.22);
      const x2 = x + Math.cos(a) * L, y2 = y + Math.sin(a) * L * 0.5;
      g += `<path d="M${f1(x)} ${f1(y)}Q${f1((x + x2) / 2 + r.sym(30))} ${f1((y + y2) / 2 + r.sym(30))} ${f1(x2)} ${f1(y2)}" stroke-width="${f1(r.range(18, 54))}" stroke-opacity="${f1(r.range(1.5, 3.6)) / 100}"/>`;
    }
    s += `<g fill="none" stroke="#7d8798" stroke-linecap="round" filter="url(#${id}blur)">${g}</g>`;
    s += `<rect width="${w}" height="${h}" fill="url(#${id}gloss)"/>`;
  }
  return s;
}

export function sceneToSVG(scene, { animated = false, id = "b", title } = {}) {
  const { w, h } = scene;
  const defs = [];
  const gdefs = new Map();                       // letter -> { id, d }: each outline is defined once and <use>d
  const gref = (g) => {
    if (!gdefs.has(g.ch)) gdefs.set(g.ch, { id: `${id}g${gdefs.size}`, d: g.d });
    return gdefs.get(g.ch).id;
  };
  let body = "";
  let n = 0;

  for (const it of scene.items) {
    if (it.kind === "text") {
      const op = it.op != null ? ` fill-opacity="${it.op}"` : "";
      body += `<g fill="${it.color}"${op}>`;
      for (const g of it.glyphs) {
        const tf = glyphTransform(g);
        if (g.pen) {
          body += `<g transform="${tf}" fill="none" stroke="${it.color}" stroke-width="${HAND.pen}" stroke-linecap="round" stroke-linejoin="round">`;
          for (const s of g.strokes) {
            body += `<path d="${s.d}"${animated ? ` pathLength="1" data-k="s" data-t="${t3(s.t0)},${t3(s.dur)}"` : ""}/>`;
          }
          body += `</g>`;
          continue;
        }
        const ref = gref(g);
        if (!animated) {
          body += `<use transform="${tf}" href="#${ref}" xlink:href="#${ref}"/>`;
          continue;
        }
        const mid = `${id}m${n++}`;
        let m = `<mask id="${mid}" maskUnits="userSpaceOnUse" x="-300" y="-400" width="1700" height="1700"><g fill="none" stroke="#fff" stroke-width="${MASK_W}" stroke-linecap="round" stroke-linejoin="round">`;
        for (const s of g.strokes) m += `<path d="${s.d}" pathLength="1" data-k="m" data-t="${t3(s.t0)},${t3(s.dur)}"/>`;
        defs.push(m + `</g></mask>`);
        body += `<g transform="${tf}"><use href="#${ref}" xlink:href="#${ref}" mask="url(#${mid})" data-k="g" data-m="url(#${mid})" data-t="${t3(g.t0)},${t3(g.t1 - g.t0)}"/></g>`;
      }
      body += `</g>`;
    } else if (it.kind === "ink") {
      for (const s of it.strokes) {
        const blend = s.blend ? ` style="mix-blend-mode:${s.blend}"` : "";
        const op = s.op != null && s.op !== 1 ? ` stroke-opacity="${s.op}"` : "";
        body += `<path d="${s.d}" fill="none" stroke="${s.color}" stroke-width="${f1(s.w)}"${op}${blend}${animated ? ` pathLength="1" data-k="s" data-t="${t3(s.t0)},${t3(s.dur)}"` : ""}/>`;
      }
    } else if (it.kind === "sticky") {
      for (const f of it.fills) {
        const fold = Math.min(f.w, f.h) * 0.16 * f.curl;
        const c = f.c;
        const anim = animated ? ` data-k="p" data-t="${t3(f.t0)},${t3(f.dur)}" data-c="${f1(c[0])},${f1(c[1])}" data-r="${f1(f.rot)}"` : "";
        body += `<g transform="rotate(${f1(f.rot)} ${f1(c[0])} ${f1(c[1])})"${anim}>` +
          `<rect x="${f1(f.x + 3)}" y="${f1(f.y + 7)}" width="${f1(f.w)}" height="${f1(f.h)}" fill="#1b2230" fill-opacity=".16" filter="url(#${id}blur)"/>` +
          `<rect x="${f1(f.x)}" y="${f1(f.y)}" width="${f1(f.w)}" height="${f1(f.h)}" fill="${f.fill}" rx="2"/>` +
          `<rect x="${f1(f.x)}" y="${f1(f.y)}" width="${f1(f.w)}" height="${f1(f.h * 0.14)}" fill="#fff" fill-opacity=".22" rx="2"/>` +
          `<path d="M${f1(f.x + f.w - fold)} ${f1(f.y + f.h)}L${f1(f.x + f.w)} ${f1(f.y + f.h - fold)}L${f1(f.x + f.w)} ${f1(f.y + f.h)}Z" fill="${f.edge}"/></g>`;
      }
    } else if (it.kind === "image") {
      const cid = `${id}c${n++}`;
      defs.push(`<clipPath id="${cid}"><rect x="${f1(it.x)}" y="${f1(it.y)}" width="${f1(it.w)}" height="${f1(it.h)}" rx="${it.radius}"/></clipPath>`);
      const anim = animated ? ` data-k="f" data-t="${t3(it.t0)},${t3(it.dur)}"` : "";
      body += `<g${anim}><rect x="${f1(it.x + 2)}" y="${f1(it.y + 6)}" width="${f1(it.w)}" height="${f1(it.h)}" rx="${it.radius}" fill="#1b2230" fill-opacity=".14" filter="url(#${id}blur)"/>` +
        `<image href="${esc(it.href)}" x="${f1(it.x)}" y="${f1(it.y)}" width="${f1(it.w)}" height="${f1(it.h)}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${cid})"/>` +
        `<rect x="${f1(it.x)}" y="${f1(it.y)}" width="${f1(it.w)}" height="${f1(it.h)}" rx="${it.radius}" fill="none" stroke="#1b2230" stroke-opacity=".18"/></g>`;
    }
  }

  const common =
    `<filter id="${id}blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>` +
    `<linearGradient id="${id}gloss" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".0"/><stop offset=".55" stop-color="#eef2f7" stop-opacity=".35"/><stop offset="1" stop-color="#dfe5ee" stop-opacity=".35"/></linearGradient>`;
  for (const { id: gid, d } of gdefs.values()) defs.unshift(`<path id="${gid}" d="${d}"/>`);
  const label = esc(title ?? scene.label ?? "Whiteboard");
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="display:block;width:100%;height:auto">` +
    `<title>${label}</title><defs>${common}${defs.join("")}</defs>` +
    surface(scene, id) +
    `<g fill="none" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`
  );
}
