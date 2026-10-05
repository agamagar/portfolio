// The Away PRD, rendered as native portfolio DOM from awayPrdData (was an A2UI
// iframe). Everything here is real, scannable HTML, so Agentation can pick and
// annotate any element. Lazy-loaded (it pulls in the ~300KB data module). The
// rendering lives in PrdRenderer (shared with the Dassh PRD); this file only binds
// the Away data + chrome so the Away/Dassh lazy chunks stay code-split.
import { useState } from "react";
import {
  awayPrdData,
  awayOverviewFold,
  awayResearchSpec,
  awayPaymentSpec,
  awayVerdictSpec,
} from "./awayPrdData";
import { awayNarration } from "./awayNarration";
import PrdRenderer from "./PrdRenderer";
import AwayIntentMap from "./AwayIntentMap";
import AwGenerativeView from "../figures/awayAgent/AwGenerativeView";

// Primary-research embed: the three "one Gmail connect" dashboards, shown as
// tabs. Each tab is a self-contained dark dashboard served from
// public/away-research/ (they scroll inside the frame). Rendered into the PRD as
// its own "Primary research" tab via the PrdRenderer `builders` registry.
function ResearchEmbed({ accent = "#2563EB" }) {
  const tabs = [
    { key: "wrapped", label: "Highlights", src: "/away-research/wrapped.html",
      note: "Where the trips go: the home triangle, nine years of inbox, airlines, and seasonality." },
    { key: "deep", label: "Field notes", src: "/away-research/deep.html",
      note: "The tells underneath: work-versus-home maps, last-minute booking, the marketing tax, and airline lifecycles." },
    { key: "more", label: "Appendix", src: "/away-research/more.html",
      note: "Distance flown, the exact language used to sell you a seat, and the rhythm the trips keep." },
  ];
  const [active, setActive] = useState(0);
  return (
    <div className="research-embed" style={{ "--re-accent": accent }}>
      <div className="research-embed__tabs" role="tablist">
        {tabs.map((t, i) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={"research-embed__tab" + (i === active ? " is-active" : "")}
            onClick={() => setActive(i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="research-embed__note">{tabs[active].note}</p>
      <div className="research-embed__frame">
        <iframe key={tabs[active].key} title={tabs[active].label} src={tabs[active].src} loading="lazy" />
      </div>
      <p className="research-embed__foot">
        One read-only Gmail connect on my own account. No questions asked. Amounts and booking references excluded; all processing was local.
      </p>
    </div>
  );
}

// The Primary research tab: the self-experiment that pressure-tests "they already
// know" against a real inbox. Summary sets it up; the embed carries the three
// dashboards via the `research` builder key wired below.
const awayPrimaryResearchSpec = {
  id: "prd-primary-research",
  eyebrow: "Evidence",
  title: "Primary research",
  summary:
    "To pressure-test 'they already know', I ran it on myself. I connected my own Google account read-only and let an agent reconstruct my travel life with zero questions asked: nine years, about 2,900 emails, and a home town it was never told. The flights trace a Bengaluru, Delhi, Mumbai work triangle; the trains all run to one small town, so it can infer where home is without being asked. It is the smallest honest proof that an agent can already know, and the clearest look at the tension the co-pilot rule exists to hold.",
  wireframe: { builder: "research" },
};

export default function PrdDoc() {
  const { synthesis, flightIndex, rescueSpec, ...rest } = awayPrdData;
  // Fold the 2026-06-30 problem-statement reframe in right after the one-liner so
  // it leads the Synthesis/Overview tab. Research + the two new deep specs become
  // their own tabs alongside Flight Index and Rescue.
  const { oneLiner, ...synthMore } = synthesis || {};
  const mergedSynthesis = { oneLiner, ...awayOverviewFold, ...synthMore };
  const specs = [
    awayResearchSpec,
    awayPrimaryResearchSpec,
    flightIndex && { eyebrow: "System", id: "prd-flightindex", ...flightIndex },
    awayVerdictSpec,
    rescueSpec && { eyebrow: "System", id: "prd-rescue", ...rescueSpec },
    awayPaymentSpec,
  ].filter(Boolean);

  return (
    <PrdRenderer
      data={{ ...rest, synthesis: mergedSynthesis, specs }}
      kick="Product Requirements · Away · global · interactive"
      title="The Away PRD"
      narration={awayNarration}
      agentCopy={<AwayIntentMap />}
      builders={{
        research: () => <ResearchEmbed accent="#2563EB" />,
        genPreview: () => <AwGenerativeView />,
      }}
    />
  );
}
