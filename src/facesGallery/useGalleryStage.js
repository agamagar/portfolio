// The gallery's one WebGL context: the hero's own morph renderer (createMascotMorph) on an off-screen canvas.
// Tiles are 2D canvases. A tile is drawn ONCE when it first scrolls near the screen (a queue, one at a time) and that
// frame stays as its cached thumbnail. Only one target is ever live (the hovered tile, or the open viewer); when it
// stops, its resting frame is drawn again. Nothing draws while the tab is hidden.
import { useEffect, useRef, useState } from "react";
import { createMascotMorph } from "../figures/faces/morph/mascotMorph";
import { createEmoteEngine, toPose } from "../figures/faces/morph/emoteEngine";
import { resolveFace } from "../figures/faces/features/core";
import { FW, FH } from "../figures/faces/morph/morphRenderer";

export { FW, FH };
const HOVER_EMOTES = ["blink", "grin", "wink", "lookAround", "think", "nod"];

export function useGalleryStage(reduce) {
  const [state, setState] = useState({ ready: false, err: "" });
  const S = useRef({ mm: null, queue: [], busy: false, live: null, reduce });
  S.current.reduce = reduce;

  useEffect(() => {
    const s = S.current;
    let dead = false, raf = 0, mm = null;
    (async () => {
      try {
        mm = await createMascotMorph(document.createElement("canvas"), { clear: true, ink: "#17171a" });
        await mm.MR.loadNoir(); await mm.MR.loadPlast(); // the same warm-up the face lab does (the face-system rig leans on the noir one)
        if (dead) return;
        s.mm = mm; setState({ ready: true, err: "" });
      } catch (e) { if (!dead) setState({ ready: false, err: String(e?.message || e) }); return; }
      const load = (id) => (id === "plast" ? mm.MR.loadPlast() : mm.MR.loadSkin(id)); // the face-system rig has its own loader (parts, hair)
      const draw = (entry, canvas, engine, dt) => {
        const MR = mm.MR, rig = MR.rigs[entry.skin];
        if (!rig) { load(entry.skin).catch(() => {}); return false; }
        MR.setRig(entry.skin);
        if (entry.skin === "plast" && entry.face) { const k = JSON.stringify(entry.face); if (rig.faceKey !== k) { rig.setFace(resolveFace(entry.face)); rig.faceKey = k; } }
        mm.renderAt(1, toPose(engine.tick(dt, entry.skin)));
        const c = canvas.getContext("2d"); c.clearRect(0, 0, canvas.width, canvas.height);
        c.drawImage(MR.renderer.domElement, 0, 0, canvas.width, canvas.height);
        return true;
      };
      let last = performance.now(), lastLive = 0, idle = 3000;
      const loop = (now) => {
        raf = requestAnimationFrame(loop);
        const dt = Math.min(50, now - last); last = now;
        if (document.hidden) return;
        const L = s.live;
        if (L) {
          if (now - lastLive < 28) return;
          lastLive = now;
          if (!s.reduce && !L.engine.active()) { idle -= dt; if (idle <= 0) { L.engine.play(HOVER_EMOTES[(Math.random() * HOVER_EMOTES.length) | 0], { quick: true }); idle = 2500; } }
          draw(L.entry, L.canvas, L.engine, dt);
        } else if (!s.busy && s.queue.length) {
          const job = s.queue.shift();
          if (!job.canvas.isConnected) return;
          s.busy = true;
          (async () => {
            try {
              if (!mm.MR.rigs[job.entry.skin]) await load(job.entry.skin);
              const eng = createEmoteEngine({ seed: 7 });
              draw(job.entry, job.canvas, eng, 0);
              if (job.entry.skin === "plast") { // a few real frames so hair and warps settle before the frame is kept
                for (let i = 0; i < 5; i++) { await new Promise((r) => setTimeout(r, 50)); draw(job.entry, job.canvas, eng, 50); }
              }
              job.done?.();
            } catch { job.fail?.(); } finally { s.busy = false; }
          })();
        }
      };
      raf = requestAnimationFrame(loop);
    })();
    return () => { dead = true; cancelAnimationFrame(raf); if (mm) { mm.MR.renderer.dispose(); mm.MR.renderer.forceContextLoss(); } s.mm = null; };
  }, []);

  return {
    ...state,
    // draw this entry once into the canvas (queued); front = jump the queue
    still(entry, canvas, { front = false, done, fail } = {}) {
      const job = { entry, canvas, done, fail }, q = S.current.queue;
      if (front) q.unshift(job); else q.push(job);
    },
    live(entry, canvas) { S.current.live = { entry, canvas, engine: createEmoteEngine({ seed: 7 }) }; S.current.live.engine.setAmbient(!S.current.reduce); },
    stop(entry, canvas) { const s = S.current; if (s.live && s.live.canvas === canvas) { s.live = null; this.still(entry, canvas, { front: true }); } },
    play(name) { const L = S.current.live; if (L) L.engine.play(name, { quick: S.current.reduce }); },
    clear(canvas) { const q = S.current.queue; S.current.queue = q.filter((j) => j.canvas !== canvas); },
  };
}
