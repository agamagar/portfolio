// The stretchy "Hello" (Agam, 2026-10-11): "make the exclamation mark on the
// Hello draggable to the left and right ... drag to increase the number of O's
// in the hello, and the moment you stop, use a stack flip animation on each
// character individually to rewrite the hello in a language with that exact
// number of characters."
//
// How it is drawn. "Hello!" is outlines (GreetingMark.jsx), and at rest it stays
// outlines: nothing here is visible until the word changes, so the lockup is
// pixel for pixel what Figma drew. This layer lives INSIDE the `.gm__hello`
// group, in the same SVG units and under the same transform, and reuses the
// exact outline paths for H, e, l, o and !, so the stretched "Hellooo" is the
// drawn word with more of the drawn O. Only a real greeting switches to live
// type: Stack Sans Headline 700, thickened by a 1.4-unit stroke to the outline's
// stem weight (8.1 vs 8.4 units) and sized so its cap height lands on the
// outline's (34.2 units).
//
// The flip is a two-half split-flap per character: the top half of the old
// glyph folds down onto the hinge, then the bottom half of the next one folds
// out of it. Scales only (a fold seen face on is cos(angle)), clipped at the
// hinge, so it is transforms and two shared clip rects; nothing reflows.
//
// The page never moves: the word grows to the right inside an SVG that already
// overflows visibly, the mark's own box is unchanged, and "I'm Agam" is a
// sibling group nobody here touches.
import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { MAX_LEN, MIN_LEN, captionFor, graphemes, pickGreeting } from "./helloFlipGreetings";
import { playSound } from "../ui/sound";
import "./helloFlip.css";

