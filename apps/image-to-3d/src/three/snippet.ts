/**
 * Constrained three.js snippets for parts the spec's primitives can't express.
 *
 * Model output is NEVER evaluated on the main page. `runSnippet` is only called
 * inside sandbox.worker.ts, a dedicated Web Worker that:
 *   - has no DOM (workers never do),
 *   - has its network/storage globals removed before any snippet runs,
 *   - is served with `Content-Security-Policy: default-src 'none'` in production
 *     (vercel.json), so even a recovered `fetch` has nowhere to connect,
 *   - is created per snippet and terminated after a hard timeout.
 * The static check below is defence in depth on top of that, not the boundary.
 */
import type * as THREE_NS from "three";

export const SNIPPET_TIMEOUT_MS = 2500;
export const SNIPPET_MAX_VERTICES = 150_000;

const DENY = [
  "import",
  "export",
  "fetch",
  "XMLHttpRequest",
  "WebSocket",
  "EventSource",
  "WebTransport",
  "importScripts",
  "postMessage",
  "self",
  "globalThis",
  "window",
  "document",
  "eval",
  "Function",
  "constructor",
  "prototype",
  "__proto__",
  "navigator",
  "location",
  "indexedDB",
  "caches",
  "Worker",
  "SharedArrayBuffer",
  "Atomics",
  "setTimeout",
  "setInterval",
  "require",
  "process",
  "Reflect",
  "Proxy",
];
const DENY_RE = new RegExp(`\\b(${DENY.join("|")})\\b`);

/** Returns a reason string if the code is rejected, null if it may run. */
export function checkSnippet(code: string): string | null {
  if (!code.trim()) return "empty snippet";
  if (code.length > 4000) return "snippet is longer than 4000 characters";
  const m = DENY_RE.exec(code);
  if (m) return `snippet uses a forbidden identifier: ${m[1]}`;
  // computed property access built from strings is the classic way around a deny-list
  if (/\[\s*["'`][^\]]*\+/.test(code) || /\[[^\]]*`/.test(code)) return "snippet uses computed string property access";
  if (!/\breturn\b/.test(code)) return "snippet must return a BufferGeometry";
  return null;
}

/**
 * Close the classic escape from a deny-list: reaching the Function constructor
 * through a computed property, e.g. const c = "constr" + "uctor"; [][c][c]("…").
 * Poisons .constructor on every function prototype in this realm. Call once,
 * inside the worker only (it would break code that relies on it).
 */
export function hardenRealm(): void {
  const protos = [
    Function.prototype,
    Object.getPrototypeOf(async function () {}),
    Object.getPrototypeOf(function* () {}),
    Object.getPrototypeOf(async function* () {}),
  ];
  for (const proto of protos) {
    try {
      Object.defineProperty(proto, "constructor", { value: undefined, writable: false, configurable: false });
    } catch {
      /* already hardened */
    }
  }
}

export interface SerializedGeometry {
  position: Float32Array;
  normal: Float32Array | null;
  uv: Float32Array | null;
  index: Uint32Array | null;
}

/** Runs one snippet with THREE in scope. Call only inside the sandbox worker (or tests). */
export function runSnippet(THREE: typeof THREE_NS, code: string, params: Record<string, number> = {}): SerializedGeometry {
  const reason = checkSnippet(code);
  if (reason) throw new Error(reason);
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const fn = new Function("THREE", "params", `"use strict";\n${code}`) as (t: typeof THREE_NS, p: Record<string, number>) => unknown;
  const frozenParams = Object.freeze({ ...params });
  const out = fn(THREE, frozenParams);
  const geos = (Array.isArray(out) ? out : [out]).filter((g): g is THREE_NS.BufferGeometry => !!g && (g as THREE_NS.BufferGeometry).isBufferGeometry === true);
  if (geos.length === 0) throw new Error("snippet did not return a BufferGeometry");
  return serialize(geos);
}

function serialize(geos: THREE_NS.BufferGeometry[]): SerializedGeometry {
  const parts = geos.map((g) => (g.index ? g.toNonIndexed() : g));
  for (const g of parts) if (!g.getAttribute("normal")) g.computeVertexNormals();
  const count = parts.reduce((n, g) => n + (g.getAttribute("position")?.count ?? 0), 0);
  if (count === 0) throw new Error("snippet geometry is empty");
  if (count > SNIPPET_MAX_VERTICES) throw new Error(`snippet geometry has ${count} vertices (max ${SNIPPET_MAX_VERTICES})`);
  const position = new Float32Array(count * 3);
  const normal = new Float32Array(count * 3);
  const hasUv = parts.every((g) => g.getAttribute("uv"));
  const uv = hasUv ? new Float32Array(count * 2) : null;
  let o = 0;
  for (const g of parts) {
    const p = g.getAttribute("position");
    const n = g.getAttribute("normal");
    for (let i = 0; i < p.count; i++) {
      position[(o + i) * 3] = p.getX(i);
      position[(o + i) * 3 + 1] = p.getY(i);
      position[(o + i) * 3 + 2] = p.getZ(i);
      normal[(o + i) * 3] = n.getX(i);
      normal[(o + i) * 3 + 1] = n.getY(i);
      normal[(o + i) * 3 + 2] = n.getZ(i);
    }
    if (uv) {
      const u = g.getAttribute("uv");
      for (let i = 0; i < u.count; i++) {
        uv[(o + i) * 2] = u.getX(i);
        uv[(o + i) * 2 + 1] = u.getY(i);
      }
    }
    o += p.count;
  }
  for (let i = 0; i < position.length; i++) {
    if (!Number.isFinite(position[i]) || Math.abs(position[i]) > 50) throw new Error("snippet geometry has non-finite or out-of-range coordinates");
  }
  return { position, normal, uv, index: null };
}

/** Main-thread side: rebuild a BufferGeometry from worker output, validating again. */
export function deserialize(THREE: typeof THREE_NS, s: SerializedGeometry): THREE_NS.BufferGeometry {
  if (!(s.position instanceof Float32Array) || s.position.length % 3 !== 0) throw new Error("bad geometry from sandbox");
  if (s.position.length / 3 > SNIPPET_MAX_VERTICES) throw new Error("sandbox geometry too large");
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(s.position, 3));
  if (s.normal instanceof Float32Array && s.normal.length === s.position.length) g.setAttribute("normal", new THREE.BufferAttribute(s.normal, 3));
  else g.computeVertexNormals();
  if (s.uv instanceof Float32Array && s.uv.length === (s.position.length / 3) * 2) g.setAttribute("uv", new THREE.BufferAttribute(s.uv, 2));
  g.computeBoundingBox();
  g.computeBoundingSphere();
  return g;
}
