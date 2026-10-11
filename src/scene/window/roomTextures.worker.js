// The room's procedural textures, generated off the main thread (roomTextures.js).
// Message in: { quality }. Message out: { quality, tree, speckMean }, pixel buffers
// transferred. One job per worker; materials.js terminates it on receipt.
import { generateRoomTextures, textureBuffers } from "./roomTextures.js";

self.onmessage = (e) => {
  const quality = e.data?.quality || "high";
  try {
    const out = generateRoomTextures(quality);
    self.postMessage(out, textureBuffers(out.tree));
  } catch (err) {
    self.postMessage({ error: String(err?.message || err) });
  }
};
