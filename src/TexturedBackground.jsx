import { useEffect, useRef, useState } from "react";

// A fixed, full-screen WebGL layer that sits behind all content (z-index:-1) and
// gives the page background a tangible, tactile surface:
//   • at rest  — a fine static grain (very subtle; theme-aware specks)
//   • on toggle — a textured wavefront ripples out from the click point, so the
//                 background reads as a physical material being swept by the reveal.
// Raw WebGL (no dependency). Renders on demand: one static frame at rest, ~1s of
// animation during a ripple — no continuous GPU work.

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2  u_res;
uniform float u_isDark;
uniform float u_base;    // base grain strength
uniform vec2  u_click;   // ripple origin, device px (gl_FragCoord space)
uniform float u_prog;    // ripple progress 0..1, or -1 when idle

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
  return v;
}

void main() {
  vec2 fc = gl_FragCoord.xy;

  // base tactile grain (fine, per-pixel)
  float a = u_base * hash(fc);

  // textured wavefront ripple
  if (u_prog >= 0.0) {
    float r     = length(fc - u_click);
    float front = u_prog * length(u_res) * 1.05;
    float ring  = smoothstep(220.0, 0.0, abs(r - front)) * (1.0 - u_prog * 0.55);
    float turb  = fbm(fc / 26.0 - vec2(u_prog * 6.0));
    a += ring * (0.05 + turb * 0.09);
  }

  vec3 c = u_isDark > 0.5 ? vec3(1.0) : vec3(0.0);
  gl_FragColor = vec4(c, clamp(a, 0.0, 1.0));
}
`;

const BASE_GRAIN = 0.05; // rest-state grain strength — bump for more texture, 0 to disable
const RIPPLE_MS = 1000;
const MAX_RETRIES = 3;

export default function TexturedBackground({ theme }) {
  const canvasRef = useRef(null);
  const themeRef = useRef(theme);
  const drawStaticRef = useRef(null);
  // a fresh <canvas> per attempt: the cleanup below loses the context, and StrictMode's
  // dev remount then got that same lost context back from the same element. Safari 26.2
  // throws on the null shader a lost context returns, which unmounted the whole app
  // (the blank Safari page, 2026-09-27); ShaderCanvas and HeroShader do the same
  const [attempt, setAttempt] = useState(0);

  // keep the latest theme available to the imperative render loop
  useEffect(() => {
    themeRef.current = theme;
    drawStaticRef.current?.();
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
    });
    if (!gl) return; // no WebGL → silently skip, page is unaffected
    // born lost → hide and retry on a fresh canvas shortly
    if (gl.isContextLost()) {
      canvas.style.visibility = "hidden";
      if (attempt < MAX_RETRIES) {
        const t = setTimeout(() => setAttempt((a) => a + 1), 300 + attempt * 250);
        return () => clearTimeout(t);
      }
      return;
    }

    const compile = (type, src) => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const program = gl.createProgram();
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!program || !vs || !fs) return; // lost mid-setup: the grain is decoration, skip it
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    // single full-screen triangle
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const U = {
      res: gl.getUniformLocation(program, "u_res"),
      isDark: gl.getUniformLocation(program, "u_isDark"),
      base: gl.getUniformLocation(program, "u_base"),
      click: gl.getUniformLocation(program, "u_click"),
      prog: gl.getUniformLocation(program, "u_prog"),
    };

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;

    const draw = (prog) => {
      gl.uniform2f(U.res, canvas.width, canvas.height);
      gl.uniform1f(U.isDark, themeRef.current === "dark" ? 1.0 : 0.0);
      gl.uniform1f(U.base, BASE_GRAIN);
      gl.uniform1f(U.prog, prog);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const drawStatic = () => draw(-1.0);
    drawStaticRef.current = drawStatic;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      if (w === canvas.width && h === canvas.height) return;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      drawStatic();
    };
    resize();
    window.addEventListener("resize", resize);

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const onRipple = (e) => {
      if (reduce) return;
      const x = e.detail?.x ?? window.innerWidth - 56;
      const y = e.detail?.y ?? 44;
      const cx = x * dpr;
      const cy = (window.innerHeight - y) * dpr; // flip to gl_FragCoord (bottom-left origin)
      gl.uniform2f(U.click, cx, cy);
      const t0 = performance.now();
      cancelAnimationFrame(raf);
      const tick = (now) => {
        const t = Math.min(1, (now - t0) / RIPPLE_MS);
        const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
        draw(eased);
        if (t < 1) raf = requestAnimationFrame(tick);
        else drawStatic();
      };
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("theme-ripple", onRipple);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("theme-ripple", onRipple);
      drawStaticRef.current = null;
      const lose = gl.getExtension("WEBGL_lose_context");
      if (lose) lose.loseContext();
    };
  }, [attempt]);

  return <canvas key={attempt} ref={canvasRef} className="tex-bg" aria-hidden="true" />;
}
