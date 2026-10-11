// Mount a board into any element. Framework-free: React (Board.jsx) is a thin wrapper around this.

import { buildScene } from "./scene.js";
import { sceneToSVG } from "./svg.js";
import { createPlayer } from "./player.js";

let uid = 0;

const prefersReducedMotion = () =>
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * mountBoard(host, spec, opts) -> controller
 *   opts.animate   true | false | "inview"   write the board on (default true). Reduced motion shows the finished board.
 *   opts.speed     playback speed multiplier
 *   opts.onDone    called when the last mark lands
 * controller: { scene, svg, player, play, pause, replay, finish, seek, setSpeed, update, exportSVG, toPNG, destroy }
 */
export function mountBoard(host, spec, opts = {}) {
  const id = `wb${++uid}_`;
  let scene = buildScene(spec);
  let player = null;
  let io = null;
  let animate = opts.animate ?? true;
  if (prefersReducedMotion() && !opts.forceMotion) animate = false;

  function paint(animated) {
    player?.destroy();
    host.innerHTML = sceneToSVG(scene, { animated, id });
    const svg = host.querySelector("svg");
    ctl.svg = svg;
    player = animated ? createPlayer(svg, scene, { speed: opts.speed ?? 1, onDone: opts.onDone, onTime: opts.onTime }) : null;
    ctl.player = player;
  }

  const ctl = {
    scene,
    svg: null,
    player: null,
    get duration() { return scene.duration; },
    play() {
      if (!player) paint(true);
      ctl.player.play();
    },
    pause() { player?.pause(); },
    replay() {
      if (!player) paint(true);
      ctl.player.replay();
    },
    finish() {
      if (player) player.finish();
    },
    seek(t) {
      if (!player) paint(true);
      ctl.player.seek(t);
    },
    setSpeed(v) { player?.setSpeed(v); },
    /** Rebuild from a new spec (keeps animation mode). */
    update(next, { replay = true } = {}) {
      scene = buildScene(next);
      ctl.scene = scene;
      paint(animate || !!player);
      if (player && replay) player.play();
    },
    exportSVG() { return sceneToSVG(scene, { animated: false, id: "x" }); },
    async toPNG(scale = 2) {
      const svgText = await inlineImages(ctl.exportSVG());
      const blobUrl = URL.createObjectURL(new Blob([svgText], { type: "image/svg+xml" }));
      const img = new Image();
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = blobUrl; });
      const cv = document.createElement("canvas");
      cv.width = scene.w * scale; cv.height = scene.h * scale;
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(blobUrl);
      return new Promise((res) => cv.toBlob(res, "image/png"));
    },
    destroy() {
      player?.destroy();
      io?.disconnect();
      host.innerHTML = "";
    },
  };

  if (animate === "inview" && typeof IntersectionObserver === "function") {
    paint(true);
    player.reset();
    io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        player.play();
      }
    }, { threshold: 0.35 });
    io.observe(host);
  } else if (animate) {
    paint(true);
    player.play();
  } else {
    paint(false);
  }
  return ctl;
}

/** Inline <image href> so an exported SVG is self-contained (needed to rasterise it). */
async function inlineImages(svgText) {
  const hrefs = [...svgText.matchAll(/<image href="([^"]+)"/g)].map((m) => m[1]).filter((h) => !h.startsWith("data:"));
  let out = svgText;
  for (const href of new Set(hrefs)) {
    try {
      const blob = await (await fetch(href)).blob();
      const url = await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(blob); });
      out = out.split(`href="${href}"`).join(`href="${url}"`);
    } catch { /* leave as is */ }
  }
  return out;
}
