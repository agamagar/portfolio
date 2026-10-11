// <Face>: the one face component behind every style (faceRig.js + skins.jsx).
//
//   <Face skin="clay" />                     a still face in one style
//   <Face cycle />                           auto-cycles the styles, click to jump on
//   ref.current.emote("surprised")           fire an emote by hand
//
// SWITCHING (Agam: "bounce and emote when switching"): squash, spring up, the new skin
// swaps in at the top of the bounce (where the motion hides the cut), land with an
// overshoot, then one emote. EMOTES ("use with restraint, but lively motion"): only on a
// switch, on a click, or rarely when idle (a blink every few seconds, an emote every
// 15 s or so); each one is quick and springy. Reduced motion: no bounce, no emotes, the
// skins crossfade.

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { VIEWBOX, PATHS, HAIR_CLIP, EYES, BASE } from "./faceRig";
import { SKINS, SKIN_ORDER } from "./skins";

const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)"; // overshoot
const EASE = "cubic-bezier(0.33, 0, 0.2, 1)";

// each emote: keyframes per part, run together. Parts: head (tilt / bob), eyes (both),
// eyeL, eyeR, browL, browR, brows, mouth, mouthO, pupils (both eyes slide)
export const EMOTES = {
  blink: { d: 220, parts: { eyes: [{ transform: "scaleY(1)" }, { transform: "scaleY(0.08)", offset: 0.45 }, { transform: "scaleY(1)" }] } },
  grin: {
    d: 900,
    parts: {
      mouth: [{ transform: "scale(1)" }, { transform: "scale(1.32,1.22) translateY(1px)", offset: 0.25 }, { transform: "scale(1.26,1.18) translateY(1px)", offset: 0.75 }, { transform: "scale(1)" }],
      eyes: [{ transform: "scaleY(1)" }, { transform: "scaleY(0.12)", offset: 0.2 }, { transform: "scaleY(0.55)", offset: 0.35 }, { transform: "scaleY(0.55)", offset: 0.7 }, { transform: "scaleY(1)" }],
      head: [{ transform: "rotate(0deg)" }, { transform: "rotate(-3deg)", offset: 0.3 }, { transform: "rotate(-2deg)", offset: 0.7 }, { transform: "rotate(0deg)" }],
    },
  },
  surprised: {
    d: 1100,
    parts: {
      brows: [{ transform: "translateY(0)" }, { transform: "translateY(-6px)", offset: 0.18 }, { transform: "translateY(-5px)", offset: 0.75 }, { transform: "translateY(0)" }],
      eyes: [{ transform: "scale(1)" }, { transform: "scale(1.35)", offset: 0.18 }, { transform: "scale(1.25)", offset: 0.75 }, { transform: "scale(1)" }],
      mouth: [{ opacity: 1 }, { opacity: 0, offset: 0.12 }, { opacity: 0, offset: 0.8 }, { opacity: 1 }],
      mouthO: [{ opacity: 0, transform: "scale(0.4)" }, { opacity: 1, transform: "scale(1.1)", offset: 0.18 }, { opacity: 1, transform: "scale(1)", offset: 0.8 }, { opacity: 0, transform: "scale(0.6)" }],
      head: [{ transform: "translateY(0)" }, { transform: "translateY(-4px)", offset: 0.15 }, { transform: "translateY(0)", offset: 0.4 }],
    },
  },
  wink: {
    d: 850,
    parts: {
      eyeR: [{ transform: "scaleY(1)" }, { transform: "scaleY(0.08)", offset: 0.2 }, { transform: "scaleY(0.08)", offset: 0.65 }, { transform: "scaleY(1)" }],
      browR: [{ transform: "translateY(0)" }, { transform: "translateY(2px) rotate(8deg)", offset: 0.2 }, { transform: "translateY(2px) rotate(8deg)", offset: 0.65 }, { transform: "translateY(0)" }],
      mouth: [{ transform: "rotate(0deg) scale(1)" }, { transform: "rotate(-10deg) scale(1.15)", offset: 0.25 }, { transform: "rotate(-8deg) scale(1.12)", offset: 0.65 }, { transform: "rotate(0deg) scale(1)" }],
      head: [{ transform: "rotate(0deg)" }, { transform: "rotate(4deg)", offset: 0.25 }, { transform: "rotate(3deg)", offset: 0.65 }, { transform: "rotate(0deg)" }],
    },
  },
  lookAround: {
    d: 1500,
    parts: {
      eyes: [{ transform: "translateX(0)" }, { transform: "translateX(-3.5px)", offset: 0.15 }, { transform: "translateX(-3.5px)", offset: 0.4 }, { transform: "translateX(3.5px)", offset: 0.55 }, { transform: "translateX(3.5px)", offset: 0.8 }, { transform: "translateX(0)" }],
      head: [{ transform: "rotate(0deg)" }, { transform: "rotate(-2.5deg)", offset: 0.25 }, { transform: "rotate(2.5deg)", offset: 0.65 }, { transform: "rotate(0deg)" }],
    },
  },
  laugh: {
    d: 1000,
    parts: {
      head: [0, -5, 0, -4, 0, -3, 0].map((y, i, a) => ({ transform: `translateY(${y}px) rotate(${y ? -2 : 0}deg)`, offset: i / (a.length - 1) })),
      eyes: [{ transform: "scaleY(1)" }, { transform: "scaleY(0.1)", offset: 0.12 }, { transform: "scaleY(0.1)", offset: 0.85 }, { transform: "scaleY(1)" }],
      mouth: [{ transform: "scale(1)" }, { transform: "scale(1.35,1.3)", offset: 0.15 }, { transform: "scale(1.35,1.3)", offset: 0.85 }, { transform: "scale(1)" }],
    },
  },
  shy: {
    d: 1300,
    parts: {
      head: [{ transform: "rotate(0deg) translateY(0)" }, { transform: "rotate(-7deg) translateY(2px)", offset: 0.25 }, { transform: "rotate(-6deg) translateY(2px)", offset: 0.8 }, { transform: "rotate(0deg) translateY(0)" }],
      eyes: [{ transform: "translate(0,0) scaleY(1)" }, { transform: "translate(-2px,2px) scaleY(0.6)", offset: 0.25 }, { transform: "translate(-2px,2px) scaleY(0.6)", offset: 0.8 }, { transform: "translate(0,0) scaleY(1)" }],
      blush: [{ opacity: 0 }, { opacity: 0.85, offset: 0.25 }, { opacity: 0.85, offset: 0.8 }, { opacity: 0 }],
    },
  },
  think: {
    d: 1600,
    parts: {
      eyes: [{ transform: "translate(0,0)" }, { transform: "translate(2.5px,-3px)", offset: 0.2 }, { transform: "translate(2.5px,-3px)", offset: 0.85 }, { transform: "translate(0,0)" }],
      browR: [{ transform: "translateY(0)" }, { transform: "translateY(-4px)", offset: 0.2 }, { transform: "translateY(-4px)", offset: 0.85 }, { transform: "translateY(0)" }],
      mouth: [{ transform: "translateX(0) scaleX(1)" }, { transform: "translateX(3px) scaleX(0.75)", offset: 0.2 }, { transform: "translateX(3px) scaleX(0.75)", offset: 0.85 }, { transform: "translateX(0) scaleX(1)" }],
      head: [{ transform: "rotate(0deg)" }, { transform: "rotate(3deg)", offset: 0.2 }, { transform: "rotate(3deg)", offset: 0.85 }, { transform: "rotate(0deg)" }],
    },
  },
  nod: {
    d: 700,
    parts: { head: [0, 4, -1, 3, 0].map((y, i, a) => ({ transform: `translateY(${y}px) rotate(${y / 2}deg)`, offset: i / (a.length - 1) })) },
  },
};
// what a style switch lands with (one of these, never the same twice in a row)
const LANDING = ["grin", "surprised", "wink", "laugh", "lookAround", "shy", "think", "nod"];

