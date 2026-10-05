import { useCallback, useRef, useState } from "react";
import { Bubble, Pill, GhostInput, Button } from "../ds/Primitives";
import { ROLE_EN, SITE_EN } from "./stellaGraph";
import { route, EMPTY_CHIPS, SUGGESTIONS } from "./stellaIntents";

// The operator's side of the product: one durable thread that the live call sits
// INSIDE, rather than a chat that can eventually reach a call.
//
// Two deliberate asymmetries with the call column next door:
//   1. This thread is ENGLISH and SILENT. The operator is reading. The candidate is
//      listening. Putting Gujarati and audio on both sides would be louder and less
//      true: only one of these two people is on a phone.
//   2. Nothing here is irreversible. Every action that reaches a real person happens
//      in the call column, behind its own affordance, because an agent that dials
//      human beings should not be one keystroke away from doing it by accident.

const BOOT = [
  {
    id: "boot-req",
    who: "you",
    text: `Call the shortlist for the ${ROLE_EN.toLowerCase()} role at ${SITE_EN}.`,
  },
  {
    id: "boot-ack",
    who: "stella",
    text:
      "Fourteen people match. Two are blocked before I dial: one was called three times last week, and one asked not to be contacted again. Twelve to go, starting with the first.",
    note: "blocked two, and said why",
  },
];

export default function StellaThread({ onIntent, onNewThread, empty }) {
  const [entries, setEntries] = useState(BOOT);
  const [draft, setDraft] = useState("");
  const listRef = useRef(null);

  const send = useCallback(
    (raw) => {
      const text = (raw ?? draft).trim();
      if (!text) return;
      const intent = route(text);
      setEntries((prev) => [
        ...prev,
        { id: `you-${prev.length}`, who: "you", text },
        {
          id: `st-${prev.length}`,
          who: "stella",
          text: intent.reply,
          chips: intent.chips,
          scope: intent.scope,
          intentId: intent.id,
        },
      ]);
      setDraft("");
      if (intent.action) onIntent?.(intent);
      requestAnimationFrame(() => {
        const el = listRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      });
    },
    [draft, onIntent]
  );

  if (empty) {
    return (
      <div className="thr thr--empty">
        <div className="thr__hello">
          <p className="thr__hellotitle">Stella says hello</p>
          <p className="thr__hellosub">What role are you hiring for today?</p>
          <div className="thr__chips">
            {EMPTY_CHIPS.map((c) => (
              <Button key={c.intent} size="auto" onClick={() => send(c.label)}>
                {c.label}
              </Button>
            ))}
          </div>
        </div>
        <Composer draft={draft} setDraft={setDraft} send={send} />
      </div>
    );
  }

  return (
    <div className="thr">
      <div className="thr__head">
        <div>
          <p className="thr__eyebrow">Operator thread, English, silent</p>
          <h2 className="thr__title">{ROLE_EN}, {SITE_EN}</h2>
        </div>
        <Button variant="quiet" size="sm" onClick={onNewThread}>
          New thread
        </Button>
      </div>

      <div className="thr__list" ref={listRef}>
        {entries.map((e) => (
          <Bubble
            key={e.id}
            side={e.who === "you" ? "end" : "start"}
            speaker={e.who === "you" ? "You" : "Stella"}
            className="thr__msg"
          >
            <span className="thr__text">{e.text}</span>
            {e.note && (
              <span className="thr__note">
                <Pill tone="numbers" soft>{e.note}</Pill>
              </span>
            )}
            {e.scope === "not-built" && (
              <span className="thr__note">
                <Pill tone="repair" soft>not built in this demonstration</Pill>
              </span>
            )}
            {e.chips && (
              <span className="thr__chips thr__chips--inline">
                {e.chips.map((c) => (
                  <Button key={c} size="auto" onClick={() => send(c)}>
                    {c}
                  </Button>
                ))}
              </span>
            )}
          </Bubble>
        ))}

        <div className="thr__callstrip">
          <span className="thr__callstriplabel">Live call</span>
          <span className="thr__callstriptext">
            Candidate 1 of 12, connected. The call is running to the right.
          </span>
        </div>
      </div>

      <Composer draft={draft} setDraft={setDraft} send={send} />
    </div>
  );
}

function Composer({ draft, setDraft, send }) {
  return (
    <div className="thr__composer">
      <GhostInput
        value={draft}
        onChange={setDraft}
        onSubmit={() => send()}
        suggestions={SUGGESTIONS}
        placeholder="Ask Stella to start the calls, show the record, or explain a line"
        ariaLabel="Message Stella"
      />
      <Button
        variant="filled"
        size="lg"
        aria-label="Send"
        disabled={!draft.trim()}
        onClick={() => send()}
      >
        Send
      </Button>
    </div>
  );
}