/* ---- the drawn outlines (GreetingMark.jsx, Figma 13:2060) ---------------- */
// d, ink left, ink right. Same strings as the mark, so a cell at its drawn x is
// the drawn glyph.
const P = {
  H: ["M83.357 36.2237V2.06989H91.7402V36.2237H83.357ZM62.9164 36.2237V2.06989H71.2996V36.2237H62.9164ZM69.178 22.5622V15.5244H87.7555V22.5622H69.178Z", 62.9164, 91.7402],
  e: ["M108.647 36.9481C106.06 36.9481 103.886 36.5859 102.127 35.8614C100.402 35.1025 99.0049 34.0847 97.9354 32.8083C96.8659 31.4973 96.0897 30.0139 95.6067 28.358C95.1582 26.702 94.934 24.9598 94.934 23.1314C94.934 21.165 95.1755 19.2848 95.6585 17.4908C96.176 15.6969 96.9522 14.11 97.9871 12.73C99.0566 11.3156 100.419 10.2116 102.075 9.41813C103.766 8.59016 105.784 8.17618 108.13 8.17618C110.476 8.17618 112.477 8.59016 114.133 9.41813C115.823 10.2116 117.168 11.3328 118.169 12.7818C119.169 14.2307 119.808 15.9039 120.084 17.8013C120.394 19.6988 120.36 21.7514 119.98 23.9594L100.161 24.2698V19.716L113.563 19.4573L112.477 22.0964C112.684 20.5095 112.649 19.1813 112.373 18.1118C112.132 17.0079 111.666 16.1799 110.976 15.6279C110.286 15.0414 109.337 14.7482 108.13 14.7482C106.853 14.7482 105.836 15.0759 105.077 15.7314C104.318 16.3869 103.783 17.3183 103.472 18.5258C103.162 19.6988 103.007 21.096 103.007 22.7174C103.007 25.5118 103.472 27.5472 104.404 28.8237C105.335 30.1001 106.767 30.7384 108.699 30.7384C109.527 30.7384 110.217 30.6349 110.769 30.4279C111.321 30.2209 111.769 29.9276 112.114 29.5482C112.459 29.1342 112.701 28.6512 112.839 28.0992C112.977 27.5127 113.029 26.8573 112.994 26.1328L120.653 26.5468C120.756 27.6852 120.636 28.8582 120.291 30.0656C119.98 31.2731 119.376 32.3943 118.479 33.4293C117.582 34.4642 116.323 35.3094 114.702 35.9649C113.115 36.6204 111.097 36.9481 108.647 36.9481Z", 94.934, 120.7],
  l: ["M123.554 36.2237V0H131.937V36.2237H123.554Z", 123.554, 131.937],
  o: ["M160.541 36.9481C157.919 36.9481 155.59 36.4307 153.555 35.3957C151.519 34.3262 149.933 32.7393 148.794 30.6349C147.656 28.4959 147.086 25.8223 147.086 22.6139C147.086 19.2675 147.673 16.5421 148.846 14.4377C150.053 12.2988 151.675 10.7291 153.71 9.72862C155.78 8.69366 158.109 8.17618 160.696 8.17618C163.387 8.17618 165.733 8.71091 167.734 9.78037C169.769 10.8153 171.339 12.4023 172.443 14.5412C173.581 16.6456 174.151 19.3193 174.151 22.5622C174.151 25.9085 173.547 28.6512 172.339 30.7901C171.167 32.8945 169.545 34.447 167.475 35.4474C165.44 36.4479 163.128 36.9481 160.541 36.9481ZM160.748 30.7901C161.817 30.7901 162.714 30.4969 163.439 29.9104C164.163 29.2894 164.715 28.3924 165.095 27.2195C165.474 26.0465 165.664 24.6493 165.664 23.0279C165.664 21.234 165.457 19.7333 165.043 18.5258C164.629 17.2838 164.025 16.3351 163.232 15.6797C162.473 15.0242 161.541 14.6964 160.437 14.6964C159.402 14.6964 158.523 15.0069 157.798 15.6279C157.074 16.2144 156.522 17.0941 156.142 18.2671C155.763 19.44 155.573 20.8545 155.573 22.5104C155.573 25.1323 156.022 27.1677 156.919 28.6167C157.85 30.0656 159.126 30.7901 160.748 30.7901Z", 147.086, 174.151],
  "!": ["M178.427 25.3566L176.719 2.06989H185.879L184.171 25.3566H178.427ZM181.636 36.8964C179.876 36.8964 178.548 36.5169 177.651 35.7579C176.788 34.999 176.357 33.826 176.357 32.2391C176.357 30.6176 176.788 29.4274 177.651 28.6684C178.548 27.9095 179.876 27.53 181.636 27.53C183.429 27.53 184.775 27.9095 185.672 28.6684C186.569 29.4274 187.017 30.6176 187.017 32.2391C187.017 35.3439 185.223 36.8964 181.636 36.8964Z", 176.357, 187.017],
};
const mid = (k) => (P[k][1] + P[k][2]) / 2;
const BANG_W = P["!"][2] - P["!"][1];
const BASE = 36.2237; // the drawn baseline
const HINGE = 21; // the split line, through the middle of the lowercase
const O_STEP = 29.3; // o to o: ink 27.07 + the 2.3 the o's own side bearings give
const BANG_GAP = P["!"][1] - P.o[1]; // the drawn last-o-to-! step, 29.27
const restBang = (n) => P.o[1] + (n - MIN_LEN) * O_STEP + BANG_GAP; // ! ink left for "Hel" + n-3 o's

// live type, matched to the outlines (see the header)
const FS = 46.8;
const SW = 1.4;
const FONT = `700 ${FS}px "Stack Sans Headline Variable"`;

/* ---- the shared state: tiny, so the page never re-renders on a drag ------ */
export function useHelloFlipStore() {
  const ref = useRef(null);
  if (!ref.current) {
    const ls = new Set();
    let snap = { word: "Hello", greeting: null, count: MIN_LEN, form: "hello", focus: false, max: MAX_LEN };
    ref.current = {
      get: () => snap,
      set(p) {
        snap = { ...snap, ...p };
        ls.forEach((f) => f());
      },
      sub(f) {
        ls.add(f);
        return () => ls.delete(f);
      },
      api: null, // filled by the layer: { step(d), commit(), home() }
    };
  }
  return ref.current;
}
const useSnap = (s) => useSyncExternalStore(s.sub, s.get, s.get);

/** The heading's words, kept true to what is on screen. */
export function HelloFlipSr({ store, rest }) {
  const { word } = useSnap(store);
  // (the id: the heading takes its name from this text alone, not from the face button inside it, Hello.jsx)
  return <span className="hello-hero__sr" id="hello-hero-title">{`${word}! ${rest}`}</span>;
}