const reduceMotion = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const Face = forwardRef(function Face({ skin: skinProp, cycle = false, interval = 4200, size = 280, idle = true, onSkinChange, className = "" }, ref) {
  const [skin, setSkin] = useState(skinProp || SKIN_ORDER[0]);
  const [fadeFrom, setFadeFrom] = useState(null); // reduced motion: the outgoing skin
  const root = useRef(null);
  const parts = useRef({});
  const busy = useRef(false);
  const lastEmote = useRef("");
  const hovered = useRef(false);
  const S = SKINS[skin] || SKINS[SKIN_ORDER[0]];
  const C = S.colors;
  const W = S.widths;

  const reg = (name) => (el) => {
    if (el) parts.current[name] = el;
  };

  const emote = useCallback((name) => {
    if (reduceMotion()) return Promise.resolve();
    const E = EMOTES[name];
    if (!E) return Promise.resolve();
    lastEmote.current = name;
    const runs = [];
    for (const [part, frames] of Object.entries(E.parts)) {
      const targets = part === "eyes" ? ["eyeL", "eyeR"] : part === "brows" ? ["browL", "browR"] : [part];
      for (const t of targets) {
        const el = parts.current[t];
        if (el) runs.push(el.animate(frames, { duration: E.d, easing: EASE }).finished.catch(() => {}));
      }
    }
    return Promise.all(runs);
  }, []);

  // the switch: squash, spring up, swap at the top, land with an overshoot, emote
  const switchTo = useCallback(
    async (next) => {
      if (busy.current || !SKINS[next]) return;
      busy.current = true;
      try {
        if (reduceMotion()) {
          setFadeFrom(skin);
          setSkin(next);
          setTimeout(() => setFadeFrom(null), 400);
          return;
        }
        const body = parts.current.body;
        const D = 620;
        const jump = body?.animate(
          [
            { transform: "translateY(0) scale(1,1)", easing: "ease-out" },
            { transform: "translateY(2px) scale(1.12,0.86)", offset: 0.14, easing: "cubic-bezier(0.2,0.8,0.3,1)" },
            { transform: "translateY(-22px) scale(0.92,1.1)", offset: 0.42, easing: "ease-in" },
            { transform: "translateY(0) scale(1.1,0.9)", offset: 0.68, easing: SPRING },
            { transform: "translateY(0) scale(0.97,1.03)", offset: 0.84 },
            { transform: "translateY(0) scale(1,1)" },
          ],
          { duration: D },
        );
        await new Promise((r) => setTimeout(r, D * 0.38)); // near the top of the bounce
        setSkin(next);
        onSkinChange?.(next);
        await jump?.finished.catch(() => {});
        const pool = LANDING.filter((e) => e !== lastEmote.current);
        await emote(pool[Math.floor(Math.random() * pool.length)]);
      } finally {
        busy.current = false;
      }
    },
    [skin, emote, onSkinChange],
  );

  const nextSkin = useCallback(() => switchTo(SKIN_ORDER[(SKIN_ORDER.indexOf(skin) + 1) % SKIN_ORDER.length]), [skin, switchTo]);

  useImperativeHandle(ref, () => ({ emote, switchTo, next: nextSkin, get skin() { return skin; } }), [emote, switchTo, nextSkin, skin]);

  // a controlled skin prop switches with the full bounce
  useEffect(() => {
    if (skinProp && skinProp !== skin) switchTo(skinProp);
  }, [skinProp]); // eslint-disable-line react-hooks/exhaustive-deps

  // auto-cycle (only while visible and not hovered)
  useEffect(() => {
    if (!cycle || SKIN_ORDER.length < 2) return undefined;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    if (root.current) io.observe(root.current);
    const id = setInterval(() => {
      if (visible && !hovered.current && !document.hidden && !busy.current) nextSkin();
    }, interval);
    return () => { clearInterval(id); io.disconnect(); };
  }, [cycle, interval, nextSkin]);

  // idle life, with restraint: a blink every 3 to 6 s, an emote about every 15 s
  useEffect(() => {
    if (!idle || reduceMotion()) return undefined;
    let alive = true, t = 0, n = 0;
    const tick = () => {
      if (!alive) return;
      n += 1;
      if (!busy.current && !document.hidden) {
        if (n % 4 === 0) emote(["lookAround", "think", "nod", "wink"][Math.floor(Math.random() * 4)]);
        else emote("blink");
      }
      t = setTimeout(tick, 3000 + Math.random() * 3000);
    };
    t = setTimeout(tick, 2500);
    return () => { alive = false; clearTimeout(t); };
  }, [idle, emote]);

  const partStyle = { transformBox: "fill-box", transformOrigin: "center" };
  const featureFilter = S.filters?.feature;

  const drawing = (sk, key, extraStyle) => {
    const K = SKINS[sk];
    const c = K.colors, w = K.widths, f = K.filters || {};
    return (
      <g key={key} style={extraStyle}>
        {/* skin: the whole head (the hair goes over it) and the ear */}
        <g filter={f.skin}>
          <path d={`${PATHS.silhouette} ${PATHS.ear}`} fill={c.skin} />
        </g>
        <g filter={f.feature}>
          <path d={PATHS.earCurl} stroke={c.skinShade} strokeWidth={w.curl} strokeLinecap="round" fill="none" />
        </g>
        {/* the nose: a thick worm of skin over the drawn line, lit as its own bump */}
        <g filter={f.nose || f.feature}>
          <path d={PATHS.nose} stroke={c.skin} strokeWidth={w.nose} strokeLinecap="round" fill="none" />
        </g>
        {/* hair: the drawing's outline above the hairline */}
        <g filter={f.hair}>
          <path d={PATHS.hair} fillRule="evenodd" clipPath="url(#face-hair-clip)" fill={c.hair} />
        </g>
      </g>
    );
  };

  return (
    <div
      ref={root}
      className={`face ${className}`}
      style={{ width: size, height: (size * 168) / 148, cursor: cycle ? "pointer" : undefined }}
      onClick={cycle ? nextSkin : undefined}
      onPointerEnter={() => (hovered.current = true)}
      onPointerLeave={() => (hovered.current = false)}
      role="img"
      aria-label={`Agam's face, ${S.label} style`}
    >
      <svg viewBox={VIEWBOX} width="100%" height="100%" overflow="visible">
        <defs>
          <clipPath id="face-hair-clip"><path d={HAIR_CLIP} /></clipPath>
          {SKIN_ORDER.map((k) => <g key={k}>{SKINS[k].defs}</g>)}
          <filter id="face-shadow" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation={S.shadow?.blur ?? 5} /></filter>
        </defs>
        {S.shadow && <ellipse cx={BASE.x + 4} cy={BASE.y + 3} rx="38" ry="5" fill={S.shadow.color} filter="url(#face-shadow)" />}
        <g ref={reg("body")} style={{ transformBox: "view-box", transformOrigin: `${BASE.x}px ${BASE.y}px` }}>
          <g ref={reg("head")} style={{ transformBox: "view-box", transformOrigin: `${BASE.x}px ${BASE.y - 40}px` }}>
            {fadeFrom && drawing(fadeFrom, "out", { opacity: 0, transition: "opacity 400ms" })}
            {drawing(skin, "in")}
            {/* blush (shy) */}
            <g ref={reg("blush")} style={{ opacity: 0 }}>
              <ellipse cx="99" cy="128" rx="7" ry="4" fill={C.blush} />
              <ellipse cx="141" cy="121" rx="6" ry="3.6" fill={C.blush} />
            </g>
            {/* the features: the parts the emotes move */}
            <g filter={featureFilter}>
              <path ref={reg("browL")} d={PATHS.browL} style={partStyle} stroke={C.hair} strokeWidth={W.brow} strokeLinecap="round" fill="none" />
              <path ref={reg("browR")} d={PATHS.browR} style={partStyle} stroke={C.hair} strokeWidth={W.brow} strokeLinecap="round" fill="none" />
              {EYES.map((e) => (
                <circle key={e.id} ref={reg(e.id)} cx={e.cx} cy={e.cy} r={e.r} style={partStyle} fill={C.eye} />
              ))}
              <path ref={reg("mouth")} d={PATHS.mouth} style={partStyle} stroke={C.mouth} strokeWidth={W.mouth} strokeLinecap="round" fill="none" />
              <path ref={reg("mouthO")} d={PATHS.mouthO} style={{ ...partStyle, opacity: 0 }} fill={C.mouth} />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
});

export default Face;
