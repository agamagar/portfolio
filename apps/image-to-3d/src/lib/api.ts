import type { Effort, ModelId, Usage } from "../../shared/models";
import type { Spec, Style } from "../../shared/spec";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
  }
}

export interface Session {
  authenticated: boolean;
  user: { id: string; email: string; name: string; role: "user" | "admin"; consented: boolean } | null;
  locked: boolean;
  auth: { google: boolean; mock: boolean; inviteRequired: boolean };
  termsVersion: string;
  storage: "blob" | "fs" | null;
  apiConfigured: boolean;
  mock: boolean;
  maxRefinePasses: number;
  budget: { spentUsd: number | null; limitUsd: number } | null;
}

export interface LibraryItem {
  id: string;
  title: string;
  tags: string[];
  style: Style;
  subjectKind: string;
  model: string;
  createdAt: string;
  updatedAt: string;
  score: number | null;
  passes: number;
  costUsd: number;
  triangles: number;
  files: { source?: string; left?: string; right?: string; glb?: string; thumb?: string; spec?: string };
  sizes: { glb?: number; source?: number; left?: number; right?: number; thumb?: number };
}

export interface ImagePayload {
  data: string;
  mediaType: "image/jpeg" | "image/png" | "image/webp";
}

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { credentials: "same-origin", ...init });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection.", 0, "network");
  }
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    /* not JSON */
  }
  if (!res.ok) {
    const b = body as { error?: string; code?: string } | null;
    throw new ApiError(b?.error ?? `Request failed (${res.status})`, res.status, b?.code ?? "http_error");
  }
  return body as T;
}

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

export const api = {
  session: () => request<Session>("/api/session"),
  mockLogin: (email: string, invite: string) => request<{ ok: true }>("/api/session", jsonInit("POST", { action: "mock", email, invite })),
  consent: () => request<{ ok?: true }>("/api/session", jsonInit("POST", { action: "consent" })),
  logout: () => request<{ ok: true }>("/api/session", { method: "DELETE" }),

  library: () => request<{ items: LibraryItem[] }>("/api/library"),
  item: (id: string) => request<{ item: LibraryItem; spec: Spec | null }>(`/api/library?id=${encodeURIComponent(id)}`),
  save: (body: Record<string, unknown>) => request<{ item: LibraryItem }>("/api/library", jsonInit("POST", body)),
  patch: (id: string, patch: { title?: string; tags?: string[] }) => request<{ item: LibraryItem }>("/api/library", jsonInit("PATCH", { id, ...patch })),
  remove: (id: string) => request<{ ok: true }>(`/api/library?id=${encodeURIComponent(id)}`, { method: "DELETE" }),
  upload: (id: string, name: "source" | "left" | "right" | "thumb" | "model", body: Blob) =>
    request<{ url: string; size: number }>(`/api/upload?id=${id}&name=${name}`, {
      method: "PUT",
      headers: { "content-type": body.type },
      body,
    }),

  judge: (image: ImagePayload, render: ImagePayload) =>
    request<{ score: number; critique: string; usage: Usage; costUsd: number; model: string }>("/api/judge", jsonInit("POST", { image, render })),
};

// --- streaming generation -----------------------------------------------------

export type GenerateEvent =
  | { type: "status"; stage: "analysing" | "comparing" }
  | { type: "thinking"; text: string }
  | { type: "progress"; outputChars: number }
  | { type: "retry"; attempt: number; reason: string }
  | {
      type: "result";
      mode: "create" | "refine";
      score: number | null;
      critique: string;
      changes: string[];
      spec: Spec;
      warnings: string[];
      usage: Usage;
      costUsd: number;
      model: string;
      attempts: number;
    }
  | { type: "error"; message: string; code: string };

export type GenerateResult = Extract<GenerateEvent, { type: "result" }>;

export interface GenerateBody {
  mode: "create" | "refine";
  images: { front: ImagePayload; left?: ImagePayload; right?: ImagePayload };
  style: Style;
  model: ModelId;
  effort: Effort;
  notes: string;
  render?: ImagePayload;
  spec?: Spec;
  pass?: number;
}

/** POST /api/generate and read the NDJSON event stream until a result or error. */
export async function generate(body: GenerateBody, onEvent: (e: GenerateEvent) => void, signal?: AbortSignal): Promise<GenerateResult> {
  let res: Response;
  try {
    res = await fetch("/api/generate", { ...jsonInit("POST", body), credentials: "same-origin", signal });
  } catch (err) {
    if (signal?.aborted) throw new ApiError("Cancelled", 0, "aborted");
    throw new ApiError("Can't reach the server. Check your connection.", 0, "network");
  }
  if (!res.ok || !res.body) {
    const b = (await res.json().catch(() => null)) as { error?: string; code?: string } | null;
    throw new ApiError(b?.error ?? `Generation failed (${res.status})`, res.status, b?.code ?? "http_error");
  }
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buf = "";
  let result: GenerateResult | null = null;
  for (;;) {
    const { done, value } = await reader.read();
    if (value) buf += value;
    let nl: number;
    while ((nl = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!line) continue;
      let ev: GenerateEvent;
      try {
        ev = JSON.parse(line) as GenerateEvent;
      } catch {
        continue;
      }
      if (ev.type === "error") throw new ApiError(ev.message, 502, ev.code);
      if (ev.type === "result") result = ev;
      onEvent(ev);
    }
    if (done) break;
  }
  if (!result) throw new ApiError("The generation stream ended without a result.", 502, "incomplete");
  return result;
}
