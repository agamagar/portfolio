import * as THREE from "three";
import type { CustomPartSpec } from "../../shared/spec";
import { checkSnippet, deserialize, SNIPPET_TIMEOUT_MS, type SerializedGeometry } from "./snippet";

/** Runs one snippet in a fresh, disposable worker. Never evaluates on this thread. */
function runInWorker(code: string): Promise<THREE.BufferGeometry> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./sandbox.worker.ts", import.meta.url), { type: "module", name: "snippet-sandbox" });
    const id = Math.random().toString(36).slice(2);
    const timer = window.setTimeout(() => {
      worker.terminate();
      reject(new Error(`timed out after ${SNIPPET_TIMEOUT_MS} ms`));
    }, SNIPPET_TIMEOUT_MS);
    worker.onmessage = (e: MessageEvent<{ id: string; ok: boolean; geometry?: SerializedGeometry; error?: string }>) => {
      if (e.data?.id !== id) return;
      window.clearTimeout(timer);
      worker.terminate();
      if (!e.data.ok || !e.data.geometry) return reject(new Error(e.data.error || "sandbox failed"));
      try {
        resolve(deserialize(THREE, e.data.geometry));
      } catch (err) {
        reject(err);
      }
    };
    worker.onerror = (e) => {
      window.clearTimeout(timer);
      worker.terminate();
      reject(new Error(e.message || "sandbox error"));
    };
    worker.postMessage({ id, code });
  });
}

export async function buildCustomGeometries(parts: CustomPartSpec[]): Promise<{ geometries: Map<string, THREE.BufferGeometry>; errors: string[] }> {
  const geometries = new Map<string, THREE.BufferGeometry>();
  const errors: string[] = [];
  await Promise.all(
    parts.map(async (p) => {
      const reason = checkSnippet(p.code);
      if (reason) {
        errors.push(`${p.id}: ${reason}`);
        return;
      }
      try {
        geometries.set(p.id, await runInWorker(p.code));
      } catch (err) {
        errors.push(`${p.id}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }),
  );
  return { geometries, errors };
}
