/// <reference lib="webworker" />
/**
 * The only place model-written code runs. See snippet.ts for the full list of
 * guarantees. This file strips network, storage and spawning globals before
 * accepting any message, then answers exactly one request.
 */
import * as THREE from "three";
import { hardenRealm, runSnippet } from "./snippet";

const post = self.postMessage.bind(self);

const BLOCKED = [
  "fetch",
  "XMLHttpRequest",
  "WebSocket",
  "EventSource",
  "WebTransport",
  "importScripts",
  "indexedDB",
  "caches",
  "BroadcastChannel",
  "Worker",
  "SharedWorker",
  "RTCPeerConnection",
  "navigator",
  "Request",
  "Response",
  "setTimeout",
  "setInterval",
];
for (const key of BLOCKED) {
  try {
    Object.defineProperty(self, key, { value: undefined, writable: false, configurable: false });
  } catch {
    /* some are non-configurable on some engines; CSP still blocks the network */
  }
}

hardenRealm();

self.onmessage = (e: MessageEvent<{ id: string; code: string; params?: Record<string, number> }>) => {
  const { id, code, params } = e.data ?? {};
  try {
    const geo = runSnippet(THREE, String(code ?? ""), params ?? {});
    const transfer = [geo.position.buffer, geo.normal?.buffer, geo.uv?.buffer].filter(Boolean) as ArrayBuffer[];
    post({ id, ok: true, geometry: geo }, transfer);
  } catch (err) {
    post({ id, ok: false, error: err instanceof Error ? err.message : String(err) });
  }
};
