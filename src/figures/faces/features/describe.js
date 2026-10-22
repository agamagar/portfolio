// For the photo -> face step (a vision model reads a photo and fills a face config) and for any tool that edits one.
//   faceSchema()    every feature, param, type, range, option and default: the vocabulary a face can be described in
//   sanitize(cfg)   a config from outside (a model's JSON, a saved file) clamped to that vocabulary: unknown blocks and keys dropped,
//                   numbers clamped, enums and colours validated, anything invalid left to the module's default
//   PHOTO_GUIDE     how to read each feature off a photograph so the person's likeness comes through (a prompt fragment)
import { MODULES, defaults } from "./core";

export function faceSchema() {
  return Object.fromEntries(MODULES.map((m) => [m.id, { label: m.label, params: Object.fromEntries(Object.entries(m.params).map(([k, p]) => [k, {
    type: p.type, label: p.label, default: p.default ?? null,
    ...(p.type === "number" ? { min: p.min, max: p.max } : {}), ...(p.type === "select" ? { options: p.options.map(([v]) => v) } : {}),
    ...(p.showWhen ? { showWhen: p.showWhen } : {}), ...(p.fromStyle ? { fromStyle: true } : {}),
  }])) }]));
}

export function sanitize(cfg = {}) {
  const out = {};
  for (const m of MODULES) {
    const src = cfg?.[m.id]; if (!src || typeof src !== "object") continue;
    const block = {};
    for (const [k, p] of Object.entries(m.params)) {
      const v = src[k]; if (v === undefined || v === null) continue;
      if (p.type === "number" && Number.isFinite(+v)) block[k] = Math.min(p.max, Math.max(p.min, +v));
      else if (p.type === "select" && p.options.some(([o]) => String(o) === String(v))) block[k] = String(v);
      else if (p.type === "bool") block[k] = !!v;
      else if (p.type === "color" && /^#[0-9a-fA-F]{6}$/.test(v)) block[k] = v.toLowerCase();
    }
    if (Object.keys(block).length) out[m.id] = block;
  }
  return out;
}

export const PHOTO_GUIDE = `Describe the person as a face config (JSON, blocks: material, skin, hair, eyes, brows, nose, mouth, cheeks, headwear, facialHair, accessories). Read from the photo, not from a type:
- skin.tone: 0 very light .. 1 very deep, from the skin on the cheek in even light (not the shadow, not the highlight); skin.undertone -1 cool/rose .. 1 warm/olive.
- hair.style: the nearest of the list (bald, boy-cut, crop, gelled, balding, bun, braid, curly, mohawk, bob, shoulder-messy, long-straight); hair.color is the colour in light, hair.greying 0..1 how much is grey or white; length/fringe/messiness/volume only when the style default is clearly off.
- headwear.kind: turban, taqiyah (prayer cap), hijab, dupatta, or none; its colour is the cloth's. A covered head means hair is hidden: leave hair.style alone.
- facialHair.kind: none, stubble, moustache, goatee, full; greying for grey beards; curl for a handlebar moustache.
- eyes.openness -1 narrowed .. 1 wide, smileSquint 0..1 when the eyes crinkle with a smile; eyes.size and spacing -1..1 relative to an average face. brows.height, angle (-1 worried .. 1 stern), arch.
- nose.width, tip, length -1..1 relative to average. mouth.width, smile (-1 frown .. 1 broad smile: the RESTING expression), parted for open lips.
- cheeks.fullness, jaw (narrow -1 .. wide 1), chin (pointed -1 .. round 1).
- accessories: glasses (round or square, with colour), bindi, tilak, earrings (hoops or studs), nose pin (side), metal colour.
Only set what the photo shows; the rest stays at the neutral default. Keep the person recognisable: exaggerate the two or three features that make this face THIS face (jaw, nose, brows, hair) over being generically pleasant.`;
