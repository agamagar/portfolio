/**
 * Structured logs: one JSON object per line on stdout (Vercel keeps these as searchable logs).
 * Fields are scrubbed so an image can never end up in a log: anything that looks like base64
 * image data, a data: URL or a large buffer is replaced, and keys like image/data/base64 are dropped.
 */
const DROP_KEYS = /^(image|images|data|base64|render|bytes|body|cookie|authorization|token|password|secret)$/i;

function scrub(v: unknown, depth = 0): unknown {
  if (v == null || typeof v === "number" || typeof v === "boolean") return v;
  if (typeof v === "string") {
    if (/^data:/i.test(v) || (v.length > 200 && /^[A-Za-z0-9+/=_-]+$/.test(v.slice(0, 200)))) return "[redacted blob]";
    return v.length > 300 ? `${v.slice(0, 300)}…` : v;
  }
  if (v instanceof Uint8Array || v instanceof ArrayBuffer) return "[redacted bytes]";
  if (depth > 3) return "[deep]";
  if (Array.isArray(v)) return v.slice(0, 20).map((x) => scrub(x, depth + 1));
  if (typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v)) if (!DROP_KEYS.test(k)) out[k] = scrub(x, depth + 1);
    return out;
  }
  return String(v);
}

export type LogLevel = "info" | "warn" | "error";

/** The sink is swappable so tests can read what was logged. */
export const sink: { write: (line: string) => void } = { write: (line) => console.log(line) };

export function log(event: string, fields: Record<string, unknown> = {}, level: LogLevel = "info"): void {
  sink.write(JSON.stringify({ t: new Date().toISOString(), level, event, ...(scrub(fields) as object) }));
}