/**
 * The keyboard half: a visually hidden slider (the SVG is aria-hidden and must
 * stay so) and a polite live region. Arrow keys add or remove O's, Enter flips,
 * Escape goes home. Its focus draws the ring around the "!" in the SVG.
 */
export function HelloFlipControl({ store }) {
  const s = useSnap(store);
  const [said, setSaid] = useState("");
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const g = s.greeting;
    setSaid(g ? `${g.text}, hello in ${captionFor(g)}` : s.form === "hello" && s.count === MIN_LEN ? "Hello" : "");
  }, [s.greeting, s.word]); // eslint-disable-line react-hooks/exhaustive-deps
  const text = s.greeting ? s.greeting.text : "Hell" + "o".repeat(s.count - 4);
  const onKeyDown = (e) => {
    const a = store.api;
    if (!a) return;
    const k = e.key;
    if (k === "ArrowRight" || k === "ArrowUp") a.step(1);
    else if (k === "ArrowLeft" || k === "ArrowDown") a.step(-1);
    else if (k === "End") a.step(99);
    else if (k === "Home" || k === "Escape") a.home();
    else if (k === "Enter" || k === " ") a.commit();
    else return;
    e.preventDefault();
  };
  return (
    <>
      <span
        className="hf-slider"
        role="slider"
        tabIndex={0}
        aria-label="Stretch the word by its last letter, then press Enter to see it in another language"
        aria-valuemin={MIN_LEN}
        aria-valuemax={s.max}
        aria-valuenow={s.count}
        aria-valuetext={`${text}, ${s.count} letters`}
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        onFocus={(e) => store.set({ focus: e.currentTarget.matches(":focus-visible") })}
        onBlur={() => store.set({ focus: false })}
      />
      <span className="hello-hero__sr" aria-live="polite">{said}</span>
    </>
  );
}

/* ---- layout ------------------------------------------------------------- */
const pathGlyph = (k) => ({ k: "p", ch: k });
const textGlyph = (ch) => ({ k: "t", ch });
const BLANK = { k: "t", ch: " " };

/** "Hel" + o's, at the drawn positions. */
function helloForm(n) {
  const out = [
    { g: pathGlyph("H"), cx: mid("H") },
    { g: pathGlyph("e"), cx: mid("e") },
    { g: pathGlyph("l"), cx: mid("l") },
    { g: pathGlyph("l"), cx: mid("l") + 12.128 }, // the second l is drawn 12.128 on
  ];
  for (let i = 0; i < n - 4; i++) out.push({ g: pathGlyph("o"), cx: mid("o") + i * O_STEP });
  return { cells: out, bang: restBang(n) };
}


// Ink edges of one glyph by scanning pixels: measureText's actualBoundingBox is
// only the advance box in WebKit, which would put the H's bearing in the margin.
const inkCache = new Map();
function inkEdge(ch, side) {
  const key = ch + side;
  if (inkCache.has(key)) return inkCache.get(key);
  const K = 4, W = Math.ceil(FS * 1.6 * K), H = Math.ceil(FS * 1.4 * K);
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const x = cv.getContext("2d", { willReadFrequently: true });
  x.font = FONT.replace(/[\d.]+px/, `${FS * K}px`);
  x.textBaseline = "alphabetic";
  const ox = FS * 0.3 * K;
  x.fillText(ch, ox, FS * 1.1 * K);
  const d = x.getImageData(0, 0, W, H).data;
  let lo = W, hi = -1;
  for (let col = 0; col < W; col++) for (let row = 0; row < H; row++) if (d[(row * W + col) * 4 + 3] > 100) { lo = Math.min(lo, col); hi = Math.max(hi, col + 1); break; }
  const adv = x.measureText(ch).width;
  const v = side === "left" ? (lo - ox) / K : (hi - ox) / K; // from the glyph's origin
  inkCache.set(key, v);
  void adv;
  return v;
}

