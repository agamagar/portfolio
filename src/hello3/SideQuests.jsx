// "Side quests" — a card carousel modelled on the Google Labs "learn" section
// (labs.google): a horizontal run of cards (thumbnail + title + blurb) with
// circular prev/next arrows that slide the row. Per annotation msb6bc99.
//
// The row scrolls natively (scroll-behavior: smooth), so the arrows just nudge it
// by one card and the transition is the browser's smooth scroll. Cards link to
// the real experiments; the thumbnail is a generated accent gradient (no image
// assets yet — swap in art later).

import { useCallback, useRef } from "react";
import HelloLink from "./HelloLink";

const QUESTS = [
  // Away leads the row (annotation msb7zxm0): it is the only card here that
  // carries a real outcome, so it goes first rather than sitting among the toys.
  // NOT a Pinterest image (annotation msbcimkv) — see the note there. This is the
  // real Away greeting screen, which is both the licensed option and the one the
  // strategy doc asks for.
  { title: "Away", blurb: "Raised a $1M seed round on a product I built in six months.", href: "/work/away", accent: "#2563eb", tag: "Seed round", media: ["/figures/away-agent/greeting/morning-ui.jpg", "/figures/away-agent/search-flow/state-3.png", "/figures/away-agent/greeting/night-ui.jpg"] },
  // Dassh took the booth's slot (annotation msbchl4p). The amount is deliberately
  // unstated — Agam gave the fact, not a figure, and a number nobody supplied is
  // not a number to invent.
  { title: "Dassh", blurb: "Raised angel investment for a B2B SaaS I designed from zero.", href: "/work/dassh", accent: "#ea580c", tag: "Angel round", media: ["/figures/dassh/onboarding.jpg", "/figures/dassh/clients.jpg", "/figures/dassh/agent-checklist.jpg"] },
  // AIIMS took the shader library's slot (annotation msbci89m). Facts from the
  // TIMELINE entry, which already carries "Published, Springer".
  { title: "AIIMS", blurb: "Research on teaching empathy to nurses in VR, published by Springer.", href: "/work/aiims", accent: "#059669", tag: "Published" },
  // Two cards with NO href yet (annotations msbdcvp9, msbdehij): neither has a
  // page to land on, and inventing a route would ship a 404. They render as
  // non-link tiles until there is somewhere to send people. Accents are hues
  // already used elsewhere in this codebase (the old booth purple, Toppr's teal)
  // rather than new picks; the tag sits on its own dark scrim, so the hue is
  // decorative and carries no contrast burden.
  { title: "Figma, automated", blurb: "Claude building native Figma files from a prompt: real layers, real auto-layout.", accent: "#6b21d9", tag: "Tooling" },
  { title: "A clinic in Dehradun", blurb: "Building a gynaecology clinic in the city that gave me so much.", accent: "#2bb3a3", tag: "In progress" },
];

// `layout="grid"` lays the cards out as 2-then-3 instead of a scrolling row.
// Scoped to /hello so /hello0 keeps its carousel and the two stay comparable.
export default function SideQuests({ onNavigate, layout }) {
  const isGrid = layout === "grid";
  const trackRef = useRef(null);

  const nudge = useCallback((dir) => {
    const track = trackRef.current;
    if (!track || !track.children[0]) return;
    const gap = parseFloat(getComputedStyle(track).gap) || 20;
    const step = track.children[0].getBoundingClientRect().width + gap;
    track.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  return (
    <section className="sq" data-layout={isGrid ? "grid" : undefined} aria-label="Side quests">
      <header className="sq__head">
        <div className="sq__headline">
          {/* Back to "Side quests!" by Agam's call (msbfw59y), overriding my
              earlier retitle — his name for it wins. The subtext is gone
              entirely (msbfvlvy): the heading stands alone. */}
          <h2 className="sq__title">Side quests!</h2>
        </div>
      </header>

      <div className="sq__track" ref={trackRef}>
        {QUESTS.map((q) => {
          // A card with no href is not a link. Rendering it as one would give a
          // pointer cursor and a focus stop that go nowhere (msbdcvp9, msbdehij).
          const Card = q.href ? HelloLink : "div";
          const linkProps = q.href ? { to: q.href, onNavigate } : {};
          return (
          <Card
            key={q.title}
            {...linkProps}
            className="sq__card"
            data-static={q.href ? undefined : "true"}
            style={{ "--accent": q.accent }}
          >
            {/* Up to three real plates, stacked and fanning out on hover. The
                accent gradient shows through for cards that have no media yet. */}
            <span className="sq__thumb" data-stack={q.media?.length || undefined} aria-hidden>
              {/* gradient cards get the squishy blobs (msbg1phh); media cards
                  keep their fan — one hover behaviour per thumb type */}
              {!q.media && (
                <svg className="sq__blobs" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice">
                  <circle className="sq__blob sq__blob--a" cx="160" cy="58" r="84" />
                  <ellipse className="sq__blob sq__blob--b" cx="160" cy="158" rx="88" ry="34" />
                </svg>
              )}
              {(q.media || []).slice(0, 3).map((src, i) => (
                <img key={src} className="sq__plate" data-i={i} src={src} alt="" loading="lazy" />
              ))}
              <span className="sq__tag">{q.tag}</span>
            </span>
            <span className="sq__card-body">
              <span className="sq__card-title">{q.title}</span>
              <span className="sq__card-blurb">{q.blurb}</span>
            </span>
          </Card>
          );
        })}
      </div>

      {/* arrows below the cards, centered (annotation msb7d8b4). A grid has
          nothing to scroll, so they are not rendered there at all rather than
          hidden with CSS: an invisible button is still a tab stop. */}
      {!isGrid && (
      <div className="sq__nav">
        <button type="button" className="sq__arrow" onClick={() => nudge(-1)} data-tip aria-label="Previous">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path d="M11 4l-5 5 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button type="button" className="sq__arrow" onClick={() => nudge(1)} data-tip aria-label="Next">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      )}
    </section>
  );
}
