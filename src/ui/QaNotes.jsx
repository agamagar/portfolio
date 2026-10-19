// DEV-ONLY QA LAYER (10 Oct 2026, "QA the whole and put tooltip-like
// annotations across the page"). Numbered pins sit on the elements a QA pass
// flagged; hover or focus a pin for the finding. A pill at the bottom centre
// shows the counts and turns the layer on and off (remembered per browser).
// While it is on, html.qa-on also reveals the writer's check-notes the page
// hides from readers (index.css .qa-confirm). The notes live in qaNotesData.js.
//
// Mounted from main.jsx under import.meta.env.DEV, like the Agentation toolbar,
// so none of this reaches a production build.

import { useEffect, useMemo, useState } from "react";
import { QA_NOTES } from "./qaNotesData";

const KEY = "qa-notes-on";
const readOn = () => {
  try {
    return localStorage.getItem(KEY) !== "0";
  } catch {
    return true;
  }
};

function findTarget(n) {
  let list;
  try {
    list = [...document.querySelectorAll(n.sel)];
  } catch {
    return null;
  }
  if (n.text) list = list.filter((e) => (e.innerText || e.textContent || "").includes(n.text));
  list = list.filter((e) => e.getClientRects().length);
  return list[n.nth || 0] || null;
}

// 11 Oct ("for all the annotations on the page give me an input field to type
// text"): each card has a reply field. Sending posts it to the Agentation server
// as an ordinary annotation on the pin's element, so the agent's annotation
// watch picks it up like any other note. Sent replies are remembered per pin.
const AGENT = "http://localhost:4747";
const SENT_KEY = "qa-notes-sent";
const readSent = () => { try { return JSON.parse(localStorage.getItem(SENT_KEY) || "{}"); } catch { return {}; } };
let sessionP = null;
function agentSession() {
  if (!sessionP) {
    sessionP = fetch(AGENT + "/sessions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: location.href }) })
      .then((r) => r.json()).then((j) => j.id || j.session?.id)
      .catch((e) => { sessionP = null; throw e; });
  }
  return sessionP;
}
const pathOf = (el) => {
  const parts = [];
  for (let e = el; e && e !== document.body && parts.length < 4; e = e.parentElement) {
    const c = (e.className && typeof e.className === "string" ? e.className.trim().split(/\s+/)[0] : "");
    parts.unshift(e.id ? "#" + e.id : c ? "." + c : e.tagName.toLowerCase());
  }
  return parts.join(" > ");
};
async function sendReply(n, text) {
  const el = findTarget(n);
  const r = el ? el.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };
  const id = await agentSession();
  const body = {
    comment: `[QA ${n.id}: ${n.title}] ${text}`,
    element: el ? `${el.tagName.toLowerCase()} (QA pin: ${n.title})` : `QA pin: ${n.title}`,
    elementPath: el ? pathOf(el) : n.sel,
    url: location.href,
    x: el ? ((r.left + r.width / 2) / document.documentElement.clientWidth) * 100 : 50,
    y: Math.round(r.top + scrollY),
    boundingBox: { x: r.left, y: r.top + scrollY, width: r.width, height: r.height },
    nearbyText: el ? (el.innerText || "").slice(0, 120) : "",
    timestamp: Date.now(),
  };
  const res = await fetch(`${AGENT}/sessions/${id}/annotations`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error("HTTP " + res.status);
}

function Reply({ n, sent, onSent }) {
  const [text, setText] = useState("");
  const [state, setState] = useState("idle"); // idle | sending | error
  const send = async () => {
    const t = text.trim();
    if (!t || state === "sending") return;
    setState("sending");
    try { await sendReply(n, t); setText(""); setState("idle"); onSent(t); }
    catch { setState("error"); }
  };
  return (
    <form className="qa-reply" onSubmit={(e) => { e.preventDefault(); send(); }}>
      {sent.length > 0 && (
        <ul className="qa-reply__sent">{sent.map((t, i) => <li key={i}>{t}</li>)}</ul>
      )}
      <label className="qa-reply__label" htmlFor={`qa-in-${n.id}`}>Your note</label>
      <textarea
        id={`qa-in-${n.id}`}
        rows={2}
        value={text}
        placeholder="Type a reply or an instruction"
        onChange={(e) => { setText(e.target.value); if (state === "error") setState("idle"); }}
        onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send(); } }}
      />
      <div className="qa-reply__row">
        <span className="qa-reply__hint" aria-live="polite">
          {state === "error" ? "Not sent: is the annotation server on :4747 running?" : state === "sending" ? "Sending" : "⌘ Enter to send"}
        </span>
        <button type="submit" disabled={!text.trim() || state === "sending"}>Send</button>
      </div>
    </form>
  );
}

