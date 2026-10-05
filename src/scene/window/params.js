// The one nested params object for the window scene.
//
//   params = {
//     dims,                                    the three absolute inputs (m): W, gap, sillDepth
//     renderer, post, camera, lights, time,    engine (params.core.js)
//     sky, screen, debug,                      engine (params.core.js)
//     room,                                    params.room.js (lengths in W)
//     outside,                                 params.outside.js (near in W, far in m)
//   }
//
// Layers, applied in order every time the look changes (looks.js):
//   base (these files) -> look patch -> URL ?set= overrides -> setParams() patches
// so switching looks never loses a tool's or the GUI's own changes.

import { CORE_PARAMS } from "./params.core.js";
import { ROOM_PARAMS } from "./params.room.js";
import { OUTSIDE_PARAMS } from "./params.outside.js";

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

export function clone(v) {
  if (Array.isArray(v)) return v.map(clone);
  if (isObj(v)) {
    const o = {};
    for (const k of Object.keys(v)) o[k] = clone(v[k]);
    return o;
  }
  return v;
}

// Deep merge src into dst (in place). Arrays and scalars replace.
export function deepMerge(dst, src) {
  if (!isObj(src)) return dst;
  for (const k of Object.keys(src)) {
    const v = src[k];
    if (isObj(v)) {
      if (!isObj(dst[k])) dst[k] = {};
      deepMerge(dst[k], v);
    } else dst[k] = clone(v);
  }
  return dst;
}

// Replace the CONTENTS of `live` with `next`, keeping the same object identities
// where both are objects (window.__windowScene.params and GUI bindings stay valid).
export function assignInPlace(live, next) {
  for (const k of Object.keys(live)) if (!(k in next)) delete live[k];
  for (const k of Object.keys(next)) {
    const v = next[k];
    if (isObj(v) && isObj(live[k])) assignInPlace(live[k], v);
    else live[k] = clone(v);
  }
  return live;
}

export function baseParams() {
  return clone({ ...CORE_PARAMS, room: ROOM_PARAMS, outside: OUTSIDE_PARAMS });
}

export function getPath(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

// A patch object from a dotted path: patchFromPath("a.b", 1) -> { a: { b: 1 } }
export function patchFromPath(path, value) {
  const keys = path.split(".");
  const root = {};
  let o = root;
  keys.forEach((k, i) => {
    if (i === keys.length - 1) o[k] = value;
    else o = o[k] = {};
  });
  return root;
}

// Parses one ?set= value: numbers, true/false/null, JSON arrays, else a string
// (colours travel as %23rrggbb in a URL).
export function parseValue(s) {
  const t = String(s).trim();
  if (t === "true") return true;
  if (t === "false") return false;
  if (t === "null") return null;
  if (/^-?(\d+\.?\d*|\.\d+)(e-?\d+)?$/i.test(t)) return Number(t);
  if (t.startsWith("[")) {
    try {
      return JSON.parse(t);
    } catch {
      /* fall through */
    }
  }
  return t;
}

// "a.b.c:value,d.e:value" -> one merged patch. A comma only splits where the
// next item starts with a path and a colon, so JSON arrays survive.
export function parseSet(str) {
  const patch = {};
  if (!str) return patch;
  for (const item of String(str).split(/,(?=\s*[A-Za-z_][\w.]*\s*:)/)) {
    const i = item.indexOf(":");
    if (i < 1) continue;
    const path = item.slice(0, i).trim();
    if (!/^[A-Za-z_][\w.]*$/.test(path)) continue;
    deepMerge(patch, patchFromPath(path, parseValue(item.slice(i + 1))));
  }
  return patch;
}

// Linear sRGB triplet from "#rrggbb" (colour inputs are authored as display hex).
export function hexToLinear(hex) {
  const h = String(hex).replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const f = (c) => {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return [f((n >> 16) & 255), f((n >> 8) & 255), f(n & 255)];
}
