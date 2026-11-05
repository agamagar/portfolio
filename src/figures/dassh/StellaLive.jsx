// The live Stella prototype in a phone frame, one per rule in the Dassh case study (v2, 4 Nov 2026).
// The chat is the built prototype in public/stella-chat/ (tools/sync-stella-chat.mjs). It is served from this origin,
// so the page can open it in a chosen state, keep its theme in step with the page's, and measure its live layout.
//
//   sky      the PhoneStage's sky; a view's own sky wins, so switching roles can swap it
//   paper    the card grain on the stage
//   views    one or more starts: { label, persona, key, send?, scrollTo?, sample?, sky?, alt }. Several views draw a role
//            switch above the phone; a view's frame mounts on first pick and stays mounted, so switching back is instant.
//              persona   which signed-in role the prototype runs as (a URL value only, never shown on the page)
//              key       ?reset=<key>: a clean seeded world under its own storage key on every load
//              send      a message typed into the composer once the app is up, as a reader would
//              scrollTo  a selector scrolled to the top of the thread (the Today card, past the greeting)
//              sample    ?sample=<name>, e.g. "group" for the hiring team's thread
//   spec     draws a "Show measurements" toggle: radii, padding and gutters read live from the prototype's DOM
//   caption  the line under the phone
//
// The phone is 320 wide on a desktop and most of the stage on a phone (stellaLive.css). The prototype keeps its 390 wide
// viewport and is scaled to the screen. Nothing inside the embed can scroll the page around it: focus and scrollIntoView
// are kept inside the frame. Restart (under the phone) reloads the shown view to its start.
import { useContext, useEffect, useRef, useState } from "react";
import PhoneFrame from "../ds/IphoneFrame";
import { PhoneLinkSlot } from "../ds/phoneLinkSlot";
import { PhoneStage } from "./PhoneStage";
import { rr } from "./roundedRect";

const SRC = "/stella-chat/stella-chat.html";
const DESIGN_W = 390; // the prototype's design width

