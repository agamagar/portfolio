// The feedback bench: seven events, five voices, audible side by side.
//
// Built for /lab at Agam's request ("find the google material sound library and
// guidelines and build them, visible in /lab as well"). Same job the vinyl
// harness and the mode guide do for their own systems: a place to hear the
// decision rather than read about it.
//
// WHY IT LIVES IN /lab AND NOT ON THE SITE. Every row here makes a noise on
// demand, which is exactly what the public pages must never do — sound is off
// by default and only the visitor turns it on. /lab is unlisted and nothing
// links to it, so pressing a button here is unambiguous consent. It calls
// `auditionSound`, the one export that bypasses the saved preference, for that
// reason and no other.
//
// The table is Material's own taxonomy, not ours: each row names the file in
// Google's sound resources library that the synthesized version is modelled on,
// so the mapping can be checked rather than taken on trust.

import { useState } from "react";
import { auditionSound, VOICE, VOICE_NAMES } from "../../ui/sound";
import { feedback } from "../../ui/feedback";

// Event -> what it means here, and the Material library file it is modelled on.
// Sources: m2.material.io/design/sound (About sound, Applying sound to UI,
// Sound attributes) and the Material sound resources library, CC-BY 4.0.
const ROWS = [
  {
    id: "toggle",
    fires: "A binary state flips and the flip is the point: read/scan, light/dark, mute.",
    material: "ui_lock / ui_unlock",
    why: "Tonal — Material puts state changes in the tonal column. Direction carries the state: rises turning on, falls turning off.",
  },
  {
    id: "select",
    fires: "A choice commits: a chip, a filter, a card, a list row.",
    material: "ui_tap-variant-01",
    why: "Atonal. A tap is a texture, not a note, and it is frequent enough that a pitch would start to feel like a tune.",
  },
  {
    id: "navigate",
    fires: "Position changes within a sequence: a rail month, a marquee step.",
    material: "navigation_forward-selection-minimal",
    why: "The most frequent event on the site, so the most muted — Material: use softer, quieter timbres for low-priority sounds. Coalesced to one per 120ms.",
  },
  {
    id: "reveal",
    fires: "Content arrives that was not there: a panel, a sheet, a disclosure.",
    material: "navigation_transition-right",
    why: "A transition, so atonal — but rising, because something opened.",
  },
  {
    id: "confirm",
    fires: "A positive resolution. The thing worked.",
    material: "navigation_selection-complete-celebration",
    why: "Two notes, upward. Material: upward motion indicates starting, openness, positivity, or assurance.",
  },
  {
    id: "reject",
    fires: "Refused, invalid, blocked. The only event allowed to be sour.",
    material: "alert_error-01",
    why: "The one bright timbre here — brighter sounds feel louder and carry in a busy room, which is the whole job of an error.",
  },
  {
    id: "boundary",
    fires: "The end of a range: the last month, nothing further that way.",
    material: "navigation_unavailable-selection",
    why: "One pitch, repeated, going nowhere — Material: repetition indicates thinking, waiting, or lack of progress. NOT the error sound, and Material separates these two in its own library.",
  },
];

export default function FeedbackBench() {
  const [voice, setVoice] = useState(VOICE);
  const [last, setLast] = useState(null);

  const play = (id) => {
    setLast(id);
    auditionSound(id, voice);
    // the haptic half fires through the real path, so a phone visiting /lab
    // feels exactly what the site would give it
    feedback(id);
  };

  return (
    <section className="fb">
      <header className="fb__head">
        <h2 className="fb__title">Feedback layer</h2>
        <p className="fb__sub">
          Seven events, one intention each. Press a row to hear it and feel it. Nothing here
          respects the site&rsquo;s sound preference — this page is the exception, because a
          bench that stays silent is not a bench.
        </p>
        <div className="fb__voices" role="group" aria-label="Voice">
          {VOICE_NAMES.map((v) => (
            <button
              key={v}
              type="button"
              className="fb__voice"
              aria-pressed={v === voice}
              onClick={() => {
                setVoice(v);
                feedback("select");
                if (last) auditionSound(last, v);
              }}
            >
              {v}
              {v === VOICE ? " ·" : ""}
            </button>
          ))}
        </div>
        <p className="fb__note">
          <b>·</b> marks the locked voice. Material is synthesized from Google&rsquo;s
          guidelines rather than shipped as their audio: the library is CC-BY 4.0, and our own
          spec says synthesized, never sampled.
        </p>
      </header>

      <ol className="fb__list">
        {ROWS.map((r) => (
          <li key={r.id} className="fb__row">
            <button type="button" className="fb__play" onClick={() => play(r.id)}>
              <span className="fb__name">{r.id}</span>
              <span className="fb__fires">{r.fires}</span>
              <span className="fb__why">{r.why}</span>
              <code className="fb__mat">{r.material}</code>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