export default function QaNotes() {
  const [on, setOn] = useState(readOn);
  const [path, setPath] = useState(() => location.pathname);
  const [spots, setSpots] = useState([]);
  const [open, setOpen] = useState(null);
  const [pinned, setPinned] = useState(null); // a clicked pin stays open while you type
  const [sent, setSent] = useState(readSent);
  const markSent = (id, t) => setSent((m) => {
    const next = { ...m, [id]: [...(m[id] || []), t] };
    try { localStorage.setItem(SENT_KEY, JSON.stringify(next)); } catch { /* not remembered */ }
    return next;
  });

  const notes = useMemo(() => QA_NOTES.filter((n) => !n.route || path.startsWith(n.route)), [path]);

  // the SPA changes routes without a reload; poll the path cheaply
  useEffect(() => {
    const t = setInterval(() => setPath(location.pathname), 800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("qa-on", on);
    try {
      localStorage.setItem(KEY, on ? "1" : "0");
    } catch {
      /* private mode: the layer still works, it just is not remembered */
    }
  }, [on]);

  // place the pins. Lazy figures mount and grow as the page is read, so the
  // positions are re-measured on a slow tick as well as on scroll and resize.
  useEffect(() => {
    if (!on || !notes.length) {
      setSpots([]);
      return undefined;
    }
    let raf = 0;
    const measure = () => {
      raf = 0;
      setSpots(
        notes.map((n, k) => {
          const el = findTarget(n);
          if (!el) return { n, k, miss: true };
          const r = el.getBoundingClientRect();
          return { n, k, x: r.left + scrollX, y: r.top + scrollY, w: r.width };
        })
      );
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    const t = setInterval(queue, 1500);
    addEventListener("resize", queue);
    addEventListener("scroll", queue, { passive: true });
    return () => {
      clearInterval(t);
      removeEventListener("resize", queue);
      removeEventListener("scroll", queue);
      cancelAnimationFrame(raf);
    };
  }, [on, notes]);

  if (!notes.length) return null;
  const count = (s) => notes.filter((n) => n.status === s).length;

  return (
    <>
      {/* mvfwh7v7 (Agam, "make this a circular button as well"): an icon-only round glass button like the eye and Inspect ones; the open count rides as a badge */}
      <button
        type="button" className="theme-toggle qa-circle" onClick={() => setOn((v) => !v)} aria-pressed={on}
        aria-label={`QA notes: ${count("open")} open, ${count("fixed")} fixed, ${count("note")} notes (${on ? "hide" : "show"})`}
        title={`QA · ${count("open")} open · ${count("fixed")} fixed · ${count("note")} notes`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 21V4" /><path d="M5 5h11l-2 4 2 4H5" /></svg>
        {count("open") > 0 && <span className="qa-circle__n" aria-hidden>{count("open")}</span>}
      </button>
      {on && (
        <div className="qa-layer" aria-label="QA notes">
          {spots.map(({ n, k, x, y, w, miss }) =>
            miss ? null : (
              <div
                key={n.id}
                className={"qa-pin qa-pin--" + n.status + (open === n.id || pinned === n.id ? " is-open" : "") + ((sent[n.id] || []).length ? " has-reply" : "")}
                // the pin sits on the target's top-right corner, inset a little;
                // the card opens leftward when the pin is near the right edge
                style={{ left: n.corner === "left" ? Math.max(4, x - 10) : Math.max(4, x + Math.min(w, document.documentElement.clientWidth - x) - 14), top: Math.max(4, y - 10) }}
                data-flip={n.corner !== "left" && x + w > document.documentElement.clientWidth - 320 ? "" : undefined}
                // hover anywhere on the pin OR its card keeps it open, so the
                // pointer can travel from the dot into the reply field
                onMouseEnter={() => setOpen(n.id)}
                onMouseLeave={() => setOpen((o) => (o === n.id ? null : o))}
                onFocus={() => setOpen(n.id)}
                onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen((o) => (o === n.id ? null : o)); }}
                onKeyDown={(e) => { if (e.key === "Escape") { setPinned(null); setOpen(null); e.currentTarget.querySelector(".qa-pin__dot")?.focus(); } }}
              >
                <button
                  type="button"
                  className="qa-pin__dot"
                  aria-label={`QA ${k + 1}: ${n.title}`}
                  aria-expanded={open === n.id || pinned === n.id}
                  onClick={() => setPinned((o) => (o === n.id ? null : n.id))}
                >
                  {k + 1}
                </button>
                <div className="qa-pin__card" role="dialog" aria-label={n.title}>
                  <span className="qa-pin__status">{n.status === "open" ? "Open" : n.status === "fixed" ? "Fixed" : "Note"}</span>
                  {pinned === n.id && (
                    <button type="button" className="qa-pin__close" aria-label="Close" onClick={() => setPinned(null)}>×</button>
                  )}
                  <strong>{n.title}</strong>
                  <p>{n.detail}</p>
                  <Reply n={n} sent={sent[n.id] || []} onSent={(t) => { markSent(n.id, t); setPinned(n.id); }} />
                </div>
              </div>
            )
          )}
        </div>
      )}
    </>
  );
}
