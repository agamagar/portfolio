import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useReducedMotion, useDsTheme, useMediaQuery } from "../ds/hooks";
import { AppWindow } from "../ds/Scaffold";
import {
  IconPhone, IconChat, IconCheckUser, IconMagic, IconBell, IconArrowR,
  Pill, StatusDot, Waveform, SoundToggle, IconSpeaker, Bubble, FieldRow,
  PlanQueue, Caught, Disposition, ScopeNote, Disclosure, Button,
} from "../ds/Primitives";
import { FIELDS } from "./stellaFields";
import {
  graph, initialState, reduce,
  selectCurrent, selectBranches, selectAtEnd, selectCalled,
  selectRecord, selectPlan, selectDisposition, selectShown,
} from "./stellaKernel";
import AtsRecord from "./AtsRecord";
import StellaThread from "./StellaThread";
import CandidateView from "./CandidateView";
import { CATEGORIES, DEMO_NAME, DEMO_NAME_LATIN, ROLE_EN, SITE_EN } from "./stellaGraph";
import "../ds/tokens.css";
import "../ds/components.css";
import "../ds/scaffold.css";
import "./stellaSim.css";

// An interactive screening call, built on the Dassh design system. The viewer plays
// the CANDIDATE and picks replies; Stella answers per the documented design rules,
// and the rail names the decision behind every line she says.
//
// Two variants, same machine:
//   variant="page"   the whole viewport IS the app (route /stella). Real nav rail,
//                    app header, panes that fill the screen. No faux browser chrome,
//                    because the actual browser is already the chrome.
//   variant="figure" a contained product window for embedding in the case study.
//
// Dialogue lives in ./stellaGraph.js, drafted and adversarially reviewed for native
// register and design-rule compliance. See Claude/dassh-gujarati-research.md.

// The graph carries a {name} placeholder wherever the agent addresses the candidate,
// because the real system resolves it from the ATS record (and strips a trailing
// bhai/ben first, so a stored "Rameshbhai" never becomes "Rameshbhaibhai").
function fillName(text, latin) {
  if (!text) return text;
  return text.replace(/\{name\}/g, latin ? DEMO_NAME_LATIN : DEMO_NAME);
}

// Every item carries a VISIBLE label. The argument that a nav should name what it cannot
// do was being made in `title` and `aria-label`, which is to say nowhere a person looks.
// Two glyphs also fought their labels: a stack of disks stood for four SMS messages on
// someone's phone, and the item marked "Stella" was the one place Stella is not.
const NAV = [
  { key: "calls", Icon: IconPhone, label: "Calls", to: "call" },
  {
    key: "chat",
    Icon: IconMagic,
    label: "Stella",
    // Not a route here. Named rather than removed: a nav that quietly drops the
    // things it cannot do is a nav that lies about the size of the product.
    reason: "The dashboard is the second act of this case study. It is argued about in the writing rather than rebuilt here.",
  },
  { key: "candidates", Icon: IconCheckUser, label: "Record", to: "ats" },
  { key: "pool", Icon: IconChat, label: "Candidate", to: "candidate" },
  {
    key: "alerts",
    Icon: IconBell,
    label: "Alerts",
    // Was a bare span in the rail foot: no role, no handler, no name and no reason.
    // A false affordance is worse than an absent one, so it states its own case.
    reason: "Notifications exist in the product. Nothing in this demonstration generates one.",
  },
];

// Stella's Gujarati lines, rendered offline per node by scripts/render_stella.py.
// One file per node rather than one track, because the call branches: any node is
// reachable in any order. Missing files degrade to silence rather than throwing.
const AUDIO_BASE = "/stella";



// The header used to render the call's identity above ALL THREE views, so the record
// and the candidate views opened reading "Screening call", showing a green LIVE dot for
// a call that was off screen, and offering an Operator toggle that did nothing there.
// The real view title then arrived below as a second, larger heading, so two of three
// views opened with two competing titles and the subordinate one outranked the app bar.
const HEAD = {
  call: { title: "Screening call", sub: `${ROLE_EN}, ${SITE_EN}. You are the candidate.` },
  ats: { title: "Candidate record", sub: `${DEMO_NAME_LATIN}, after the call` },
  candidate: { title: "Candidate's phone", sub: `What ${DEMO_NAME_LATIN} gets` },
};

