// The landing page, serving TWO routes: /hello (the live candidate, passes
// detail="card") and /hello0 (the earlier version it was compared against,
// passes nothing). /hello3 is a separate fork under src/hello3/.
//
// The whole page hangs off one idea: the face is the anchor and never moves.
// It thinks, it notices you, it waves, and the page arrives around it. There is
// no intro overlay that lifts away, because a lifting overlay is a scene change
// and this should read as one continuous shot.

import { Fragment, Suspense, lazy, useCallback, useLayoutEffect, useRef, useState } from "react";
import MorphFace from "../MorphFace";
import { useReducedMotion } from "../figures/ds/hooks";
import { useIntroStage } from "./useStage";
import { useFlight } from "./useFlight";
import { ALSO, CREDENTIALS, GREETING, LINKS, ROLES } from "./helloData";

// The credentials, cut into LINES at the `br` markers in the data (annotations
// msmsctw4 / msmsukrr). Each segment keeps `gi`, its index in the flat array, so
// the punctuation and shimmer rules can still ask about their neighbours across
// a line boundary.
//
// Computed once at module scope rather than per render: the data is static, and
// a fresh array every render would give every line a new identity.
const CRED_LINES = (() => {
  const lines = [[]];
  CREDENTIALS.forEach((seg, gi) => {
    if (seg.br && lines[lines.length - 1].length) lines.push([]);
    lines[lines.length - 1].push({ ...seg, gi });
  });
  return lines;
})();
import RoleTooltip from "./RoleTooltip";
import GreetingMark from "./GreetingMark";
import HelloLink from "./HelloLink";
import PhoneMarquee from "./PhoneMarquee";
import PhoneMarqueeStep from "./PhoneMarqueeStep";
// The timeline was rebuilt from scratch (2026-08-07): one row primitive, three
// lenses over the same renderer, every fact printed. The superseded build
// (HelloTimeline.jsx, timelineViews.js, TimelineLenses.jsx) is deleted.
import Timeline from "./Timeline";
import SideQuests from "./SideQuests";
import SkyTip from "./SkyTip";
import AlongPath from "./AlongPath";
import DjBooth from "./DjBooth";
import FootIllus from "./FootIllus";
import HelloNote from "./HelloNote";
// WebGL, so it is lazy and never blocks first paint. The CSS band underneath is
// the fallback when WebGL is unavailable or the chunk has not landed yet.
const ShaderCanvas = lazy(() => import("../ShaderCanvas"));
import { LIVING_SKY_DEFAULTS } from "../shaders/washes";
import "./hello.css";

// An empty copy of the timeline section's shell (heading + horizontal axis),
// left blank as a template to fill later. Rendered N times below the timeline.
// SectionTemplate is gone (annotations msb8uvq4 + msb8v8k7): its empty axis was
// removed and its one heading, "A firm and cheery hello", moved into the footer
// where it now reads as the page's sign-off.

// Footer contact lines (annotation msbbqx15). Both are real links, not text: the
// recruiter's exit action has to be one tap on the phone, which is the screening
// surface (portfolio-direction-2026.md, section 1).
//
// Both supplied by Agam (msbbqx15, msbcgo7e). PHONE is the display form; the href
// is the same number stripped to digits and a leading +, which is what `tel:`
// wants — keep them in step if the number ever changes.
const EMAIL = "agamagar117@gmail.com";
const PHONE = "+91 8392867575";
const PHONE_HREF = "+918392867575";

function ContactLines() {
  return (
    <ul className="hello-foot__contact">
      <li>
        <a href={`mailto:${EMAIL}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect
              x="2.5"
              y="4.5"
              width="19"
              height="15"
              rx="2.5"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M3 7l8.15 5.6a1.5 1.5 0 0 0 1.7 0L21 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          {EMAIL}
        </a>
      </li>
      {PHONE && (
        <li>
          <a href={`tel:${PHONE_HREF}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6.5 3.5h3l1.5 4-2 1.4a12 12 0 0 0 6.1 6.1l1.4-2 4 1.5v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
            {PHONE}
          </a>
        </li>
      )}
    </ul>
  );
}