let canvas = null;
/** A greeting in live type, left ink on the H's left ink, ! after the last letter. */
function textForm(chars) {
  canvas ||= document.createElement("canvas").getContext("2d");
  const c = canvas;
  c.font = FONT;
  const w = (s) => c.measureText(s).width;
  let pre = "";
  const cells = [];
  chars.forEach((ch, i) => {
    const x0 = w(pre) + i * SW;
    pre += ch;
    const x1 = w(pre) + i * SW + SW;
    cells.push({ g: textGlyph(ch), x0, x1 });
  });
  const firstInk = inkEdge(chars[0], "left");
  const lastInk = w(pre.slice(0, -chars[chars.length - 1].length)) + (chars.length - 1) * SW + inkEdge(chars[chars.length - 1], "right");
  const off = P.H[1] + SW / 2 - firstInk;
  return {
    cells: cells.map(({ g, x0, x1 }) => ({ g, cx: off + (x0 + x1) / 2 })),
    bang: off + lastInk + SW / 2 + 2.6,
  };
}

const UP = "ABCDEFGHIJKLMNOPRSTUVWZ";
const LO = "abcdeghiklmnoprstuvwyz";
const randFrom = (s) => s[Math.floor(Math.random() * s.length)];
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const clamp01 = (t) => Math.max(0, Math.min(1, t));
// a soft wall: past the limit the ! keeps moving, less and less
const rubber = (d) => 16 * (1 - Math.exp(-d / 36));

