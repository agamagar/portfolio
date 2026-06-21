import { useEffect, useRef, useState } from "react";
import { WASHES } from "./shaders/washes";

// Generic WebGL canvas that fills its parent box. Used for the case-study section
// shader boxes (golden | iridescent), framed like the cloud hero. Same proven
// lifecycle as HeroShader (born-lost retry, one visibility-gated rAF, per-frame
// resize, reduced-motion freeze, context loss/restore), driven by a `preset` and a
// self-detected u_dark uniform that tracks the <html>.dark theme class live.
// Renders nothing if WebGL is unavailable, so the parent's CSS background shows.

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

// `dark` (optional): force the u_dark uniform to a fixed day/night value, e.g. a
// product mock whose sky should stay morning-bright regardless of the site theme.
// Omit it to track the <html>.dark theme class live (the section-wash behaviour).
export default function ShaderCanvas({ preset, className, dark: darkProp }) {
  const canvasRef = useRef(null);
  const [attempt, setAttempt] = useState(0);
  const FRAG = WASHES[preset] || WASHES.golden;
  const forced = typeof darkProp === "boolean";

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
        console.warn("[ShaderCanvas] compile:", gl.getShaderInfoLog(s));
      return s;
    };
    // all GL objects die on context loss, so building them lives in a function
    // we can re-run on `webglcontextrestored`
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
    const mouse = [0.5, 0.5];
    let raf = 0;
    let elapsed = 0;
    let lastNow = null;
    let visible = true;
    let dark = forced ? darkProp : isDark();
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
    // `visible` flag, so the loop can't get permanently stopped.
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (!visible || gl.isContextLost()) {
        lastNow = null;
        return;
      }
      if (resize()) needsDraw = true;
      if (reduce) {
        if (needsDraw) {
          draw(elapsed); // motion off: render once, refresh only on resize / theme change
          needsDraw = false;
        }
        return;
      }
      if (lastNow === null) lastNow = now;
      elapsed += (now - lastNow) / 1000;
      lastNow = now;
      draw(elapsed);
    };

    // only draw while the box is on screen
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), {
      threshold: 0,
    });
    io.observe(parent);

    // track the theme: u_dark follows the <html>.dark class, redraw on change —
    // unless a fixed `dark` was forced (a mock whose sky shouldn't flip with the site)
    const themeObs = forced
      ? null
      : new MutationObserver(() => {
          const d = isDark();
          if (d !== dark) {
            dark = d;
            needsDraw = true;
          }
        });
    if (themeObs)
      themeObs.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

    const onContextLost = (e) => {
      e.preventDefault();
      canvas.style.visibility = "hidden";
    };
    const onContextRestored = () => {
      canvas.style.visibility = "";
      buildGL();
      canvas.width = 0; // force resize() to re-apply size + viewport
      needsDraw = true;
    };
    canvas.addEventListener("webglcontextlost", onContextLost, false);
    canvas.addEventListener("webglcontextrestored", onContextRestored, false);

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      if (themeObs) themeObs.disconnect();
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      const lose = gl.getExtension("WEBGL_lose_context");
      if (lose) lose.loseContext();
    };
  }, [attempt, FRAG, forced, darkProp]);

  return (
    <canvas key={attempt} ref={canvasRef} className={className} aria-hidden="true" />
  );
}