// Turn a graph node's speaker into the DS Bubble's side.
const SIDE = { stella: "start", candidate: "end", system: "full" };

// What the call has written down so far, and what it could not.
// The two halves are the argument: a record can read as complete while the thing the
// person actually said has nowhere to live.
function RecordPanel({ state, changed }) {
  const { byKey, offScript } = selectRecord(state);
  const confirmed = FIELDS.filter((f) => byKey[f.key]?.state === "confirmed").length;

  return (
    <div className="stl__record">
      <h2 className="ds-panetitle">
        The record
        <span className="ds-panetitle__count">
          {/* The changed count rides the STICKY head. The per-row "new" markers can sit
              below the fold of this scroller, which is the exact problem this feedback
              exists to solve: a change reported only where the viewer is not looking has
              not been reported. The head is always in view, so it carries the fact and
              the rows carry the detail. */}
          {changed.size > 0 && (
            <span className="ds-panetitle__new">
              {changed.size} new
            </span>
          )}
          {confirmed} of {FIELDS.length} confirmed
        </span>
      </h2>
      <div className="stl__recordlist">
        {FIELDS.map((f) => {
          const c = byKey[f.key];
          return (
            <FieldRow
              key={f.key}
              label={f.label}
              value={c?.value}
              state={c?.state || "empty"}
              note={c?.note}
              justChanged={changed.has(f.key)}
            />
          );
        })}
      </div>

      {/* "Not on the form" is a SUBSECTION of the record, not its peer. Both used to
          take .stl__recordhead, so a part read as a sibling of the whole. The head now
          sits INSIDE the dashed group it names rather than floating above it. */}
      <div className="stl__recordoff">
        <h2 className="stl__recordhead">Not on the form</h2>
        {offScript.length ? (
          <div className="stl__recordlist">
            {offScript.map((c) => (
              <FieldRow
                key={c.key}
                label={c.label || c.key}
                value={c.value}
                state="offscript"
                note={c.note}
              />
            ))}
          </div>
        ) : (
          <p className="stl__recordempty">
            {/* Second person: on this column the viewer IS the candidate, and the copy
                used to refer to them in the third person on the same screen that says
                "You are the candidate". More direct, not softer. */}
            Nothing yet. Anything you volunteer that the script has no question for lands
            here, or it is lost.
          </p>
        )}
      </div>
    </div>
  );
}