// `detail="card"` swaps the phone-detail overlay for the Evidence Card
// redesign. /hello0 passes nothing and is unchanged; /hello passes "card".
// `intro` defaults to true — this is a landing page and the greeting is its
// front door. The index passes intro={false} when it mounts this as scan mode,
// where an arrival sequence would be answering a question nobody asked.
export default function Hello({ onNavigate, detail, intro = true }) {
  const rootRef = useRef(null);
  const flyerRef = useRef(null);
  const reduce = useReducedMotion();
  const { stage, skip } = useIntroStage(rootRef, intro);
  const measure = useFlight(flyerRef, rootRef, !reduce);
  // Hovering the face replays the turn/wave, exactly as it does on the index
  // page: bumping this remounts MorphFace (and the wave) so the sequence runs
  // again from t=0. Per annotation ms8up04s.
  const [replayId, setReplayId] = useState(0);
  const replayGreeting = useCallback(() => {
    if (reduce) return;
    setReplayId((r) => r + 1);
  }, [reduce]);
  // Before the first paint, so the face is never seen at rest for a frame and
  // then thrown to the centre.
  useLayoutEffect(() => {
    if (!reduce) measure();
  }, [reduce, measure]);

  return (
    <div className="hello" ref={rootRef} data-page={detail === "card" || detail === "drawer" ? "2" : undefined} data-stage={stage} data-reduce={reduce ? "true" : undefined}>
      {/* Figma node 1:4: a full-bleed sky across the top, dissolved into the page
          by a very large blurred white ellipse. Reproduced as the LIVE shader
          rather than the pasted screenshot, and the dissolve as a mask rather
          than a white ellipse — a white shape would be a white blob on a dark
          page, while a mask fades to whatever the page actually is. */}
      <div className="hello-sky" aria-hidden>
        <Suspense fallback={null}>
          <ShaderCanvas
            preset="livingSky"
            className="hello-sky__canvas"
            uniforms={LIVING_SKY_DEFAULTS}
            clock
          />
        </Suspense>
      </div>
      {/* the weather tooltip over the bare sky (annotation msubv16w) */}
      <SkyTip />

      <section className="hello-hero">
        <div className="hello-hero__inner">
          {/* Figma: Portfolio 2026, node 9:1955. The greeting is two RIGHT-ranged
              lines with the face badge pinned to the left of line one. Line two
              is the wider line and therefore sets the block's width; line one
              gets the slack, which is what puts the badge and "Hello!" at
              opposite ends of it. The badge holds its final position from the
              first painted frame, so the intro is the words arriving around it
              rather than the face travelling. */}
          <h1 className="hello-hero__greet" onClick={stage === "reveal" ? undefined : skip}>
            {/* The words, for anything that reads rather than looks. The mark
                below is outlines and carries no text at all, so this is the only
                place the greeting exists as language. */}
            <span className="hello-hero__sr">{GREETING.join(" ")}</span>

            <span className="hello-hero__badge" aria-hidden>
              {/* The index page's avatar markup, verbatim: the same MorphFace
                  component and the same `.header__wave` hand on the same
                  `.header__avatar-wrap` frame, so the sequence and its geometry
                  are the page's own rather than a reconstruction of it.
                  This element is the traveller — it starts in the middle of the
                  viewport and ends here, and there is only ever one of it. */}
              <span className="hello-hero__flyer" ref={flyerRef}>
                <span className="header__avatar-wrap" onMouseEnter={replayGreeting}>
                  <MorphFace key={`face-${replayId}`} />
                  {!reduce && (
                    <span
                      className="header__wave"
                      data-kind="wave"
                      aria-hidden
                      key={`wave-${replayId}`}
                    >
                      <img
                        className="header__wave-img"
                        src="/wave.svg"
                        alt=""
                        width="26"
                        height="26"
                      />
                    </span>
                  )}
                </span>
              </span>
            </span>

            <GreetingMark className="hello-hero__mark-art" />
          </h1>

          <div className="hello-hero__meta">
            <div className="hello-hero__lines">
              {/* THREE SEPARATE LINES, not two paragraphs one of which wraps
                  (annotations msmsctw4 / msmsukrr). The credentials used to be
                  ONE <p> broken by a <br>, so lines one and two sat at
                  line-height while line three, a sibling paragraph, had the
                  flex column's 8px gap under it: three lines with two different
                  spacings, which is what reads as "not separate". Splitting at
                  the same marker makes every line a sibling and the one gap
                  govern all of them.

                  The split is on the SAME `br` flag the data already carried,
                  so where the line breaks is still one decision in one place. */}
              {CRED_LINES.map((line, li) => (
              <p className="hello-hero__cred" key={li}>
                {line.map((seg) => {
                  // `gi` is the segment's index in the FLAT credentials array.
                  // Every rule below - which punctuation follows, which name
                  // this is for the shimmer stagger - asks about NEIGHBOURS, and
                  // after the split into lines the local index no longer answers
                  // that: the first segment of line two would look like the
                  // first segment of the whole line-up and lose the comma that
                  // belongs to the name before it.
                  const i = seg.gi;
                  // The name chips are inline-block, and an inline-block
                  // boundary is a legal break point even before a comma \u2014 so a
                  // narrow line could open with ", CaratLane". Punctuation that
                  // FOLLOWS a name is therefore rendered inside a nowrap
                  // wrapper WITH that name, and stripped from the prose segment
                  // it came from.
                  const PUNCT = /^([,.;:!?]+)(\s*)/;
                  if (!seg.mark) {
                    const prev = CREDENTIALS[i - 1];
                    const text = prev?.mark ? seg.text.replace(PUNCT, "$2") : seg.text;
                    // An explicit break, not a width the line happens to hit
                    // (annotation msmrysoh): where this wraps is a reading
                    // decision - present tense, then past - and leaving it to
                    // the measure would move it at every viewport. The leading
                    // space the punctuation rule leaves behind is stripped,
                    // because after a <br> it would indent the new line by a
                    // space nobody typed.
                    // The <br> that used to live here is gone: the break is
                    // structural now, one <p> per line. The leading-space strip
                    // stays - the punctuation rule leaves " Prev. at " with a
                    // space where the comma was taken away, and at the start of
                    // its own line that is an indent nobody typed.
                    return <span key={i}>{seg.br ? text.replace(/^\s+/, "") : text}</span>;
                  }
                  const role = ROLES[seg.text];
                  // A name with a role behind it gets the card; the rest stay
                  // plain emphasis until their entries are transcribed.
                  // `shineIndex` is gone with the shimmer itself (2026-08-11).
                  // It staggered the three sweeps so they read as one band
                  // crossing the line; with no sweep there is nothing to stagger,
                  // and the `nameIdx` computed for it went with it.
                  const chip = role ? (
                    <RoleTooltip role={role}>{seg.text}</RoleTooltip>
                  ) : (
                    <mark className="hello-hero__mark">{seg.text}</mark>
                  );
                  const punct = !CREDENTIALS[i + 1]?.mark
                    ? CREDENTIALS[i + 1]?.text.match(PUNCT)?.[1]
                    : null;
                  return punct ? (
                    <span key={i} style={{ whiteSpace: "nowrap" }}>
                      {chip}
                      {punct}
                    </span>
                  ) : (
                    <Fragment key={i}>{chip}</Fragment>
                  );
                })}
              </p>
              ))}
              {/* HIDDEN FOR NOW (annotation msmt5jcp, "hide this line for
                  now"). Commented rather than deleted, and the copy stays in
                  helloData: "for now" is a pause, not a decision, and the line
                  had just been rewritten twice - putting it back should be
                  uncommenting one line, not reconstructing it from the history. */}
              {/* <p className="hello-hero__also">{ALSO}</p> */}
            </div>

            <nav className="hello-hero__links" aria-label="Elsewhere">
              {LINKS.map((l, i) => (
                <HelloLink
                  key={l.label}
                  to={l.href}
                  blank={l.kind === "blank"}
                  onNavigate={onNavigate}
                  className="hello-hero__link"
                  style={{ "--i": i }}
                >
                  {l.label}
                </HelloLink>
              ))}
            </nav>
          </div>
        </div>
      </section>

      {/* /hello gets the STEP carousel (annotation msd8yh8c); /hello0 keeps the
          continuous drift, which is "v1" and lives on untouched in
          PhoneMarquee.jsx. Same row, same cells, same detail overlay — only the
          motion engine differs, so the two can be compared directly. */}
      {/* "drawer" (the scan-page bottom sheet) rides the step carousel too —
          only the detail overlay differs from "card". Plain /hello0 keeps the
          drift engine and the original overlay. */}
      {/* THE ROW WAITS FOR THE INTRO (annotation mso8at13: "expand and start
          playing this first frame only after the loading animation is
          complete"). `reveal` is the last stage, so the carousel holds its first
          cell unexpanded and its media parked until the greeting has arrived.
          Reduced motion and any skip gesture both jump straight to `reveal`, so
          neither waits on an animation it is not going to see. */}
      {detail === "card" || detail === "drawer" ? (
        <PhoneMarqueeStep
          reduce={reduce}
          onNavigate={onNavigate}
          detail={detail}
          ready={stage === "reveal"}
        />
      ) : (
        <PhoneMarquee reduce={reduce} onNavigate={onNavigate} detail={detail} />
      )}
      {/* AlongPath now comes BEFORE the timeline (annotation mse8rdwx, "move this
          above the a journey through space-time and projects"). Only on /hello:
          /hello0 has no AlongPath at all, so its order is untouched either way. */}
      {(detail === "card" || detail === "drawer") && <AlongPath reduce={reduce} />}

      <Timeline />

      {/* Side quests: a Google Labs-style card carousel (annotation msb6bc99). */}
      {/* Side Quests is dropped from /hello (annotation msbwb4eq). The path
          marquee above now carries that title (msbnj2oh), so the page was
          running two sections under one name. /hello0 keeps it — it has no
          marquee section to take the job over. */}
      {/* HIDDEN (annotation msnd5y5h, "hide this"). Commented rather than
          deleted: the component, its data and its styles are untouched, so this
          is one line to put back. AlongPath above already carries the "Side
          quests!" heading, so the page is not missing a title - it is missing
          the second, listed telling of the same set. */}
      {/* {detail !== "card" && <SideQuests onNavigate={onNavigate} />} */}

      {/* The booth is no longer a section of its own: it IS the footer
          (annotation msb81jhs), and the room wrapper is gone too (msb8uck3), so
          the heading, the floor and the meta line are siblings here. */}
      {/* The WHOLE footer is the DJ console's hover target (annotation
          mscuenbz), not just its canvas. DjConsole looks for this attribute on
          an ancestor and listens there; without it, it falls back to its own
          canvas, so /dj and any other embed keep the tighter target. */}
      <footer className="hello-foot" data-dj-hover-root>
        {/* TWO SEPARATE CONTAINERS (annotation msechrbe: "remove the container and
            make the contents of this into 2 separate containers"). The
            `.hello-foot__inner` flex row that used to hold both is gone; the
            sign-off and the booth are now siblings, each carrying its own measure
            and gutter and stacking down the page.
            This reverses msbhykx4's return to two columns, and the trade that
            note recorded now runs the other way in our favour: side by side the
            booth could only be as wide as its column and the records landed near
            44px; full width, they go back to around 65px — the difference between
            "there is a crate there" and being able to read the sleeves. */}
        {/* ONE WRAPPER, NOT TWO (annotation msnxf3io: "agentation is not able to
            read this section very well, let's do a clean up").

            What was here: `.hello-foot__stack` holding `.hello-foot__text`, and
            nothing else. The stack existed to stand the sign-off and the DJ booth
            in a column; the booth stopped rendering (msnd5us4) and the stack was
            left wrapping a single child. Two nested unnamed divs around one block
            is exactly what makes an element path unreadable - it was reporting
            positions like `.hello-foot > div > div > h2` with no word in it that
            says what the thing IS.

            So: one container, named for its job, with a `data-region` on each of
            the footer's two parts. Anything reading the DOM now gets
            "sign-off" and "colophon" rather than a chain of divs. The stack's
            layout moved onto this element in hello.css; nothing about the
            rendering changed. */}
        <div className="hello-foot__sign" data-region="sign-off">
            {/* Illustration at the top of the sign-off column (annotation
                mscy7c0y), now an OUTLINE drawing (msd7x0nd) rather than the
                exported silhouette. It was a light/dark PAIR of PNGs, because a
                solid silhouette has to be authored twice — once per ground. An
                outline is a stroke, so it takes its ink from `currentColor` and
                one asset serves both themes. See FootIllus for how the outline
                was derived from the fills the node actually exports. */}
            <FootIllus className="hello-foot__illus" />
            {/* Back to the bare noun phrase (annotation msbk7p80). "Say a ..."
                made the heading an instruction to the reader; without the verb
                it is just the thing on offer, which is the register the rest of
                the footer is in. */}
            {/* Copy from Agam (annotation mseeynk1). This restores the verb that
                msbk7p80 had stripped — that note argued the bare noun phrase read
                as a thing on offer rather than an instruction, which was right at
                the time; the invitation reads warmer here and it is his call.
                Spelling: he wrote "cherry", which is a slip for the "cheery" the
                heading has always used. Kept as cheery — flagged rather than
                silently corrected. */}
            <h2 className="hello-foot__title">
              You&rsquo;re welcome to say
              {/* THE QUOTED PHRASE GETS ITS OWN LINE (annotation mshtwese).
                  A hard break rather than a width that happens to wrap there:
                  the break has to land in the same place at every size, because
                  what it separates is the sentence from the thing being quoted.
                  A wrap point is a coincidence of measure and would move the
                  moment the type scale or the viewport did. */}
              <br />
              {/* The phrase is a quotation, and the note says whose (annotation
                  msefea0i). FACT CHECK BEFORE SHIPPING: the 1878 New Haven
                  directory and the Edison/Bell dispute are well documented, but
                  the exact wording below is repeated more often than it is
                  sourced. Flagged to Agam rather than asserted quietly. */}
              <HelloNote
                title="Where the phrase comes from"
                /* Em-dashes removed (standing rule: none anywhere in output,
                   site copy included). Commas carry the aside just as well. */
                body="The first telephone directory, New Haven 1878, told subscribers how to open a call, and what it recommended was a firm and cheery “hulloa”. Edison had pushed for “hello”; Bell wanted “ahoy”. Hello won."
              >
                a <span className="hnote__mark">firm and cheery</span>{" "}
                &lsquo;hello&rsquo;
              </HelloNote>
            </h2>
          <ContactLines />
          {/* THE COMMENTED-OUT DJ BOOTH IS GONE from this file. It was two long
              notes and a disabled line for a component that has not rendered
              here since msnd5us4, and it was the reason the wrapper above
              existed. The component, its styles and its /dj route are untouched:
              `<DjBooth variant={undefined} />` inside this block is all it took,
              and both notes are preserved in git rather than in the markup. */}
        </div>
        {/* The location/role line is the last thing on the page (annotation
            msbcohp3): it sits below the sign-off rather than inside it, so it
            reads as the page's colophon rather than part of the sign-off. */}
        <div className="hello-foot__meta" data-region="colophon">
          <span>Bangalore, India</span>
          <span className="hello-foot__sep" aria-hidden>
            ·
          </span>
          <span>Interaction Designer</span>
          <span className="hello-foot__sep" aria-hidden>
            ·
          </span>
          {/* the year is a real fact, so it comes from the clock rather than
              being typed in and going stale next January */}
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
