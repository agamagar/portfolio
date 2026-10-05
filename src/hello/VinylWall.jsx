// The record wall behind the booth.
//
// No fake album covers. Records here are stored the way records actually get
// stored in a working crate: plain paper sleeves with a die-cut hole, and the
// only thing you can see through the hole is the label. So the "art" is the
// label, built procedurally from each track's own accent, and the identity of
// the record is what a DJ actually reads to find it, the name written on the
// sleeve.
//
// The wall is wired to the decks. Pulling a record mixes to it, and its slot
// stays open for as long as it is on a deck. Two decks means exactly two open
// slots, so which records are playing is legible from the wall alone, with no
// badge, no highlight and nowhere the word "playing" appears. The record to the
// right of an open slot leans into the gap, because that is what the one beside
// it does when you take a record out.

import { useCallback, useState } from "react";
import { TRACKS } from "../figures/dj/djTracks";

// Pull a record and it flies: a spinning vinyl lifts off the wall, arcs across to
// the console and lands ON the actual turntable, which spins it up to catch it.
// Per annotation msaeeib5. The disc is a DOM overlay, but it is flown to the
// platter's real projected screen position (hooks.deckScreen) and hands off to the
// 3D deck's catch reaction (hooks.landRecord) exactly as it arrives.
function flyToConsole(recordEl, track, hooks) {
  const accent = track.accent;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    // still hand the record to the deck, just without the flight
    const incoming = hooks?.nextDeck?.() || "b";
    hooks?.placeRecord?.(incoming, track);
    hooks?.landRecord?.(incoming);
    return;
  }
  const consoleEl = document.querySelector(".booth__console");
  if (!recordEl || !consoleEl) return;
  const from = recordEl.getBoundingClientRect();
  if (!from.width) return;

  const incoming = hooks?.nextDeck?.() || "b";
  // the platter's exact screen point, with a graceful fall back to the console box
  let target = hooks?.deckScreen?.(incoming);
  if (!target) {
    const to = consoleEl.getBoundingClientRect();
    target = { x: to.left + to.width * (incoming === "b" ? 0.7 : 0.3), y: to.top + to.height * 0.56 };
  }

  const size = Math.min(from.width, from.height) * 0.92;
  const cx = from.left + from.width / 2;
  const cy = from.top + from.height / 2;

  const disc = document.createElement("span");
  disc.className = "vw__fly";
  disc.style.setProperty("--accent", accent);
  disc.style.width = `${size}px`;
  disc.style.height = `${size}px`;
  disc.style.left = `${cx - size / 2}px`;
  disc.style.top = `${cy - size / 2}px`;
  document.body.appendChild(disc);

  const tx = target.x - cx;
  const ty = target.y - cy;

  const anim = disc.animate(
    [
      { transform: "translate(0,0) rotate(0deg) scale(1)", opacity: 1, offset: 0 },
      { transform: `translate(${tx * 0.5}px, ${ty * 0.5 - 90}px) rotate(380deg) scale(0.82)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${tx}px, ${ty}px) rotate(940deg) scale(0.42)`, opacity: 1, offset: 0.88 },
      { transform: `translate(${tx}px, ${ty}px) rotate(1180deg) scale(0.42)`, opacity: 0, offset: 1 },
    ],
    { duration: 1150, easing: "cubic-bezier(0.5, 0, 0.2, 1)", fill: "forwards" },
  );
  let settled = false;
  const done = () => {
    if (settled) return;
    settled = true;
    disc.remove();
    hooks?.placeRecord?.(incoming, track); // the record now spins on the deck
    hooks?.landRecord?.(incoming);
  };
  anim.onfinish = done;
  anim.oncancel = () => {
    if (!settled) disc.remove();
  };
  // Fallback so the record still lands if the animation is paused (e.g. a
  // backgrounded tab never fires onfinish); setTimeout fires regardless.
  setTimeout(done, 1200);
}

// Deterministic jitter, so a record sits at the same slightly-wrong angle on
// every render and every reload. A wall of perfectly parallel records is the
// single clearest tell that nobody has ever actually pulled one out.
function jitter(i, salt) {
  const n = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return n - Math.floor(n); // 0..1
}

function Label({ track }) {
  const rings = 5;
  return (
    <span className="vw__label" style={{ "--label": track.accent }}>
      <span className="vw__label-ink" />
      {Array.from({ length: rings }, (_, r) => (
        <span className="vw__groove" key={r} style={{ "--r": `${18 + r * 13}%` }} />
      ))}
      <span className="vw__spindle" />
      <span className="vw__label-type">
        <span className="vw__label-name">{track.name}</span>
        <span className="vw__label-genre">{track.genre}</span>
      </span>
    </span>
  );
}

export default function VinylWall({ onPull, hooks }) {
  // The wall starts full: nothing is empty until you pull it. A slot only empties
  // when the user selects that record (msaj86c7 / msaj8b3i), and it empties in
  // place with no neighbours shifting (msajdh4u). The record then shows on the
  // console deck it flew to.
  // Two decks means at most two records are off the wall at once. Keep the two
  // most-recently pulled; a third pull returns the oldest to its slot (msams02l).
  const [pulled, setPulled] = useState([]);

  const pull = useCallback(
    (e, track) => {
      flyToConsole(e.currentTarget.querySelector(".vw__record"), track, hooks);
      setPulled((prev) => [...prev.filter((k) => k !== track.key), track.key].slice(-2));
      onPull?.(track.key);
    },
    [hooks, onPull],
  );

  return (
    <div className="vw" aria-label="Record crate">
      <ul className="vw__grid">
        {/* ten records: a 5x2 crate (annotation msb9k40u) */}
        {TRACKS.slice(0, 10).map((track, i) => {
          const isOut = pulled.includes(track.key);
          return (
            <li className="vw__cell" key={track.key}>
              <button
                type="button"
                className="vw__slot"
                data-out={isOut ? "true" : undefined}
                onClick={(e) => !isOut && pull(e, track)}
                disabled={isOut}
                style={{
                  "--tilt": `${(jitter(i, 1) - 0.5) * 1.9}deg`,
                  "--drop": `${(jitter(i, 2) - 0.5) * 7}px`,
                  "--wear": jitter(i, 3).toFixed(3),
                  "--accent": track.accent,
                }}
              >
                {/* the record, behind the sleeve, sliding out to the right */}
                <span className="vw__record" aria-hidden>
                  <Label track={track} />
                </span>
                {/* the sleeve, in front, with a hole masked clean through it */}
                <span className="vw__sleeve" aria-hidden>
                  <span className="vw__seam" />
                  <span className="vw__scrawl">{track.name}</span>
                </span>
                <span className="vw__sr">
                  {isOut ? `${track.name}, on a deck` : `Play ${track.name}, ${track.genre}`}
                </span>
              </button>
              {/* empty-slot recess removed per annotations msacs3ft + msacs6ae */}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
