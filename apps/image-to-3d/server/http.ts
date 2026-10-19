import { log } from "./log.js";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code = "error",
    readonly headers: Record<string, string> = {},
  ) {
    super(message);
  }
}

const logError = (event: string, f: Record<string, unknown>) => log(event, f, "error");

const SECURITY_HEADERS = {
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
};

export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...SECURITY_HEADERS, ...headers },
  });
}

export function errorResponse(err: unknown): Response {
  if (err instanceof HttpError) {
    if (err.status >= 500) logError("http_error", { status: err.status, code: err.code });
    return json({ error: err.message, code: err.code }, err.status, err.headers);
  }
  logError("unhandled", { error: err instanceof Error ? `${err.name}: ${err.message}` : String(err) });
  return json({ error: "Something went wrong on the server.", code: "internal" }, 500);
}

/** Wraps a handler so thrown HttpErrors become JSON responses. */
export function route(fn: (req: Request) => Promise<Response>): (req: Request) => Promise<Response> {
  return async (req) => {
    try {
      return await fn(req);
    } catch (err) {
      return errorResponse(err);
    }
  };
}

export async function readJson<T = unknown>(req: Request, maxBytes: number): Promise<T> {
  const type = req.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) throw new HttpError(415, "Expected application/json", "bad_content_type");
  const len = Number(req.headers.get("content-length") ?? "0");
  if (len > maxBytes) throw new HttpError(413, `Request is larger than ${Math.round(maxBytes / 1e6)} MB`, "too_large");
  const buf = await readBody(req, maxBytes);
  try {
    return JSON.parse(new TextDecoder().decode(buf)) as T;
  } catch {
    throw new HttpError(400, "Malformed JSON body", "bad_json");
  }
}

export async function readBody(req: Request, maxBytes: number): Promise<Uint8Array> {
  if (!req.body) return new Uint8Array();
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new HttpError(413, `Request is larger than ${(maxBytes / 1e6).toFixed(1)} MB`, "too_large");
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let o = 0;
  for (const c of chunks) {
    out.set(c, o);
    o += c.byteLength;
  }
  return out;
}

/**
 * The caller's IP. On Vercel, x-vercel-forwarded-for is set by the edge and can't be spoofed by
 * the client, so it wins. x-forwarded-for / x-real-ip are only trusted off Vercel (local dev,
 * tests), where there is no edge to overwrite them.
 */
export function clientIp(req: Request): string {
  const vercel = req.headers.get("x-vercel-forwarded-for");
  if (vercel) return vercel.split(",")[0].trim();
  if (process.env.VERCEL) return "unknown";
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "local";
}

/** Newline-delimited JSON stream: one event per line, flushed as produced. */
export function ndjson(run: (send: (event: Record<string, unknown>) => void) => Promise<void>): Response {
  const enc = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        try {
          controller.enqueue(enc.encode(JSON.stringify(event) + "\n"));
        } catch {
          /* client went away */
        }
      };
      try {
        await run(send);
      } catch (err) {
        const e = err instanceof HttpError ? err : null;
        if (!e) console.error("[image-to-3d] stream failed", err);
        send({ type: "error", message: e?.message ?? "Generation failed on the server.", code: e?.code ?? "internal" });
      } finally {
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }
    },
  });
  return new Response(stream, {
    status: 200,
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store, no-transform",
      "x-content-type-options": "nosniff",
      "x-accel-buffering": "no",
    },
  });
}
