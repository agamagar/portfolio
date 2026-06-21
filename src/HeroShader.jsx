import { useEffect, useRef, useState } from "react";
import { CLOUDS as FRAG } from "./shaders/washes";

// Live WebGL cloud-sky backdrop for the Away case-study hero (replaces the static
// airport image). Fills its parent (.article__hero-board), sits behind the flip
// board, animates only while on screen, freezes for reduced-motion, and pans with
// the pointer. If WebGL is unavailable it renders nothing and the parent's CSS
// background shows through as a fallback. The cloud FRAG lives in shaders/washes.js
// so the case-study phone mocks can run the same sky.

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const MAX_RETRIES = 6;
const isDark = () => document.documentElement.classList.contains("dark");

export default function HeroShader({ className }) {
  const canvasRef = useRef(null);
  // bumping `attempt` remounts the <canvas> (fresh element → fresh GL context).
  // We retry when a context is born lost — common right after a route change while
  // the previous page's WebGL contexts are still being torn down.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    const gl = canvas.getContext("webgl", { antialias: true, alpha: false });
    if (!gl) return; // no WebGL → parent's CSS background is the fallback

    // born lost → hide (fallback shows) and retry with a fresh canvas shortly
    if (gl.isContextLost()) {
      canvas.style.visibility = "hidden";
      if (attempt < MAX_RETRIES) {
        const t = setTimeout(() => setAttempt((a) => a + 1), 500 + attempt * 250);
        return () => clearTimeout(t);
      }
      return;
    }

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        console.warn("[HeroShader] compile:", gl.getShaderInfoLog(s));
      return s;
    };
    // all GL objects are invalidated on context loss, so building them lives in a
    // function we can re-run on `webglcontextrestored`
    let uTime, uMouse, uRes, uDark;
    const buildGL = () => {
      const program = gl.createProgram();
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(program);
      gl.useProgram(program);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const aPos = gl.getAttribLocation(program, "a_pos");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      uTime = gl.getUniformLocation(program, "u_time");
      uMouse = gl.getUniformLocation(program, "u_mouse");
      uRes = gl.getUniformLocation(program, "u_resolution");
      uDark = gl.getUniformLocation(program, "u_dark");
    };
    buildGL();

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const mouse = [0.5, 0.5]; // fixed centre: the sky no longer pans with the cursor
    let raf = 0;
    let elapsed = 0; // shader time; advances only while NOT hovered
    let lastNow = null;
    let paused = false; // true while the pointer is over the hero (freezes the drift)
    let visible = true;
    let dark = isDark(); // drives u_dark: day sky vs moonlit night
    let needsDraw = true; // forces a render for the static / reduced-motion / resized / theme-change path

    const draw = (t) => {
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMouse, mouse[0], mouse[1]);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uDark, dark ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    // returns true if the backing buffer changed size
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.floor(parent.clientWidth * dpr));
      const h = Math.max(1, Math.floor(parent.clientHeight * dpr));
      if (w === canvas.width && h === canvas.height) return false;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      return true;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    resize();

    // One rAF for the component's lifetime — never cancelled, only gated by the
    // `visible` flag, so the loop can't get permanently stopped. (The previous
    // start/stop + IntersectionObserver killed it while the hero was 0-height
    // during the lazy flip-board load, leaving the clouds frozen.)
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (!visible || gl.isContextLost()) {
        lastNow = null; // re-baseline so coming back on screen doesn't jump time
        return;
      }
      if (resize()) needsDraw = true;
      if (reduce) {
        if (needsDraw) {
          draw(0); // motion off: render once, refresh only on resize
          needsDraw = false;
        }
        return;
      }
      if (lastNow === null) lastNow = now;
      if (!paused) {
        elapsed += (now - lastNow) / 1000; // advance time only while not hovered
        lastNow = now;
        draw(elapsed);
      } else {
        lastNow = now; // keep current so resuming has no jump
        if (needsDraw) {
          draw(elapsed); // frozen frame; only redraw it on resize
          needsDraw = false;
        }
      }
    };

    // hovering the hero pauses the drift (and the cursor no longer pans the sky)
    const onEnter = () => (paused = true);
    const onLeave = () => (paused = false);
    parent.addEventListener("pointerenter", onEnter);
    parent.addEventListener("pointerleave", onLeave);

    // pause drawing (not the rAF) while the hero is off screen
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
      },
      { threshold: 0 },
    );
    io.observe(parent);

    // track the theme: u_dark follows the <html>.dark class, redraw on change so
    // the swap shows even while paused / reduced-motion
    const themeObs = new MutationObserver(() => {
      const d = isDark();
      if (d !== dark) {
        dark = d;
        needsDraw = true;
      }
    });
    themeObs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const onContextLost = (e) => {
      e.preventDefault(); // opt in to restoration
      canvas.style.visibility = "hidden"; // reveal the CSS fallback while lost
    };
    const onContextRestored = () => {
      canvas.style.visibility = "";
      buildGL();
      canvas.width = 0; // force the frame's resize() to re-apply size + viewport
      needsDraw = true;
    };
    canvas.addEventListener("webglcontextlost", onContextLost, false);
    canvas.addEventListener("webglcontextrestored", onContextRestored, false);

    raf = requestAnimationFrame(frame); // kick off the render loop

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      themeObs.disconnect();
      parent.removeEventListener("pointerenter", onEnter);
      parent.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      const lose = gl.getExtension("WEBGL_lose_context");
      if (lose) lose.loseContext();
    };
  }, [attempt]);

  return (
    <canvas key={attempt} ref={canvasRef} className={className} aria-hidden="true" />
  );
}
