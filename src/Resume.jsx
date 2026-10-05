// Native two-column résumé (the editable "format" version in the résumé switcher).
// Name + blue title, contact top-right; Work Experience left; Education / Skills /
// Recognitions right. Roles render as numbered achievement points. Content is
// edited here directly. Print (Download PDF) hides the chrome and prints the sheet.
import "./resume.css";

const WORK = [
  {
    org: "Zepto", role: "Product Designer II", when: "DEC 2024 - CURRENT, BANGALORE",
    points: [
      "Designed Scheduled Delivery end to end from zero, a net-new capability for a platform built on 10 min delivery, including a pattern to manage overlapping slots across two days. Every scheduled order is 2X AOV of a regular order.",
      "Led a revamp of Zepto Ads with new campaign types (ad multiplier, day-parting, PCA expansion) and a clearer creation flow, opening about ₹2.8Cr per month in incremental advertiser revenue.",
      "Leading Jarvis, an AI product built from scratch for ad-specific use cases: AI campaign recommendations and a predicted-performance review surface, with early adoption near 30% and the flow validated by brands like HUL and P&G.",
      "Designed ZepIris [codename: odin-eye], Zepto's first open-source project, end to end with the data-science team, and ran its GTM from product to branding to a social launch that went viral on LinkedIn.",
    ],
  },
  {
    org: "Away", role: "Founding Designer", when: "[DATES], BANGALORE",
    points: [
      "Sole designer on a four-person team; defined the end-to-end experience for a flight app built on a contrarian bet, negotiate a flight instead of just searching and booking.",
      "Owned the whole trip lifecycle, find, vet, book, watch, rescue, and the voice the agent speaks in. About a third of users negotiate instead of booking the listed price.",
    ],
  },
  {
    org: "Dassh", role: "Design Consultant & Director", when: "[DATES]",
    points: [
      "Director as much as designer on Stella, an AI recruiter framed as an employee, not a tool. Took it from an idea to a product running live enterprise hiring across pharma, retail, manufacturing and insurance.",
      "Zero to a ₹1.2 crore raise (about $140K) in a year; the founding four grew to a team of around twenty.",
    ],
  },
  {
    org: "Toppr", role: "Design Intern", when: "[DATES], BANGALORE",
    points: [
      "Designed across Toppr's product family, the practice tool, the Toppr Plus paywall and School OS, and led design end to end on Toppr Ambassador, a new community product built from zero.",
    ],
  },
];

const EDUCATION = [
  // TODO: fill with your real education (degree, school, years, city).
  { org: "[School]", role: "[Degree]", when: "[YEARS], [CITY]", points: ["[One line about the degree.]"] },
];

const SKILLS = [
  { head: "Design", items: "Interaction & UI design · user flows · wireframes & prototypes · design systems & pattern libraries · motion design" },
  { head: "Prototyping", items: "Rapid prototyping · coded prototypes (React, HTML / CSS / JS) · motion (Principle, After Effects) · WebGL / shaders" },
  { head: "Research", items: "User interviews · behavioural analytics (PostHog) · A/B testing & experiments · funnel & task analysis" },
  { head: "AI & product", items: "LLM prompt systems · generative UI · agentic product design · PRDs & specs" },
  { head: "Leadership", items: "Cross-functional leadership · design critique · workshops · self-starter · communicative" },
];

const RECOGNITIONS = [
  { head: "ZepIris", items: "Zepto's first open-source project; 100% hub coverage, and a launch that went viral on LinkedIn." },
  { head: "Jarvis", items: "AI ad-recommendations flow validated by brands like HUL and P&G." },
  { head: "Away", items: "About a third of users negotiate instead of booking the listed price." },
  { head: "Dassh · Stella", items: "Zero to a ₹1.2 crore raise in a year, running live enterprise hiring." },
];

function Entry({ org, role, when, points }) {
  return (
    <div className="rz-entry">
      <p className="rz-entry__head">
        <span className="rz-entry__org">{org}</span>
        <span className="rz-entry__role"> · {role}</span>
      </p>
      <p className="rz-entry__when">{when}</p>
      <ol className="rz-points">
        {points.map((p, i) => <li key={i}>{p}</li>)}
      </ol>
    </div>
  );
}

function Cat({ head, items }) {
  return (
    <p className="rz-cat"><span className="rz-cat__head">{head}:</span> {items}</p>
  );
}

export default function Resume() {
  return (
    <div className="rz-sheet">
      <header className="rz-head">
        <div className="rz-head__id">
          <h1 className="rz-name">Agam Agarwal</h1>
          <p className="rz-title">Interaction<br />Designer</p>
        </div>
        <div className="rz-contact">
          <a href="https://www.agamagarwal.com">agamagarwal.com</a>
          <a href="mailto:agamagar117@gmail.com">agamagar117@gmail.com</a>
          <a href="https://www.linkedin.com/in/agam-agarwal/">linkedin.com/in/agam-agarwal</a>
        </div>
      </header>

      <div className="rz-cols">
        <section className="rz-col rz-col--main">
          <p className="rz-label">Work Experience</p>
          {WORK.map((w) => <Entry key={w.org} {...w} />)}
        </section>

        <section className="rz-col rz-col--side">
          <p className="rz-label">Education</p>
          {EDUCATION.map((e, i) => <Entry key={i} {...e} />)}

          <p className="rz-label rz-label--gap">Recognitions</p>
          {RECOGNITIONS.map((r) => <Cat key={r.head} {...r} />)}

          <p className="rz-label rz-label--gap">Skills</p>
          {SKILLS.map((s) => <Cat key={s.head} {...s} />)}
        </section>
      </div>
    </div>
  );
}