export default function StellaSim({ variant = "figure", onBack, theme: themeProp }) {
  const reduceMotion = useReducedMotion();
  // Resolve the theme, do not assert it. This used to be useState("dark") with nothing
  // passing the prop, so a visitor reading the site in light opened a dark console, and
  // the PDF export path (which forces theme=light) printed a dark island in a light
  // document. The light tokens were authored, shipped and unreachable.
  const resolved = useDsTheme();
  // Below 1100px .stl__threadcol is display:none, so the Operator control cannot act.
  const threadHidden = useMediaQuery("(max-width: 1100px)");
  const theme = themeProp || resolved;

  // All call logic lives in the kernel, so the same reduce runs headless in node.
  const [state, dispatch] = useReducer(reduce, undefined, initialState);
  const [muted, setMuted] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [view, setView] = useState("call"); // call | ats | candidate
  const [threadEmpty, setThreadEmpty] = useState(false);
  // Boot with the operator thread present. The plan is explicit that the demo should
  // open in its interesting state rather than behind a toggle, and the composer lives
  // here, so defaulting it off hid the front door.
  const [showThread, setShowThread] = useState(true);
  const logRef = useRef(null);
  const choicesRef = useRef(null);
  const endRef = useRef(null);
  const audioRef = useRef(null);
  const spokenRef = useRef(new Set());
  // In-flight is tracked separately from spoken. The id used to be marked spoken BEFORE
  // play() was attempted, so a rejected autoplay marked the opening line permanently
  // spoken and it could never be retried. inflight stops the effect re-entering and
  // restarting a file that is still loading; spoken is only stamped once play resolves.
  const inflightRef = useRef(new Set());
  const pendingRef = useRef(null);
  const [audioState, setAudioState] = useState("idle"); // idle | buffering | blocked | missing
  // The annotation pane is CONTROLLED so inspecting a turn can reopen it. The ref is
  // the courtesy: once a reader has folded it themselves, we stop reopening it.
  const [whyOpen, setWhyOpen] = useState(true);
  const whyTouchedRef = useRef(false);

  const turns = state.turns;
  const currentNode = selectCurrent(state);
  const branches = selectBranches(state);
  const atEnd = selectAtEnd(state);
  const called = selectCalled(state);
  const shownTurn = selectShown(state);
  const shown = shownTurn?.node || null;
  const shownId = shownTurn?.id || null;
  const plan = selectPlan(state);
  const disposition = selectDisposition(state);
  const lastFork = state.forks[state.forks.length - 1] || null;
  // Which record keys moved on the last CHOICE. Not the last turn: one choice appends two
  // or three turns (the candidate's line plus Stella's reply chain), so diffing against
  // turns.slice(0, -1) compared a state against itself and always found nothing.
  // A snapshot taken per choice is the honest boundary.
  const prevRecordRef = useRef({});
  const [changedKeys, setChangedKeys] = useState(() => new Set());
  useEffect(() => {
    const now = selectRecord(state).byKey;
    const prev = prevRecordRef.current;
    const moved = FIELDS.filter(
      (f) => (now[f.key]?.state || "empty") !== (prev[f.key]?.state || "empty")
    ).map((f) => f.key);
    prevRecordRef.current = now;
    // Only replace the set when something actually moved, so a turn that changes nothing
    // does not silently clear a mark the reader has not looked at yet.
    if (moved.length) setChangedKeys(new Set(moved));
    else if (turns.length <= 1) setChangedKeys(new Set());
  }, [turns.length, state]);

  const confirmedCount = FIELDS.filter(
    (f) => selectRecord(state).byKey[f.key]?.state === "confirmed"
  ).length;

  // ONE polite region, deliberately. The whole log was aria-live, so a sighted reader got
  // the COMPLETE-versus-empty contradiction in one glance while a listener got the false
  // claim announced (the system turn arrives in the log) and the counter-evidence silent,
  // because the record sits in a complementary landmark as inert markup. The pane built
  // so the demo would not have to be trusted was asking a blind reader to trust it.
  // The count rides the SAME region so the claim and the count arrive consecutively;
  // aria-describedby alone will not do it, because descriptions are not reliably folded
  // into a live-region announcement.
  const announce = atEnd
    ? `Call ended. ${disposition?.label || "no disposition"}. ${confirmedCount} of ${FIELDS.length} confirmed.`
    : speakingId
      ? "Stella speaking"
      : `Your turn. ${confirmedCount} of ${FIELDS.length} confirmed.`;
  // Index is carried alongside, because dispatch({type:"choose"}) keys on the branch's
  // position in the original array and partitioning must not renumber it.
  const indexed = branches.map((b, i) => ({ b, i }));
  const spoken = indexed.filter(({ b }) => b.candidateSays || b.gloss);
  const meta = indexed.filter(({ b }) => !b.candidateSays && !b.gloss);

  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
  }, [turns, reduceMotion]);

  // After a turn, focus lands on the next thing to do. Without this it fell to
  // document.body and a keyboard user had to Tab from the top of the document, through
  // the nav, the header, the thread and every turn, to reach the next control. The
  // kernel's own header comment claims the component owns focus; nothing did.
  useEffect(() => {
    if (turns.length <= 1) return;
    const target = atEnd
      ? endRef.current
      : choicesRef.current?.querySelector("button");
    target?.focus({ preventScroll: true });
  }, [turns.length, atEnd]);

  // Speak a line. Deliberately forgiving: a node with no rendered file, or a browser
  // blocking autoplay before the first gesture, goes quiet rather than erroring.
  const speak = useCallback((id) => {
    const a = audioRef.current;
    if (!a || !id) return;
    if (inflightRef.current.has(id)) return;
    inflightRef.current.add(id);
    a.pause();
    a.src = `${AUDIO_BASE}/${id}.mp3`;
    a.currentTime = 0;
    // NOT setSpeakingId here. The mark is driven by onPlaying below, so it can never
    // claim audio that has not started.
    pendingRef.current = id;
    setAudioState("buffering");
    a.play().then(() => {
      inflightRef.current.delete(id);
      spokenRef.current.add(id);
      setAudioState("idle");
    }).catch((err) => {
      inflightRef.current.delete(id);
      pendingRef.current = null;
      setSpeakingId(null);
      // Two different failures that used to look identical, and both looked like
      // nothing: the browser refusing to autoplay before a gesture, and a node with no
      // rendered file. The first is recoverable and the person has to be told how.
      if (err && err.name === "NotAllowedError") setAudioState("blocked");
      else { spokenRef.current.add(id); setAudioState("missing"); }
    });
  }, []);

  // The newest Stella turn, whether or not it has been spoken. The blocked-autoplay
  // recovery needs it, and so does every per-turn replay control.
  const newestStellaId = (() => {
    for (let i = turns.length - 1; i >= 0; i--) {
      if (turns[i].node.speaker === "stella") return turns[i].id;
    }
    return null;
  })();

  useEffect(() => {
    if (muted) return;
    for (let i = turns.length - 1; i >= 0; i--) {
      const { id, node } = turns[i];
      if (node.speaker !== "stella") continue;
      // spokenRef now gates the AUTOMATIC first play only. A manual press bypasses it.
      if (spokenRef.current.has(id) || inflightRef.current.has(id)) return;
      speak(id);
      return;
    }
  }, [turns, muted, speak]);

  useEffect(() => {
    const a = audioRef.current;
    if (a) a.muted = muted;
    if (muted && a) a.pause();
  }, [muted]);

  // The audio element lives in the header, so switching to the record or candidate view
  // unmounted the transcript and left Stella talking with nothing on screen naming what
  // was speaking.
  useEffect(() => {
    if (view === "call") return;
    audioRef.current?.pause();
    setSpeakingId(null);
    pendingRef.current = null;
  }, [view]);

  // A manual press always plays. Mishearing a Gujarati line, or arriving with autoplay
  // blocked, used to leave a person with no route to the audio at all on a surface whose
  // scope note advertises that the voice is real.
  const replay = useCallback((id) => {
    spokenRef.current.delete(id);
    inflightRef.current.delete(id);
    speak(id);
  }, [speak]);

  const restart = useCallback(() => {
    spokenRef.current = new Set();
    inflightRef.current = new Set();
    setAudioState("idle");
    if (audioRef.current) audioRef.current.pause();
    setSpeakingId(null);
    dispatch({ type: "restart" });
  }, []);

  const head = (
    <div className="stl__head">
      <audio
        ref={audioRef}
        // metadata, not none: with none the element had to fetch from scratch on every
        // play, which is what made the gap between the mark and the sound so wide.
        preload="metadata"
        onPlaying={() => {
          setSpeakingId(pendingRef.current);
          setAudioState("idle");
        }}
        onWaiting={() => setAudioState("buffering")}
        onEnded={() => { setSpeakingId(null); pendingRef.current = null; }}
        // A missing file is not a finished line. It used to clear to idle, so a 404 and
        // a completed sentence looked identical.
        onError={() => { setSpeakingId(null); setAudioState("missing"); }}
      />
      <div className="stl__who">
        <span className="stl__avatar" aria-hidden="true">
          <IconPhone />
        </span>
        <div className="stl__whotext">
          {/* h1 on the page route, where the viewport IS the application; a role-heading
              paragraph at level 3 in the figure, so an embedded product window does not
              compete with the case study's own h1. */}
          {variant === "page"
            ? <h1 className="stl__title">{HEAD[view].title}</h1>
            : <p className="stl__title" role="heading" aria-level={3}>{HEAD[view].title}</p>}
          <p className="stl__sub">{HEAD[view].sub}</p>
          {/* Status sits WITH the thing it reports on. It used to float alone in the
              middle of the bar, because space-between over five ungrouped children
              deals free space out evenly. */}
          {view === "call" && (
            <span className="stl__live" data-off={atEnd}>
              <StatusDot tone="numbers" off={atEnd} />
              {atEnd ? "Ended" : "Live"}
            </span>
          )}
        </div>
      </div>
      <span className="ds-sr" aria-live="polite">{announce}</span>
      <span className="stl__headctl">
      {view === "call" && (
        <button
          type="button"
          className="stl__mode"
          data-on={showThread && !threadHidden}
          aria-pressed={showThread && !threadHidden}
          aria-disabled={threadHidden || undefined}
          onClick={threadHidden ? undefined : () => setShowThread((v) => !v)}
        >
          <IconChat />
          {/* Named for the panel it reveals, not for a person. "Operator" is a noun
              naming a human, used as the control that shows and hides a column. */}
          Operator thread
          {threadHidden && <span className="stl__modewhy">no room at this width</span>}
        </button>
      )}
      {view === "call" && (
      <SoundToggle
        muted={muted}
        state={audioState === "blocked" && !muted ? "blocked" : "idle"}
        blockedLabel="Turn on Stella's voice"
        onToggle={() => {
          // When blocked, the press IS the user gesture the policy was waiting for, so
          // spend it on the line that was refused rather than only flipping a flag.
          if (audioState === "blocked" && !muted) {
            setAudioState("idle");
            if (newestStellaId) replay(newestStellaId);
            return;
          }
          setMuted((m) => !m);
        }}
      />
      )}
      {/* Also returns to the call. Resetting from the record view used to silently
          empty the record you were reading, with nothing on screen to show why. */}
      {/* The class is retained as a LAYOUT hook only (.stl__headctl .stl__restart sets the
          extra left margin that separates a reset from the control that merely mutes
          audio). Its chassis now comes from .ds-button. */}
      <Button
        variant="quiet"
        className="stl__restart"
        onClick={() => { restart(); setView("call"); }}
      >
        Start over
      </Button>
      </span>
    </div>
  );

  const grid = (
    <div className="stl__grid">
      <div className="stl__callcol">
        <div className="stl__log" ref={logRef} role="log">
          {turns.map(({ id, node }, i) => {
            const isStella = node.speaker === "stella";
            const isSystem = node.speaker === "system";
            const speakerLabel = isStella ? "Stella" : isSystem ? "System log" : "You";
            const inspectable = !!node.annotation;
            const cat = node.annotation?.category;
            const caught = node.subAgent
              ? /^(intent|distress|comprehension|escalation)\s*:\s*(.*)$/is.exec(node.subAgent.trim())
              : null;
            return (
              <Bubble
                key={`${id}-${i}`}
                as={inspectable ? "button" : "div"}
                type={inspectable ? "button" : undefined}
                className={`stl__turn stl__turn--${node.speaker}`}
                side={SIDE[node.speaker] || "start"}
                tone={cat}
                active={inspectable && id === shownId}
                aria-pressed={inspectable ? id === shownId : undefined}
                aria-describedby={inspectable ? "stl-inspect-hint" : undefined}
                speaking={id === speakingId}
                onClick={inspectable ? () => {
                  dispatch({ type: "inspect", id });
                  if (!whyTouchedRef.current) setWhyOpen(true);
                } : undefined}
                speaker={
                  <>
                    {speakerLabel}
                    {isStella && id === speakingId && <Waveform />}
                    {isStella && id === pendingRef.current && audioState === "buffering" && (
                      <Waveform state="buffering" />
                    )}
                    {/* A visible word, so selection and speech never look the same and
                        the state survives prefers-reduced-motion stilling the bars. */}
                    {isStella && id === speakingId && (
                      <span className="stl__speakmark">Speaking</span>
                    )}
                  </>
                }
                // Outside the bubble, because with as="button" the turn IS a button and
                // a button may not contain one. Only Stella's turns have audio.
                actions={isStella ? (
                  <button
                    type="button"
                    className="stl__play"
                    aria-label={`Play this line again, ${speakerLabel}`}
                    title="Play this line again"
                    onClick={() => replay(id)}
                  >
                    <IconSpeaker />
                  </button>
                ) : undefined}
              >
                {/* lang="gu" so a screen reader speaks Gujarati with a Gujarati voice
                    engine instead of pushing the codepoints through an English one.
                    The transliteration is a pronunciation aid for a sighted reader who
                    cannot read the script: for a listener it is a duplicate reading of
                    the line above, so it leaves the accessible tree. The gloss stays
                    untagged and inherits en, and is the accessible English reading. */}
                {node.guj && <span className="stl__guj" lang="gu">{fillName(node.guj)}</span>}
                {node.translit && (
                  <span className="stl__translit" aria-hidden="true">
                    {fillName(node.translit, true)}
                  </span>
                )}
                {node.gloss && <span className="stl__gloss">{fillName(node.gloss, true)}</span>}
                {node.failureCase && (
                  <span className="stl__failwrap">
                    <Pill tone="repair" soft>{node.failureCase.what}</Pill>
                    {/* The citation was the first twelve characters of the most
                        interesting annotation on the screen. annotation.source is a real
                        dedicated slot rendering exactly this kind of reference, so the
                        surface was contradicting its own convention. */}
                    {node.failureCase.source && (
                      <span className="stl__failsrc">{node.failureCase.source}</span>
                    )}
                  </span>
                )}
                {isStella && id === speakingId && audioState === "missing" && (
                  <span className="stl__failwrap">
                    <Pill tone="repair" soft>no audio for this line</Pill>
                  </span>
                )}
                {/* A listener firing is attached to the line it heard, not to a lamp
                    rail off to the side. A rail says a system is watching; this says
                    what it caught, here, in this sentence. */}
                {caught && <Caught which={caught[1].toLowerCase()}>{caught[2].trim()}</Caught>}
                {inspectable && (
                  <span className="stl__cue">{CATEGORIES[cat]?.short || "Why"}</span>
                )}
              </Bubble>
            );
          })}
        </div>

        <div className="stl__choices" ref={choicesRef} tabIndex={-1}>
          {atEnd ? (
            <div className="stl__ended" ref={endRef} tabIndex={-1}>
              {disposition && (
                <Disposition
                  tone={disposition.tone}
                  label={disposition.label}
                  truthful={disposition.truthful}
                  detail={disposition.detail}
                  contradiction={disposition.contradiction}
                />
              )}
              <div className="stl__endactions">
                {lastFork && lastFork.options.length > 1 && (
                  <div className="stl__replay">
                    <span className="stl__replaylabel">Answer that question differently</span>
                    <span className="stl__replaynote">
                      Rewinds to that question and replaces every turn after it.
                    </span>
                    {lastFork.options
                      .filter((o) => o.index !== lastFork.takenIndex)
                      .map((o) => (
                        <button
                          key={o.index}
                          type="button"
                          className="stl__replaybtn"
                          onClick={() => {
                            // The same audio reset `restart` does. Without it a line kept
                            // playing over a transcript that no longer contained it.
                            spokenRef.current = new Set();
                            inflightRef.current = new Set();
                            pendingRef.current = null;
                            audioRef.current?.pause();
                            setSpeakingId(null);
                            setAudioState("idle");
                            dispatch({ type: "replayFork", nodeId: lastFork.nodeId, index: o.index });
                          }}
                        >
                          <span className="stl__replayverb">Answer this instead</span>
                          <span className="stl__replaytext">{o.label}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* One row used to carry two different kinds of thing under one label that
                  claimed all of them were what you say: the candidate's utterances, and
                  two choices where the case-study READER steers the demo. The kernel has
                  always known the difference (a branch with neither candidateSays nor
                  gloss is the viewer, not the candidate), so the row is partitioned on
                  the distinction that already exists rather than a new one. */}
              {[
                { label: "You say", items: spoken },
                { label: "Take this call two ways", items: meta },
              ].filter((grp) => grp.items.length).map((grp) => (
                <div className="stl__choicegroup" key={grp.label}>
                  <p className="stl__choicelabel">{grp.label}</p>
                  <div className="stl__choicerow">
                    {grp.items.map(({ b, i }) => (
                      <button
                        key={b.next || b.label}
                        type="button"
                        className="stl__choice"
                        onClick={() => dispatch({ type: "choose", index: i })}
                      >
                        <span className="stl__choicetext">{b.label}</span>
                        {b.failureCase && <span className="stl__choicetag">{b.failureCase.what}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* The rail is NOT tabbed, and that is load-bearing rather than a layout
          preference. The whole argument of the old-system path is a contradiction
          between two things: the log line that reads "COMPLETE. All required fields
          captured. No flags raised." and a record in which every field it needed is
          unanswered. Behind a tab, a reviewer is TOLD the two disagree. Side by side
          in one frame, they are shown it, and the demo stops needing to be trusted.
          So the record is co-present, always, and first.

          The tabs were solving something real, though: three sections of equal weight
          left the eye no entry point. The fix is hierarchy, not concealment. The record
          leads at full weight; the plan and the annotation sit under it as disclosures,
          which is one level down rather than one tap away, and both stay in the same
          scroll. `defaultOpen` on the annotation means tapping a turn still lands
          somewhere visible. */}
      <aside className="stl__rail" aria-label="What the call is doing">
        {/* Stated once, so the action does not depend on what the cue word happens to say.
            The 60-word accessible name on an inspectable turn is a consequence of the
            deliberate whole-line tap target, not a defect to shrink. */}
        <span className="ds-sr" id="stl-inspect-hint">
          Press to show why Stella said this line.
        </span>
        <div className="stl__railsec">
          <RecordPanel state={state} changed={changedKeys} />
        </div>

        {/* The plan is the argument about what the call dropped and what it added.
            It belongs to the record, one disclosure down, not to a third column. */}
        <Disclosure
          label="What the call still has to do"
          meta={`${plan.filter((p) => p.status === "done").length} of ${plan.length}`}
        >
          <PlanQueue plan={plan} />
        </Disclosure>

        {/* Controlled. It used to pass a bare `open`, which React treats as an initial
            value: the moment a reader folded it, every later turn press changed nothing
            but a 1px border tint, and the app's signature gesture went silent. */}
        {/* `meta` carries the CURRENT annotation's category, so the summary line itself
            changes when you press a turn. Without it, respecting a deliberate fold and
            not going silent are in conflict: the reader who folded the pane would press
            a turn and see nothing move anywhere. Now the fold is honoured and the
            gesture still reports. */}
        <Disclosure
          label="Why this line"
          meta={shown?.annotation
            ? (CATEGORIES[shown.annotation.category]?.label || shown.annotation.category)
            : "press a turn"}
          open={whyOpen}
          onToggle={(next) => { setWhyOpen(next); whyTouchedRef.current = true; }}
        >
          {shown?.annotation ? (
            <div className="stl__note">
              <Pill tone={shown.annotation.category} soft>
                {CATEGORIES[shown.annotation.category]?.label || shown.annotation.category}
              </Pill>
              <p className="stl__noterule">{shown.annotation.rule}</p>
              <p className="stl__notewhy">{shown.annotation.why}</p>
              {shown.annotation.source && <p className="stl__notesrc">{shown.annotation.source}</p>}
            </div>
          ) : (
            <p className="stl__notewhy">
              Every line Stella says was a decision. Tap any of her turns to see which one.
            </p>
          )}
        </Disclosure>
      </aside>
    </div>
  );

  // The whole viewport is the application.
  if (variant === "page") {
    return (
      <div className="ds-root ds-root--live stl stl--page" data-theme={theme}>
        {/* A landmark name states PURPOSE, not brand. It read aria-label="Dassh". */}
        <nav className="stl__nav" aria-label="Main">
          <span className="stl__brand" aria-hidden="true">D</span>
          {NAV.map(({ key, Icon, label, to, reason }) => {
            const on = to && view === to;
            // Three real destinations. The rest are named non-destinations: still a
            // button, so the role carries aria-disabled and the reason is reachable by
            // keyboard, but with no handler, so pressing it does nothing rather than
            // pretending. A <span aria-disabled tabIndex={0}> dropped the state (the
            // attribute is meaningless on a generic role) and kept the tab stop, and
            // `title` never fires on keyboard focus.
            if (!to) {
              return (
                <span key={key} className="stl__navwrap">
                  <button
                    type="button"
                    className="stl__navitem"
                    data-off="true"
                    aria-disabled="true"
                    aria-describedby={`stl-navwhy-${key}`}
                  >
                    <Icon />
                    <span className="stl__navlabel">{label}</span>
                  </button>
                  <span className="stl__navwhy" id={`stl-navwhy-${key}`} role="tooltip">
                    <Pill tone="repair" soft>not built in this demonstration</Pill>
                    <span className="stl__navwhytext">{reason}</span>
                  </span>
                </span>
              );
            }
            return (
              <button
                key={key}
                type="button"
                className="stl__navitem"
                data-on={on}
                aria-current={on ? "page" : undefined}
                onClick={() => setView(to)}
              >
                <Icon />
                <span className="stl__navlabel">{label}</span>
              </button>
            );
          })}
          <span className="stl__navfoot">
            {onBack && (
              <button type="button" className="stl__navback" onClick={onBack} title="Back to the portfolio">
                <IconArrowR />
                <span className="stl__navbacklabel">Exit</span>
              </button>
            )}
          </span>
        </nav>
        <div className="stl__app">
          {head}
          <div className="stl__body">
          {view === "call" && showThread && (
            <div className="stl__threadcol">
              <StellaThread
                empty={threadEmpty}
                onNewThread={() => setThreadEmpty(true)}
                onIntent={(i) => {
                  if (i.action === "open-ats") setView("ats");
                  if (i.action === "open-candidate") setView("candidate");
                  if (i.action === "open-call") setThreadEmpty(false);
                }}
              />
            </div>
          )}
          {view === "ats" ? (
            <div className="stl__atswrap">
              <AtsRecord turns={turns} onBackToCall={() => setView("call")} />
            </div>
          ) : view === "candidate" ? (
            <div className="stl__atswrap">
              <CandidateView turns={turns} onBackToCall={() => setView("call")} />
            </div>
          ) : (
            grid
          )}
          </div>
          <div className="stl__scope stl__scope--foot">
            <ScopeNote collapsible>
              A working demonstration built for a case study, not the shipped Dassh
              product. The Gujarati is real and adversarially reviewed, the dialogue and
              the failure cases come from a 43-call field log, and the voice is rendered
              offline. The branching, the record and the recruiter view are drawn from
              what was designed; they are not a screenshot of production.
            </ScopeNote>
          </div>
        </div>
      </div>
    );
  }

  // Contained product window, for embedding inside the case study.
  return (
    <div className="ds-root ds-root--live stl stl--figure" data-theme={theme}>
      {/* rail={false}: the preset rail is four Shimmer blocks, and a skeleton that
          never resolves inside a surface a person can click reads as a broken load.
          The call column absorbs the 52px, which the two-column choice grid needs. */}
      <AppWindow url="app.dassh.ai/jobs/packing-operator/calls/live" rail={false}>
        {head}
        {grid}
        <div className="stl__scope stl__scope--figure">
          <ScopeNote collapsible>
            A working demonstration, not a screenshot of production. The Gujarati is real
            and adversarially reviewed, the dialogue and failure cases come from a 43-call
            field log, and the voice is rendered offline.
          </ScopeNote>
        </div>
      </AppWindow>
    </div>
  );
}