const pageTheme = () => (document.documentElement.classList.contains("dark") ? "dark" : "light");
const srcFor = (v) => {
  const q = new URLSearchParams({ persona: v.persona, reset: v.key, embed: "1" }); // embed: persona names read as roles
  if (v.sample) q.set("sample", v.sample);
  return `${SRC}?${q}`;
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitFor(fn, ms = 8000) {
  const t0 = performance.now();
  while (performance.now() - t0 < ms) {
    try { const v = fn(); if (v) return v; } catch { /* the frame is still loading */ }
    await wait(100);
  }
  return null;
}

// The prototype's own theme follows data-theme on its <html>; the page's follows :root.dark. Keep the frame on the page's.
function syncTheme(doc) {
  const want = pageTheme();
  const html = doc?.documentElement;
  if (html && html.getAttribute("data-theme") !== want) html.setAttribute("data-theme", want);
}

// Focus and scrollIntoView inside a same-origin frame also scroll the page that holds it. Inside the embed they only
// ever move the frame's own scroller, so tapping around in the phone never jumps the article.
function containScroll(win) {
  const H = win.HTMLElement.prototype;
  const focus = H.focus;
  H.focus = function (opts) { return focus.call(this, { ...(opts || {}), preventScroll: true }); };
  win.Element.prototype.scrollIntoView = function (arg) {
    let p = this.parentElement;
    while (p && p !== win.document.body) {
      const s = win.getComputedStyle(p);
      if (/(auto|scroll)/.test(s.overflowY) && p.scrollHeight > p.clientHeight) break;
      p = p.parentElement;
    }
    if (!p || p === win.document.body) return;
    const o = typeof arg === "object" && arg ? arg : { block: arg === false ? "end" : "start" };
    const r = this.getBoundingClientRect();
    const pr = p.getBoundingClientRect();
    let top = 0;
    if (o.block === "center") top = r.top - pr.top - (pr.height - r.height) / 2;
    else if (o.block === "end") top = r.bottom - pr.bottom;
    else if (o.block === "nearest") top = r.top < pr.top ? r.top - pr.top : r.bottom > pr.bottom ? r.bottom - pr.bottom : 0;
    else top = r.top - pr.top;
    if (top) p.scrollBy({ top, behavior: o.behavior === "smooth" ? "smooth" : "auto" });
  };
}

// Type into the composer and press Enter, as a reader would. React reads the value on the next frame, so the key waits.
// Restart can drop the frame mid-way (its window then has no constructors), so every step checks the frame is still there.
async function sendInto(f, win, text) {
  try {
    const ta = await waitFor(() => f.isConnected && (win.document.querySelector(".chat-composer textarea") || win.document.querySelector("textarea")));
    if (!ta || !f.isConnected) return;
    const set = Object.getOwnPropertyDescriptor(win.HTMLTextAreaElement.prototype, "value").set;
    set.call(ta, text);
    ta.dispatchEvent(new win.Event("input", { bubbles: true }));
    await wait(80);
    if (!f.isConnected) return;
    ta.dispatchEvent(new win.KeyboardEvent("keydown", { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true, cancelable: true }));
  } catch { /* the frame was restarted or left the page */ }
}

function scrollToTop(doc, sel) {
  const el = doc.querySelector(sel);
  const sc = doc.querySelector(".chat-layout-messages");
  if (!el || !sc) return;
  sc.scrollTop += el.getBoundingClientRect().top - sc.getBoundingClientRect().top - 16;
}

const px = (v) => Math.round(parseFloat(v) || 0);
// Measurements read from the live DOM, in the prototype's own px. Shown only while the toggle is on.
function measure(win) {
  const doc = win.document;
  const H = win.innerHeight;
  const W = doc.documentElement.clientWidth;
  const box = (el) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
  const frameEl = doc.querySelector(".chat-composer-frame");
  const floor = frameEl ? frameEl.getBoundingClientRect().top : H;
  // the card most in view above the composer
  let card = null, best = 0;
  for (const el of doc.querySelectorAll(".chat-card")) {
    const r = el.getBoundingClientRect();
    const seen = Math.min(r.bottom, floor) - Math.max(r.top, 0);
    if (r.height > 40 && seen > best) { best = seen; card = el; }
  }
  const out = { W, H };
  if (card) {
    const cs = win.getComputedStyle(card);
    out.card = { ...box(card), r: px(cs.borderTopLeftRadius), pad: px(cs.paddingLeft) };
    const pill = [...card.querySelectorAll(".button, button")].find((b) => {
      const r = b.getBoundingClientRect();
      return r.height >= 24 && r.top >= 0 && r.bottom <= floor && parseFloat(win.getComputedStyle(b).borderTopLeftRadius) >= r.height / 2;
    });
    if (pill) out.pill = box(pill);
  }
  const field = doc.querySelector(".chat-composer");
  if (frameEl && field) {
    const fs = win.getComputedStyle(frameEl);
    out.frame = { ...box(frameEl), r: px(fs.borderTopLeftRadius), pad: px(fs.paddingLeft) };
    out.field = { ...box(field), r: px(win.getComputedStyle(field).borderTopLeftRadius) };
  }
  return out;
}

function SpecOverlay({ frame, k }) {
  const [m, setM] = useState(null);
  useEffect(() => {
    const win = frame?.contentWindow;
    if (!win) return undefined;
    let raf = 0;
    const run = () => { raf = 0; try { setM(measure(win)); } catch { /* the frame reloaded */ } };
    const kick = () => { if (!raf) raf = requestAnimationFrame(run); };
    win.document.addEventListener("scroll", kick, true);
    win.addEventListener("resize", kick);
    const iv = setInterval(kick, 400); // the reply streams in and the thread moves
    kick();
    return () => {
      clearInterval(iv);
      if (raf) cancelAnimationFrame(raf);
      try { win.document.removeEventListener("scroll", kick, true); win.removeEventListener("resize", kick); } catch { /* gone */ }
    };
  }, [frame]);
  if (!m || !k) return null;
  const s = (v) => v * k;
  // tags are placed in the page's px (the frame is scaled, the tags are not), so they stay legible on a small phone
  const compact = k < 0.62; // a phone in a narrow column gets short tags
  const tag = (x, y, text, key, right = false) => (
    <span key={key} className="slive__tag" style={right ? { right: 3, top: Math.max(3, y) } : { left: Math.max(3, x), top: Math.max(3, y) }}>{text}</span>
  );
  const { card, pill, frame: fr, field } = m;
  const midY = card ? card.y + Math.min(28, card.h / 2) : 0;
  return (
    <div className="slive__spec" aria-hidden="true">
      <svg width="100%" height="100%">
        {card && (
          <>
            {/* the padding band: the card's own corner outside, outer minus padding inside (the nesting rule itself) */}
            <path className="slive__pad" fillRule="evenodd" d={
              rr(s(card.x), s(card.y), s(card.w), s(card.h), s(card.r)) +
              rr(s(card.x + card.pad), s(card.y + card.pad), s(card.w - 2 * card.pad), s(card.h - 2 * card.pad), s(Math.max(0, card.r - card.pad)))
            } />
            <rect className="slive__line" x={s(card.x)} y={s(card.y)} width={s(card.w)} height={s(card.h)} rx={s(card.r)} />
            <line className="slive__dim" x1={0} y1={s(midY)} x2={s(card.x)} y2={s(midY)} />
            <line className="slive__dim" x1={s(card.x + card.w)} y1={s(midY)} x2={s(m.W)} y2={s(midY)} />
          </>
        )}
        {pill && <rect className="slive__line slive__line--pill" x={s(pill.x)} y={s(pill.y)} width={s(pill.w)} height={s(pill.h)} rx={s(pill.h / 2)} />}
        {fr && <rect className="slive__line" x={s(fr.x)} y={s(fr.y)} width={s(fr.w)} height={s(fr.h)} rx={s(fr.r)} />}
        {field && <rect className="slive__line slive__line--pill" x={s(field.x)} y={s(field.y)} width={s(field.w)} height={s(field.h)} rx={s(field.r)} />}
      </svg>
      {card && tag(s(card.x) + 4, s(card.y) - 18, compact ? `Card r${card.r} p${card.pad}` : `Card: radius ${card.r}, padding ${card.pad}`, "c")}
      {card && tag(3, s(midY) + 3, String(Math.round(card.x)), "gl")}
      {card && tag(0, s(midY) + 3, String(Math.round(m.W - card.x - card.w)), "gr", true)}
      {pill && tag(s(pill.x), s(pill.y) - 18, "Pill", "p")}
      {fr && tag(s(fr.x) + 4, s(fr.y) - 18, compact ? `Frame r${fr.r} p${fr.pad}` : `Frame: radius ${fr.r}, padding ${fr.pad}`, "f")}
      {field && fr && tag(s(field.x) + 4, s(field.y + field.h) + 3, compact ? `Field r${field.r} = ${fr.r} − ${fr.pad}` : `Field: radius ${field.r} = ${fr.r} − ${fr.pad}`, "fi")}
    </div>
  );
}

function Screens({ views, active, measuring }) {
  const box = useRef(null);
  const frames = useRef([]);
  const [near, setNear] = useState(false);
  const [fit, setFit] = useState({ k: 0, h: 844 });
  const [mounted, setMounted] = useState({});
  const [ready, setReady] = useState({});
  const [gen, setGen] = useState({});
  const slot = useContext(PhoneLinkSlot);

  // scale the 390 wide prototype to the screen, and let it fill the screen's height
  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const size = () => { const k = el.clientWidth / DESIGN_W; if (k) setFit({ k, h: Math.round(el.clientHeight / k) }); };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: "100% 0px" });
    io.observe(el);
    return () => { ro.disconnect(); io.disconnect(); };
  }, []);
  useEffect(() => { if (near) setMounted((m) => (m[active] ? m : { ...m, [active]: true })); }, [near, active]);

  // Restart under the phone reloads the view on screen
  const activeRef = useRef(active);
  activeRef.current = active;
  useEffect(() => {
    if (!slot) return undefined;
    slot({ restart: () => { const i = activeRef.current; setReady((r) => ({ ...r, [i]: false })); setGen((g) => ({ ...g, [i]: (g[i] || 0) + 1 })); } });
    return () => slot(null);
  }, [slot]);

  // the page's theme can change while the frames run
  useEffect(() => {
    const mo = new MutationObserver(() => frames.current.forEach((f) => { try { syncTheme(f?.contentDocument); } catch { /* reloading */ } }));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  const start = async (f, v, i) => {
    try {
      const win = f.contentWindow;
      const doc = f.contentDocument;
      if (!win || !doc) return;
      containScroll(win);
      syncTheme(doc);
      // the app keeps data-theme on the OS setting; hold it on the page's
      new win.MutationObserver(() => syncTheme(doc)).observe(doc.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      await waitFor(() => f.isConnected && doc.querySelector(v.sample ? "main, .stella-group" : "textarea"));
      if (v.scrollTo) { await waitFor(() => f.isConnected && doc.querySelector(v.scrollTo), 3000); await wait(150); if (f.isConnected) scrollToTop(doc, v.scrollTo); }
      if (!f.isConnected) return; // restarted while it was starting
      setReady((r) => ({ ...r, [i]: true }));
      if (v.send) sendInto(f, win, v.send);
    } catch { /* the frame was restarted or left the page */ }
  };

  const shown = !!ready[active];
  return (
    <div ref={box} className="slive__screen" data-ready={shown ? "" : undefined}>
      <div className="slive__floor" aria-hidden="true">{!shown && <span className="fembed__badge" role="status" aria-label="Loading the prototype"><i /><i /><i /></span>}</div>
      {views.map((v, i) => mounted[i] && fit.k ? (
        <iframe
          key={`${i}:${gen[i] || 0}`}
          ref={(el) => { frames.current[i] = el; }}
          className="slive__frame"
          src={srcFor(v)}
          title={v.alt}
          tabIndex={i === active ? 0 : -1}
          aria-hidden={i === active ? undefined : true}
          onLoad={(e) => start(e.currentTarget, v, i)}
          style={{ width: DESIGN_W, height: fit.h, transform: `scale(${fit.k})`, opacity: i === active && ready[i] ? 1 : 0, visibility: i === active ? "visible" : "hidden" }}
        />
      ) : null)}
      {measuring && ready[active] && frames.current[active] && <SpecOverlay frame={frames.current[active]} k={fit.k} />}
    </div>
  );
}

export default function StellaLive({ views, caption, spec = false, sky, paper }) {
  const [active, setActive] = useState(0);
  const [measuring, setMeasuring] = useState(false);
  const controls = (views.length > 1 || spec) && (
    <div className="slive__controls" role="group" aria-label={views.length > 1 ? "Show the prototype as" : "Measurements"}>
      {views.length > 1 && views.map((v, i) => (
        <button key={v.label} type="button" className="slive__btn" aria-pressed={i === active} onClick={() => setActive(i)}>{v.label}</button>
      ))}
      {spec && (
        <button type="button" className="slive__btn" aria-pressed={measuring} onClick={() => setMeasuring((on) => !on)}>
          {measuring ? "Hide measurements" : "Show measurements"}
        </button>
      )}
    </div>
  );
  return (
    <PhoneStage sky={views[active].sky || sky} paper={paper} controls={controls} caption={caption}>
      <PhoneFrame width={320} interactive={false} shadow="none" className="slive__phone">
        <Screens views={views} active={active} measuring={spec && measuring} />
      </PhoneFrame>
    </PhoneStage>
  );
}