/* ---- the layer ----------------------------------------------------------- */
export function HelloFlipLayer({ store, ready, reduce }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const gRef = useRef(null);
  const [, setTick] = useState(0);
  const snap = useSnap(store);

  // everything that moves lives in this ref; React only paints it
  const st = useRef(null);
  if (!st.current) {
    const h = helloForm(MIN_LEN);
    let id = 0;
    st.current = {
      nextId: () => ++id,
      cells: h.cells.map((c) => ({ ...c, id: ++id, anim: null, pop: null, out: null })),
      bang: { x: h.bang, target: h.bang, tau: 40 },
      form: "hello", // "hello" (outlines) | "text" (a greeting)
      chars: null, // the greeting's graphemes while form is "text"
      count: MIN_LEN,
      drag: null,
      raf: 0,
      last: 0,
      max: MAX_LEN,
    };
  }

  const kick = () => {
    const s = st.current;
    if (s.raf) return;
    s.last = performance.now();
    const loop = (now) => {
      const dt = Math.min(64, now - s.last);
      s.last = now;
      const b = s.bang;
      b.x += (b.target - b.x) * (1 - Math.exp(-dt / b.tau));
      if (Math.abs(b.target - b.x) < 0.25) b.x = b.target; // a quarter unit is under half a pixel
      // drop finished animations and cells that have flown out
      s.cells = s.cells.filter((c) => !(c.out && now - c.out > 140) && !(c.gone && (!c.anim || now > c.anim.end)));
      let busy = !!s.drag || b.x !== b.target;
      for (const c of s.cells) {
        if (c.anim && now > c.anim.end) {
          if (!reduce || c.anim.sound) playSound("navigate");
          c.cx = c.anim.toCx;
          c.anim = null;
        }
        if (c.pop && now - c.pop > 180) c.pop = null;
        if (c.anim || c.pop || c.out) busy = true;
      }
      setTick((t) => t + 1);
      s.raf = busy ? requestAnimationFrame(loop) : 0;
      if (!busy) settle();
    };
    s.raf = requestAnimationFrame(loop);
  };
  useEffect(() => () => cancelAnimationFrame(st.current.raf), []);

  // when the word is "Hello" again and still, hand back to the drawn outlines
  const settle = () => {
    const s = st.current;
    const home = s.form === "hello" && s.count === MIN_LEN && !s.drag;
    setTick((t) => t + 1);
    store.set({ count: s.count, form: s.form, home });
  };

  const fontReady = useRef(null);
  useEffect(() => {
    if (!ready || typeof document === "undefined" || !document.fonts) return;
    // both subsets: "ă" pulls latin-ext, which "Bună ziua" and "Dzień dobry" need
    fontReady.current = document.fonts.load(FONT, "Hello ăńāīİðý").catch(() => {});
  }, [ready]);

  /** The word at length n: the last letter is what stretches, so a greeting
   *  grows by repeating its own last character ("Kumustaaa"), and shrinks by
   *  dropping letters before it; "Hello" grows its drawn o. */
  const layoutFor = (n) => {
    const s = st.current;
    if (s.form !== "text") return helloForm(n);
    const c = s.chars;
    const last = c[c.length - 1];
    const arr = n >= c.length ? c.concat(Array(n - c.length).fill(last)) : c.slice(0, n - 1).concat(last);
    return textForm(arr);
  };

  /** Set the cells to the word stretched to n, popping letters in and out. */
  const setCount = (n) => {
    const s = st.current;
    const now = performance.now();
    const h = layoutFor(n);
    const live = s.cells.filter((c) => !c.out);
    const next = [];
    h.cells.forEach((c, i) => {
      const was = live[i];
      if (was) {
        was.g = c.g;
        was.cx = c.cx;
        was.anim = null;
        next.push(was);
      } else next.push({ ...c, id: s.nextId(), anim: null, pop: reduce ? null : now, out: null });
    });
    live.slice(h.cells.length).forEach((c) => { if (!reduce) { c.out = now; next.push(c); } });
    s.cells = next;
    s.count = n;
    store.set({ count: n, greeting: null, home: false });
    if (n !== MIN_LEN && !reduce) playSound("navigate");
    return h;
  };

  /** Flip every character into `target` (a layout), staggered left to right. */
  const flipTo = (target, form, { quick = false } = {}) => {
    const s = st.current;
    const now = performance.now();
    const old = s.cells.filter((c) => !c.out);
    const n = Math.max(old.length, target.cells.length);
    const STEP = quick ? 70 : 110;
    const STAGGER = quick ? 18 : 42;
    const cells = [];
    let end = now;
    for (let i = 0; i < n; i++) {
      const was = old[i];
      const to = target.cells[i];
      const from = was ? was.g : BLANK;
      const toG = to ? to.g : BLANK;
      const fromCx = was ? was.cx : target.cells[i].cx;
      const toCx = to ? to.cx : fromCx;
      const seq = [from];
      if (!reduce) {
        const flips = quick ? 0 : 2 + Math.floor(Math.random() * 4);
        const pool = toG.ch === toG.ch.toUpperCase() && toG.ch !== toG.ch.toLowerCase() ? UP : LO;
        for (let k = 0; k < flips; k++) {
          let r;
          do r = randFrom(pool); while (r === seq[seq.length - 1].ch || r === toG.ch);
          seq.push(textGlyph(r));
        }
      }
      seq.push(toG);
      const t0 = now + (reduce ? 0 : i * STAGGER);
      const dur = reduce ? 220 : (seq.length - 1) * STEP;
      end = Math.max(end, t0 + dur);
      cells.push({
        id: was ? was.id : s.nextId(),
        g: toG,
        cx: fromCx,
        gone: !to,
        pop: null,
        out: null,
        anim: { seq, t0, step: STEP, dur, end: t0 + dur, fromCx, toCx, sound: i === 0 },
      });
    }
    s.cells = cells;
    s.form = form;
    s.count = target.cells.length;
    s.bang.target = target.bang;
    s.bang.tau = reduce ? 1 : Math.min(200, Math.max(60, (end - now) / 3));
    kick();
    return end;
  };

  const goGreeting = async (n) => {
    const g = pickGreeting(n);
    if (!g) return;
    await fontReady.current;
    const chars = graphemes(g.text);
    st.current.chars = chars;
    flipTo(textForm(chars), "text");
    store.set({ greeting: g, word: g.text, count: n, form: "text", home: false });
  };
  const goHome = () => {
    const s = st.current;
    s.drag = null;
    if (s.form === "hello") {
      s.bang.target = setCount(MIN_LEN).bang;
      s.bang.tau = 60;
    } else flipTo(helloForm(MIN_LEN), "hello");
    store.set({ greeting: null, word: "Hello", count: MIN_LEN, form: "hello" });
    kick();
  };
  // how many letters fit before the viewport's right edge (a phone cannot take 12)
  const fitMax = () => {
    const svg = gRef.current?.ownerSVGElement;
    if (!svg) return MAX_LEN;
    const r = svg.getBoundingClientRect();
    const u = svg.viewBox.baseVal.width / r.width;
    const avail = (document.documentElement.clientWidth - 12 - r.left) * u + 6; // +6: the group's translate(-6)
    const m = MIN_LEN + Math.floor((avail - BANG_W - restBang(MIN_LEN)) / O_STEP);
    return Math.max(MIN_LEN + 1, Math.min(MAX_LEN, m));
  };

  // keyboard
  store.api = {
    step(d) {
      const s = st.current;
      s.max = fitMax();
      const n = Math.max(MIN_LEN, Math.min(s.max, s.count + d));
      s.bang.target = setCount(n).bang;
      s.bang.tau = reduce ? 1 : 60;
      store.set({ max: s.max });
      kick();
    },
    commit() {
      const s = st.current;
      if (s.form === "text") goGreeting(s.count);
      else if (s.count === MIN_LEN) goHome();
      else goGreeting(s.count);
    },
    home: goHome,
  };

  // pointer
  const [hint, setHint] = useState(false);
  const onDown = (e) => {
    if (!ready || e.button > 0) return;
    const s = st.current;
    const svg = gRef.current.ownerSVGElement;
    const r = svg.getBoundingClientRect();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    e.stopPropagation();
    s.max = fitMax();
    store.set({ max: s.max });
    s.drag = { x0: e.clientX, u: svg.viewBox.baseVal.width / r.width, n0: s.count, moved: false, id: e.pointerId };
    document.documentElement.classList.add("hf-grabbing");
  };
  const onMove = (e) => {
    const s = st.current;
    const d = s.drag;
    if (!d || e.pointerId !== d.id) return;
    const dx = (e.clientX - d.x0) * d.u;
    if (!d.moved) {
      if (Math.abs(e.clientX - d.x0) < 4) return;
      d.moved = true;
    }
    // one letter per O_STEP of travel from where the word was picked up
    const lo = (MIN_LEN - d.n0) * O_STEP;
    const hi = (s.max - d.n0) * O_STEP;
    let x = dx;
    if (x < lo) x = lo - rubber(lo - x);
    if (x > hi) x = hi + rubber(x - hi);
    const n = Math.max(MIN_LEN, Math.min(s.max, d.n0 + Math.round(x / O_STEP)));
    const lay = n !== s.count ? setCount(n) : layoutFor(n);
    // the handle follows the finger between letters, like the "!" always did
    s.bang.target = lay.bang + Math.max(-O_STEP / 2, Math.min(O_STEP / 2, x - (n - d.n0) * O_STEP));
    s.bang.tau = reduce ? 1 : 28;
    kick();
  };
  const onUp = (e) => {
    const s = st.current;
    const d = s.drag;
    if (!d || e.pointerId !== d.id) return;
    s.drag = null;
    document.documentElement.classList.remove("hf-grabbing");
    if (!d.moved) {
      // a click: another language of the same length, or at "Hello" a nudge
      if (s.form === "text") goGreeting(s.count);
      else {
        setHint(false);
        requestAnimationFrame(() => setHint(true));
      }
      return;
    }
    s.bang.target = layoutFor(s.count).bang;
    s.bang.tau = reduce ? 1 : 90;
    if (s.count === MIN_LEN) goHome();
    else goGreeting(s.count);
    kick();
  };

  // one quiet nudge, once a session, a moment after the hero settles
  useEffect(() => {
    if (!ready || reduce) return;
    let seen = false;
    try { seen = sessionStorage.getItem("hf-hint") === "1"; sessionStorage.setItem("hf-hint", "1"); } catch { /* private mode */ }
    if (seen) return;
    const t = setTimeout(() => setHint(true), 2600);
    return () => clearTimeout(t);
  }, [ready, reduce]);

  // the drawn word hides while this layer draws it; the drawn "!" always hides
  // (this layer's ! is the same path, and it is the one that can move)
  const s = st.current;
  const live = !(s.form === "hello" && s.count === MIN_LEN && !s.drag && !s.cells.some((c) => c.anim || c.pop || c.out) && s.bang.x === s.bang.target);
  useLayoutEffect(() => {
    const svg = gRef.current?.ownerSVGElement;
    if (svg) svg.dataset.hf = live ? "live" : "rest";
  });
  useLayoutEffect(() => () => { const svg = gRef.current?.ownerSVGElement; if (svg) delete svg.dataset.hf; }, []);

  const now = performance.now();
  const layers = [];
  for (const c of s.cells) {
    let cx = c.cx;
    let sc = 1;
    let op = 1;
    if (c.pop) { const t = clamp01((now - c.pop) / 180); sc = 0.55 + 0.45 * (1 - (1 - t) ** 3); op = t; }
    if (c.out) { const t = clamp01((now - c.out) / 140); sc = 1 - 0.45 * t; op = 1 - t; }
    const a = c.anim;
    if (!a) {
      layers.push({ key: c.id, g: c.g, cx, sc, op });
      continue;
    }
    const el = now - a.t0;
    cx = a.fromCx + (a.toCx - a.fromCx) * easeInOut(clamp01(el / a.dur));
    if (reduce) {
      const t = clamp01(el / a.dur);
      layers.push({ key: c.id + "a", g: a.seq[0], cx: a.fromCx, op: 1 - t });
      layers.push({ key: c.id + "b", g: a.seq[a.seq.length - 1], cx: a.toCx, op: t });
      continue;
    }
    if (el < 0) {
      layers.push({ key: c.id, g: a.seq[0], cx });
      continue;
    }
    const k = Math.min(a.seq.length - 2, Math.floor(el / a.step));
    const p = clamp01((el - k * a.step) / a.step);
    const cur = a.seq[k];
    const nxt = a.seq[k + 1];
    if (p < 0.5) {
      // the top flap falls: cos of its angle, gravity on the way down
      const q = (p * 2) ** 2;
      layers.push({ key: c.id + "t", g: cur, cx, clip: "t", sy: Math.cos((q * Math.PI) / 2), op: 1 - 0.5 * q });
      layers.push({ key: c.id + "b", g: cur, cx, clip: "b" });
    } else {
      const q = 1 - (1 - (p - 0.5) * 2) ** 2;
      layers.push({ key: c.id + "t", g: nxt, cx, clip: "t" });
      layers.push({ key: c.id + "b", g: nxt, cx, clip: "b", sy: Math.sin((q * Math.PI) / 2), op: 0.5 + 0.5 * q });
    }
  }

  const bangX = s.bang.x;
  const wordRight = bangX + BANG_W;
  const caption = snap.greeting && s.form === "text" ? captionFor(snap.greeting) : "";

  return (
    <g ref={gRef} className="hf" data-live={live || undefined} data-ready={ready || undefined}>
      <defs>
        <clipPath id={`${uid}t`}><rect x="-60" y="-80" width="120" height={80 + HINGE} /></clipPath>
        <clipPath id={`${uid}b`}><rect x="-60" y={HINGE} width="120" height="80" /></clipPath>
      </defs>
      <g className="hf__word">
        {layers.map((l) => (
          <g key={l.key} transform={`translate(${l.cx} 0)`} clipPath={l.clip ? `url(#${uid}${l.clip})` : undefined} opacity={l.op ?? 1}>
            <g transform={l.sy != null ? `translate(0 ${HINGE}) scale(1 ${Math.max(0.001, l.sy)}) translate(0 ${-HINGE})` : l.sc && l.sc !== 1 ? `translate(0 ${BASE - 14}) scale(${l.sc}) translate(0 ${14 - BASE})` : undefined}>
              <Glyph g={l.g} />
            </g>
          </g>
        ))}
      </g>
      {/* double-click the word to go home; only takes the pointer once it has changed */}
      {live && <rect className="hf__wordhit" x={P.H[1]} y="0" width={Math.max(0, bangX - P.H[1])} height={BASE} fill="transparent" onDoubleClick={goHome} />}
      <g transform={`translate(${bangX - P["!"][1]} 0)`}>
        <g
          className="hf__bang"
          data-hint={hint || undefined}
          onAnimationEnd={() => setHint(false)}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <rect className="hf__hit" x={P["!"][1] - 36} y="-4" width={BANG_W + 49} height={BASE + 10} fill="transparent" />
          <path d={P["!"][0]} />
          {snap.focus && <rect className="hf__ring" x={P["!"][1] - 4} y="-2" width={BANG_W + 8} height={BASE + 5} rx="4" fill="none" />}
        </g>
      </g>
      <text className="hf__cap" x={wordRight + 7} y={BASE} data-on={caption ? "" : undefined}>{caption}</text>
    </g>
  );
}

function Glyph({ g }) {
  if (g.k === "p") return <path d={P[g.ch][0]} transform={`translate(${-mid(g.ch)} 0)`} />;
  if (g.ch === " ") return null;
  return <text className="hf__t" x="0" y={BASE} textAnchor="middle">{g.ch}</text>;
}
