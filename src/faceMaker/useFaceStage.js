// The one WebGL context for the page: the hero's own morph renderer (createMascotMorph) wearing the face-system
// rig ("plast"). It draws straight into the page canvas, only while the canvas is on screen and the tab is visible.
import { useEffect, useRef, useState } from "react";
import { createMascotMorph } from "../figures/faces/morph/mascotMorph";
import { createEmoteEngine, toPose } from "../figures/faces/morph/emoteEngine";
import { resolveFace } from "../figures/faces/features/core";
import { FW, FH } from "../figures/faces/morph/morphRenderer";

export { FW, FH };
const IDLE_EMOTES = ["lookAround", "think", "nod", "grin"];

export function useFaceStage(canvasRef, face, reduce) {
  const [state, setState] = useState({ ready: false, err: "" });
  const live = useRef({ face, reduce, dirty: true, key: "", seen: true, mm: null, engine: null, pointer: null, idleLeft: 4000 });
  live.current.face = face; live.current.reduce = reduce; live.current.dirty = true;

  useEffect(() => {
    const L = live.current, canvas = canvasRef.current;
    let dead = false, raf = 0, mm = null;
    L.engine = createEmoteEngine({ seed: 7 });
    const io = new IntersectionObserver(([e]) => { L.seen = e.isIntersecting; L.dirty = true; });
    io.observe(canvas);
    const onMove = (e) => { L.pointer = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("pointermove", onMove, { passive: true });
    (async () => {
      try {
        mm = await createMascotMorph(canvas, { clear: true, ink: "#17171a" });
        await mm.MR.loadPlast();
        if (dead) return;
        L.mm = mm; mm.MR.setRig("plast");
        setState({ ready: true, err: "" });
      } catch (e) { if (!dead) setState({ ready: false, err: String(e?.message || e) }); return; }
      let last = performance.now(), lastDraw = 0;
      const loop = (now) => {
        raf = requestAnimationFrame(loop);
        const dt = Math.min(50, now - last); last = now;
        if (document.hidden || !L.seen) return;
        const animated = !L.reduce || L.engine.active();
        if (!L.dirty && !animated) return;
        if (!L.dirty && now - lastDraw < 28) return; // ~30 fps while it moves
        const rig = mm.MR.rigs.plast;
        const key = JSON.stringify(L.face);
        if (rig && key !== L.key) { rig.setFace(resolveFace(L.face)); L.key = key; }
        if (!L.reduce) { L.idleLeft -= dt; if (L.idleLeft <= 0 && !L.engine.active()) { L.engine.play(IDLE_EMOTES[(Math.random() * IDLE_EMOTES.length) | 0]); L.idleLeft = 5000 + Math.random() * 4000; } }
        L.engine.setAmbient(!L.reduce);
        const out = L.engine.tick(dt, "plast"), pose = { ...out };
        if (!L.reduce && L.pointer) {
          const b = canvas.getBoundingClientRect(), nx = Math.max(-1, Math.min(1, (L.pointer.x - (b.left + b.width / 2)) / 420)), ny = Math.max(-1, Math.min(1, (L.pointer.y - (b.top + b.height * 0.4)) / 420));
          pose.eyeX += nx * 0.02; pose.eyeY += -ny * 0.012; pose.hyaw += nx * 0.04; pose.hpitch += ny * 0.03;
        }
        mm.renderAt(1, toPose(pose));
        L.dirty = false; lastDraw = now;
      };
      raf = requestAnimationFrame(loop);
    })();
    return () => {
      dead = true; cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener("pointermove", onMove);
      if (mm) { mm.MR.renderer.dispose(); mm.MR.renderer.forceContextLoss(); }
    };
  }, [canvasRef]);

  return {
    ...state,
    play: (name) => { const L = live.current; if (!L.engine) return; L.engine.play(name, { quick: L.reduce }); L.dirty = true; },
    // a still of the current frame: { bg: null | colour, size: height px, crop: bool } -> PNG blob
    async snapshot({ bg = null, crop = false, size = 1024 } = {}) {
      const L = live.current, mm = L.mm; if (!mm) return null;
      L.engine.reset(); L.engine.setAmbient(false);
      const rig = mm.MR.rigs.plast; if (rig) rig.setFace(resolveFace(L.face)); L.key = JSON.stringify(L.face);
      mm.renderAt(1, toPose(L.engine.tick(0, "plast")));
      const src = mm.MR.renderer.domElement;
      let sx = 0, sy = 0, sw = FW, sh = FH;
      if (crop) { // the opaque bounds, squared and padded
        const t = document.createElement("canvas"); t.width = FW; t.height = FH; const tc = t.getContext("2d"); tc.drawImage(src, 0, 0);
        const d = tc.getImageData(0, 0, FW, FH).data; let x0 = FW, y0 = FH, x1 = 0, y1 = 0;
        for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) if (d[(y * FW + x) * 4 + 3] > 12) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        const side = Math.max(x1 - x0, y1 - y0) * 1.08; sx = (x0 + x1) / 2 - side / 2; sy = (y0 + y1) / 2 - side / 2; sw = sh = side;
      }
      const o = document.createElement("canvas"), k = crop ? size : size; o.width = crop ? k : Math.round(k * FW / FH); o.height = k;
      const c = o.getContext("2d"); c.imageSmoothingQuality = "high";
      if (bg) { c.fillStyle = bg; c.fillRect(0, 0, o.width, o.height); }
      c.drawImage(src, sx, sy, sw, sh, 0, 0, o.width, o.height);
      L.dirty = true; L.engine.setAmbient(!L.reduce);
      return new Promise((res) => o.toBlob(res, "image/png"));
    },
  };
}
