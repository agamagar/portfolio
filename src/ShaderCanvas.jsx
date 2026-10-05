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
// `superSample` (optional): render the backing buffer at this multiple of the
// box's layout size, so a box that is later CSS-scaled up (e.g. the scroll-scale
// shader box growing to 150%) stays crisp instead of being upscaled blurry.
// `uniforms` (optional): extra uniforms this preset declares, as
// { u_name: number | [r,g,b] }. Presets richer than the original four-uniform
// contract (Living Sky declares sixteen) need this, because an unset uniform reads
// as 0 in GL and 0 exposure is a black frame.
//
// They are LIVE: pass a new object and the numeric ones ease to the new values
// over ~2s rather than cutting, and no GL context is rebuilt. That is what lets
// the weather sky mount on neutral defaults and drift into the viewer's real
// conditions when the fetch lands — the data arriving reads as the weather
// changing, which is the only honest way for a sky to change.
//
// `clock` (optional): drive `u_tod` from the viewer's real local time, as
// (h*3600 + m*60 + s) / 86400. That is what makes the Living Sky actually living
// rather than a still: someone opening the page at dusk gets dusk. Updated once a
// minute rather than per frame, because a 24-hour cycle moves 0.0007 of its range
// per second and nobody can see that.
//
// `clockOffsetSeconds` (optional): run that clock on a LOCATION's UTC offset
// rather than the browser's. The same idea one step further — the sky belongs to
// the place the weather was read for, not to the machine's timezone setting.
export default function ShaderCanvas({
  preset,
  className,
  dark: darkProp,
  superSample = 1,
  uniforms,
  clock = false,
  clockOffsetSeconds = null,
  tod = null,
}) {
  const canvasRef = useRef(null);
  const [attempt, setAttempt] = useState(0);
  const FRAG = WASHES[preset] || WASHES.golden;
  const forced = typeof darkProp === "boolean";
  // Live values read by the render loop. Refs, not effect dependencies: a new
  // weather reading must not tear down and rebuild the GL context.
  const targetRef = useRef(uniforms);
  targetRef.current = uniforms;
  const offsetRef = useRef(clockOffsetSeconds);
  offsetRef.current = clockOffsetSeconds;
  // a pinned time of day (the /sky preview holding every condition at dusk to
  // compare them); overrides the wall clock when set
  const todRef = useRef(tod);
  todRef.current = tod;
  // the set of uniform NAMES is what the program has to be built against, so only
  // that (not the values) belongs in the dependency list
  const uniformKey = Object.keys(uniforms || {}).sort().join(",");

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
    let uTime, uMouse, uRes, uDark, uTod;
    let extraLocs = {};
    const live = {}; // the values actually on the GPU, eased toward the props

    // `k` is how far to close the gap this frame (1 = snap). Returns true if any
    // value moved, which is what tells the reduced-motion path (which only draws
    // on demand) that it owes the screen a frame.
    const pushUniforms = (k) => {
      const target = targetRef.current;
      if (!target) return false;
      let changed = false;
      for (const [name, value] of Object.entries(target)) {
        const loc = extraLocs[name];
        if (!loc) continue;
        if (Array.isArray(value)) {
          // colours are not eased: a tint is a decision, not a condition
          gl.uniform3f(loc, value[0], value[1], value[2]);
          continue;
        }
        const from = live[name];
        if (from === value) continue;
        changed = true;
        const next = from === undefined ? value : from + (value - from) * k;
        live[name] = Math.abs(value - next) < 0.0005 ? value : next;
        gl.uniform1f(loc, live[name]);
      }
      return changed;
    };

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
      uTod = gl.getUniformLocation(program, "u_tod");

      // Preset-specific uniform locations, looked up once. The VALUES are pushed
      // by pushUniforms() below, which eases them, so a live change (new weather)
      // never needs any of this rebuilt. Re-run after a context loss with
      // everything else — and `live` MUST be cleared with it, because a restored
      // context's uniforms are all back at 0 while `live` still believes it left
      // them set, and pushUniforms skips whatever it thinks is already correct.
      for (const k of Object.keys(live)) delete live[k];
      extraLocs = {};
      for (const name of Object.keys(targetRef.current || {})) {
        const loc = gl.getUniformLocation(program, name);
        if (loc) extraLocs[name] = loc; // preset does not declare it; harmless
      }
      pushUniforms(1); // snap, so the first frame is never the black zero-state
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

    // local time as a 0..1 fraction of the day — the browser's, or the located
    // place's when an offset was given
    const timeOfDay = () => {
      if (todRef.current !== null && todRef.current !== undefined) return todRef.current;
      const off = offsetRef.current;
      const d = new Date();
      const secs =
        off === null || off === undefined
          ? d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()
          : (d.getTime() / 1000 + off) % 86400;
      return ((secs % 86400) + 86400) % 86400 / 86400;
    };
    let tod = timeOfDay();

    const draw = (t) => {
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMouse, mouse[0], mouse[1]);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uDark, dark ? 1 : 0);
      if (clock && uTod) gl.uniform1f(uTod, tod);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    // Re-read the clock once a second inside the loop (rather than on an interval)
    // so a late-arriving location offset takes effect immediately instead of up to
    // a minute later. One Date per second is nothing; a 24-hour cycle moving 0.0007
    // of its range per second is why it is not per frame.
    let lastTodAt = -Infinity;

    // returns true if the backing buffer changed size
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2) * superSample;
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
      // a pinned tod is read every frame (a preview toggle must not wait up to a
      // second to take), the wall clock once a second
      if (clock && (todRef.current !== null || now - lastTodAt > 1000)) {
        lastTodAt = now;
        const next = timeOfDay();
        if (next !== tod) {
          tod = next;
          needsDraw = true;
        }
      }
      if (lastNow === null) lastNow = now;
      const dt = Math.min((now - lastNow) / 1000, 0.1); // a backgrounded tab must not jump
      lastNow = now;
      if (reduce) {
        // motion off: no easing either, and no redraw unless something changed
        if (pushUniforms(1)) needsDraw = true;
        if (needsDraw) {
          draw(elapsed);
          needsDraw = false;
        }
        return;
      }
      elapsed += dt;
      // exponential ease, ~2s to settle — slow enough that a weather change reads
      // as weather rather than as a state update
      pushUniforms(1 - Math.exp(-dt / 0.55));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, FRAG, forced, darkProp, superSample, uniformKey, clock]);

  return (
    <canvas key={attempt} ref={canvasRef} className={className} aria-hidden="true" />
  );
}
