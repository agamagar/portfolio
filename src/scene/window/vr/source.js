// Video sources for the viewer, one interface: { texture, el, play(), pause(), seek(t),
// get time/duration/paused, muted, ready, dispose() }. A real <video> through a
// VideoTexture, or a generated test pattern drawn on a canvas (CanvasTexture) that keeps
// the same clock, so the controls behave the same with no file at all.
import * as THREE from "three";

// ---- generated test pattern ---------------------------------------------------------
function drawEye(g, x0, w, h, t, { span, tint, eye }) {
  // an equirectangular panel `span` degrees wide, 180 tall; centre column = straight ahead
  const grad = g.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#1b2a55");
  grad.addColorStop(0.5, "#2d3d5e");
  grad.addColorStop(0.5001, "#2a2622");
  grad.addColorStop(1, "#0f0d0b");
  g.save();
  g.beginPath();
  g.rect(x0, 0, w, h);
  g.clip();
  g.fillStyle = grad;
  g.fillRect(x0, 0, w, h);
  if (tint) {
    g.fillStyle = tint;
    g.fillRect(x0, 0, w, h);
  }
  const xOf = (lon) => x0 + ((lon + span / 2) / span) * w; // lon -span/2..span/2
  const yOf = (lat) => ((90 - lat) / 180) * h;
  g.lineWidth = Math.max(1, h / 512);
  g.font = `${Math.round(h / 28)}px ui-monospace, Menlo, monospace`;
  g.textAlign = "center";
  for (let lon = -span / 2; lon <= span / 2 + 0.1; lon += 15) {
    const major = Math.round(lon) % 45 === 0;
    g.strokeStyle = major ? "rgba(255,255,255,.55)" : "rgba(255,255,255,.18)";
    g.beginPath();
    g.moveTo(xOf(lon), 0);
    g.lineTo(xOf(lon), h);
    g.stroke();
    if (major) {
      g.fillStyle = "rgba(255,255,255,.8)";
      g.fillText(`${Math.round(lon)}°`, xOf(lon), yOf(8));
    }
  }
  for (let lat = -75; lat <= 75; lat += 15) {
    g.strokeStyle = lat === 0 ? "rgba(255,200,120,.9)" : "rgba(255,255,255,.18)";
    g.beginPath();
    g.moveTo(x0, yOf(lat));
    g.lineTo(x0 + w, yOf(lat));
    g.stroke();
    if (lat % 30 === 0 && lat !== 0) {
      g.fillStyle = "rgba(255,255,255,.7)";
      g.fillText(`${lat}°`, xOf(0) + w * 0.02, yOf(lat) - 4);
    }
  }
  // landmarks
  g.fillStyle = "#fff";
  g.font = `600 ${Math.round(h / 12)}px ui-sans-serif, system-ui, sans-serif`;
  g.fillText("FRONT", xOf(0), yOf(18));
  g.font = `${Math.round(h / 22)}px ui-sans-serif, system-ui, sans-serif`;
  g.fillStyle = "rgba(255,255,255,.75)";
  g.fillText(eye ? `${eye} eye · test pattern` : "test pattern · drag to look around", xOf(0), yOf(-28));
  if (span > 200) {
    g.fillText("RIGHT", xOf(90), yOf(18));
    g.fillText("LEFT", xOf(-90), yOf(18));
    g.fillText("BACK", xOf(-178), yOf(18));
    g.fillText("BACK", xOf(178), yOf(18));
  }
  // a marker orbiting the horizon, so playback and scrubbing are visible
  const a = ((t / 12) % 1) * span - span / 2;
  g.fillStyle = "#ffb454";
  g.beginPath();
  g.arc(xOf(a), yOf(0), h / 40, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

function generated(kind, duration) {
  const sbs = kind === "grid180sbs";
  const W = sbs ? 2048 : 2048, H = sbs ? 1024 : 1024;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const g = cv.getContext("2d");
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const draw = (t) => {
    if (sbs) {
      drawEye(g, 0, W / 2, H, t, { span: 180, tint: "rgba(40,90,255,.12)", eye: "left" });
      drawEye(g, W / 2, W / 2, H, t, { span: 180, tint: "rgba(255,70,70,.12)", eye: "right" });
    } else drawEye(g, 0, W, H, t, { span: 360 });
    tex.needsUpdate = true;
  };
  return makeClock({ texture: tex, duration, size: [W, H], draw, generated: true });
}

// a playback clock for the generated source (a video element has its own)
function makeClock({ texture, duration, size, draw, generated: gen }) {
  let t = 0, playing = false, raf = 0, last = 0;
  const tick = (now) => {
    raf = 0;
    if (playing) {
      t = (t + (now - last) / 1000) % duration;
      last = now;
      draw(t);
      raf = requestAnimationFrame(tick);
    }
  };
  draw(0);
  return {
    texture,
    size,
    generated: gen,
    ready: true,
    error: null,
    get time() { return t; },
    get duration() { return duration; },
    get paused() { return !playing; },
    muted: true,
    async play() { if (!playing) { playing = true; last = performance.now(); raf = requestAnimationFrame(tick); } },
    pause() { playing = false; },
    seek(v) { t = Math.max(0, Math.min(duration, v)); draw(t); },
    dispose() { playing = false; cancelAnimationFrame(raf); texture.dispose(); },
  };
}

// ---- a real video file --------------------------------------------------------------
function fromVideo(entry) {
  const v = document.createElement("video");
  v.crossOrigin = "anonymous";
  v.playsInline = true;
  v.loop = true;
  v.muted = true; // autoplay needs it; the viewer unmutes if the site sound is on
  v.preload = "metadata";
  v.setAttribute("playsinline", "");
  const tex = new THREE.VideoTexture(v);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  const s = {
    texture: tex,
    el: v,
    size: [2, 1],
    generated: false,
    ready: false,
    error: null,
    get time() { return v.currentTime || 0; },
    get duration() { return Number.isFinite(v.duration) ? v.duration : 0; },
    get paused() { return v.paused; },
    get muted() { return v.muted; },
    set muted(m) { v.muted = !!m; },
    play: () => v.play(),
    pause: () => v.pause(),
    seek(t) { v.currentTime = t; },
    dispose() {
      v.pause();
      v.removeAttribute("src");
      v.load(); // releases the connection and the decoder
      tex.dispose();
    },
  };
  v.addEventListener("loadedmetadata", () => { s.ready = true; s.size = [v.videoWidth || 2, v.videoHeight || 1]; s.onready?.(); });
  v.addEventListener("error", () => { s.error = "That video could not be loaded."; s.onerror?.(); });
  // a missing file in dev is served as index.html, not a 404: check the type first
  fetch(entry.src, { method: "HEAD" })
    .then((r) => {
      const type = r.headers.get("content-type") || "";
      if (!r.ok || /text\/html/.test(type)) throw new Error("missing");
      v.src = entry.src;
    })
    .catch(() => {
      s.error = `No file at ${entry.src}. Put the video in public/vr/ (see src/scene/window/vrVideos.js).`;
      s.onerror?.();
    });
  return s;
}

export function createSource(entry) {
  return entry.generated ? generated(entry.generated, entry.duration || 24) : fromVideo(entry);
}
