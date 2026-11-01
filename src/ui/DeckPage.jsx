// A case-study page rendered from its presentation deck, so the deck and the page are
// one source. Every card is the deck's own <Slide> inside the deck's own .slide-card
// (page variant: the present-size card scaled to the column; on a phone it flows).
//
//   <DeckPage slides={buildSlides(cs)}
//             renderSlide={(slide, { onGoto, idMap }) => <Slide ... />} />
//
// The contract, read from each slide:
//   chapter: "<id>"  which chapter it belongs to (a slide without one stays in the last);
//                    the chapter's phaseDivider (deck only) gives its number, title and line
//   skim: true       shown on the page
//   tuck: true       inside the chapter's closed "More on this" disclosure (a chapter that is
//                    all tucked, like Beyond the cart, names the disclosure after itself)
//   neither          deck only, not on the page
// Until a deck carries any of those fields, every slide shows, grouped by its phase
// dividers, so the page is never blank.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import SectionIndex, { scrollToId, useScrollSpyIds } from "./SectionIndex";
import "./deckPage.css";

// the present card's size (index.css .slide-card): height min(84vh, 900px) at 1512 / 982
const cardWidth = () => (Math.min(window.innerHeight * 0.84, 900) * 1512) / 982;

export function planDeckPage(slides) {
  const contract = slides.some((s) => s && (s.chapter || s.skim || s.tuck));
  if (!contract) {
    const groups = [{ id: "opening", title: "Opening", skim: [], tuck: [], quiet: true }];
    slides.forEach((s, i) => {
      if (s.type === "phaseDivider") groups.push({ id: s.id || `part-${i}`, title: s.name, skim: [], tuck: [], quiet: true });
      groups[groups.length - 1].skim.push(i);
    });
    return { contract, groups: groups.filter((g) => g.skim.length) };
  }
  // chapters in deck order; a chapter's phase divider (deck only) names it
  const byId = new Map();
  const chapter = (id) => {
    if (!byId.has(id)) byId.set(id, { id, title: id, n: null, sub: null, skim: [], tuck: [] });
    return byId.get(id);
  };
  let last = null;
  slides.forEach((s, i) => {
    if (s.chapter) last = s.chapter;
    if (!last) return;
    const g = chapter(last);
    if (s.type === "phaseDivider" && s.chapter) Object.assign(g, { title: s.name || g.title, n: s.n || null, sub: s.sub || null });
    else if (s.skim) g.skim.push(i);
    else if (s.tuck) g.tuck.push(i);
  });
  return { contract, groups: [...byId.values()].filter((g) => g.skim.length || g.tuck.length) };
}

// mounts the slide once it nears the viewport and keeps it; the frame's height is known
// up front, so nothing shifts when it fills
function DeckFrame({ n, children }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || on) return undefined;
    const io = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && setOn(true), { rootMargin: "150% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [on]);
  return (
    <section className="deck-page__frame" id={`slide-${n}`} aria-label={`Slide ${n}`} ref={ref}>
      <div className="slide-card slide-card--page">{on ? children : null}</div>
    </section>
  );
}

function Tucked({ label, count, children }) {
  const [open, setOpen] = useState(false);
  return (
    <details className="deck-page__more" onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>
        <span>{label}</span>{" "}
        <span className="deck-page__more-count">{count} {count === 1 ? "slide" : "slides"}</span>
      </summary>
      {open && <div className="deck-page__more-body">{children}</div>}
    </details>
  );
}

export default function DeckPage({ slides, renderSlide, label = "Chapters", top = null }) {
  const { contract, groups } = useMemo(() => planDeckPage(slides), [slides]);
  const rootRef = useRef(null);

  // one scale for every card: the column over the present card's width
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    const fit = () => {
      const col = el.querySelector(".deck-page__body")?.clientWidth || el.clientWidth;
      el.style.setProperty("--deck-scale", Math.min(1, col / cardWidth()).toFixed(4));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener("resize", fit);
    return () => { ro.disconnect(); window.removeEventListener("resize", fit); };
  }, []);

  const idMap = useMemo(() => {
    const m = {};
    slides.forEach((s, k) => { if (s && s.id) m[s.id] = k; });
    return m;
  }, [slides]);
  const onGoto = (idx) => {
    if (document.getElementById(`slide-${idx + 1}`)) return scrollToId(`slide-${idx + 1}`);
    const g = groups.find((x) => x.skim.includes(idx) || x.tuck.includes(idx));
    if (g) scrollToId(`ch-${g.id}`);
  };

  const ids = groups.map((g) => `ch-${g.id}`);
  const active = useScrollSpyIds(ids);
  const num = (g, i) => g.n || String(i + 1).padStart(2, "0");
  const entries = groups.map((g, i) => ({ key: `ch-${g.id}`, label: contract ? `${num(g, i)} ${g.title}` : g.title }));
  const frame = (i) => (
    <DeckFrame key={i} n={i + 1}>
      {renderSlide(slides[i], { onGoto, idMap })}
    </DeckFrame>
  );

  return (
    <div className="deck-page" data-contract={contract ? "on" : "off"} ref={rootRef}>
      <SectionIndex entries={entries} active={active} onPick={scrollToId} label={label} top={top} />
      <div className="deck-page__body">
        {groups.map((g, gi) => (
          <div className="deck-page__chapter" id={`ch-${g.id}`} key={g.id}>
            <header className={`deck-page__head${g.quiet ? " sr-only" : ""}`}>
              {contract && <p className="deck-page__num" aria-hidden="true">{num(g, gi)}</p>}
              <h2 className="deck-page__title">{g.title}</h2>
              {g.sub && <p className="deck-page__sub">{g.sub}</p>}
            </header>
            {g.skim.map(frame)}
            {g.tuck.length > 0 && (
              <Tucked label={g.skim.length ? "More on this" : g.title} count={g.tuck.length}>
                {g.tuck.map(frame)}
              </Tucked>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
