// The ONE place that says how each skin's rig is built (files, modes): the hero's renderer (morphRenderer.loadSkin), the face gate
// and the audit tools all call rigConfig(id), so what is certified is what ships.
import { SKINS, skinById } from "../faceSkins";
import { resolveFace } from "../features/core";

// W, H: the render size; face: a resolved face for the soft-clay rig (default: neutral)
export function rigConfig(id, W, H, face = null) {
  if (id === "clay") return { W, H };
  if (id === "noir") return { W, H, src: "/faces/face-noir.glb", fitSrc: "/faces/fit-noir.json", idSrc: null, rawSrc: "/faces/skin-raw-noir.png", marginSrc: "/faces/margins-noir.png", cleanSrc: "/faces/skin-clean-noir.png", skinId: "noir", hat: true };
  if (id === "plast") return { W, H, idSrc: null, rawSrc: null, marginSrc: null, cleanSrc: null, skinId: "plast", hat: true, procedural: true, face: face || resolveFace({}) };
  const sk = skinById(id), f = sk.rig;
  if (f) return { W, H, src: f.src, fitSrc: f.fit, idSrc: f.idmap || null, rawSrc: f.raw || null, marginSrc: f.margins || null, cleanSrc: `/faces/skin-clean-${id}.png`, depthSrc: f.depth || null, skinId: id };
  // a drawn skin (print): the base head with its own hair and ears, the skin's shading mode and palette; no fitted texture
  return { W, H, idSrc: null, rawSrc: null, marginSrc: null, cleanSrc: null, skinId: id, mode: sk.mode };
}
export const RIG_SKINS = ["clay", "noir", ...SKINS.filter((s) => s.id !== "clay" && s.id !== "noir" && (s.rig || s.mode === "print")).map((s) => s.id), "plast"];
