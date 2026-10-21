// Face <-> URL hash. Only what differs from the defaults is stored, as JSON, deflated, base64url: #f=...
import { complete, constrain } from "../faceTaste/index.js";
import { NUMERIC, COLORS, SELECTS, BOOLS, get, set } from "../faceTaste/params.js";

const b64 = (u8) => { let s = ""; for (const b of u8) s += String.fromCharCode(b); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
const unb64 = (t) => Uint8Array.from(atob(t.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
async function pipe(data, stream) { const w = stream.writable.getWriter(); w.write(data).catch(() => {}); w.close().catch(() => {}); return new Uint8Array(await new Response(stream.readable).arrayBuffer()); }
const has = typeof CompressionStream !== "undefined";

const diff = (face) => {
  const d = {}, base = complete({}), cur = complete(face), style = cur.hair.style;
  for (const p of [...Object.keys(NUMERIC), ...Object.keys(COLORS), ...Object.keys(SELECTS), ...Object.keys(BOOLS)]) {
    const v = get(cur, p);
    if (p.startsWith("hair.") && typeof v === "number" && p !== "hair.seed") { if (v !== get(complete({ hair: { style } }), p)) set(d, p, v); }
    else if (v !== get(base, p)) set(d, p, v);
  }
  return d;
};
export async function encodeFace(face) {
  const json = new TextEncoder().encode(JSON.stringify(diff(face)));
  return has ? "z" + b64(await pipe(json, new CompressionStream("deflate-raw"))) : "j" + b64(json);
}
export async function decodeFace(token) {
  try {
    const raw = unb64(token.slice(1));
    const json = token[0] === "z" ? await pipe(raw, new DecompressionStream("deflate-raw")) : raw;
    const cfg = JSON.parse(new TextDecoder().decode(json));
    if (!cfg || typeof cfg !== "object") return null;
    // hex colours, numbers, selects are validated by constrain(); anything unknown is dropped by complete()
    const clean = {};
    for (const p of [...Object.keys(NUMERIC), ...Object.keys(COLORS), ...Object.keys(SELECTS), ...Object.keys(BOOLS)]) { const v = get(cfg, p); if (v !== undefined && (typeof v === "number" ? Number.isFinite(v) : typeof v === "string" ? v.length < 40 : typeof v === "boolean")) set(clean, p, v); }
    return constrain(clean);
  } catch { return null; }
}
export const faceUrl = async (face) => `${location.origin}/face-maker#f=${await encodeFace(face)}`;
export const hashToken = () => (location.hash.match(/[#&]f=([zj][A-Za-z0-9_-]+)/) || [])[1] || null;
