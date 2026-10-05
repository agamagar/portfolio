// Generic PRD renderer — native portfolio DOM from a data object, so Agentation
// can scan/annotate every element. Data-agnostic: PrdDoc (Away) and DasshPrdDoc
// each import their own data module and pass it in, so the lazy chunks stay split.
//
// Expected data shape:
//   { synthesis:{oneLiner,...}, pillars:[{key,title,oneLiner,...fields}],
//     personas?:[{...}], journeys?:[{user,stages}], specs?:[{eyebrow,id,...spec}] }
import { useState, createContext, useContext, Fragment } from "react";
import NarrationPlayer from "./NarrationPlayer";
import CompositionPromptBuilder from "./CompositionPromptBuilder";
import AirplanePromptBuilder from "./AirplanePromptBuilder";
import Faces3dPromptBuilder from "./Faces3dPromptBuilder";
import ZeptoCampaignPromptBuilder from "./ZeptoCampaignPromptBuilder";
import ScheduleImagesPromptBuilder from "./ScheduleImagesPromptBuilder";
import SchedulePovPromptBuilder from "./SchedulePovPromptBuilder";
import EkamPromptBuilder from "./EkamPromptBuilder";
import Icons3dPromptBuilder from "./Icons3dPromptBuilder";
import CameraViewsPromptBuilder from "./CameraViewsPromptBuilder";
import TeamsPromptBuilder from "./TeamsPromptBuilder";
import TeamIllustrationsPromptBuilder from "./TeamIllustrationsPromptBuilder";
import JourneyEmbedding from "./JourneyEmbedding";
import { ratio, fmt, passes, level } from "./colorLibrary/contrast.js";
import "./prd.css";

// Registry for one-off interactive specs: a spec field valued { builder: "<key>" }
// renders the matching component instead of the generic list/pre output below.
// A PRD can extend this at render time via the `builders` prop (e.g. Dassh passes
// its wireframe animations), merged into this base set through BuildersContext.
const BUILDERS = {
  "zepto-fmcg-composition": CompositionPromptBuilder,
  "airplane-views": AirplanePromptBuilder,
  "faces-3d": Faces3dPromptBuilder,
  "zepto-campaign": ZeptoCampaignPromptBuilder,
  "schedule-images": ScheduleImagesPromptBuilder,
  "schedule-pov": SchedulePovPromptBuilder,
  ekam: EkamPromptBuilder,
  "camera-views": CameraViewsPromptBuilder,
  "icons-3d": Icons3dPromptBuilder,
  "team-prompts": TeamsPromptBuilder,
  "team-illustrations": TeamIllustrationsPromptBuilder,
};
const BuildersContext = createContext(BUILDERS);

// camelCase / key → readable label
const labelize = (k) =>
  String(k)
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase())
    .replace(/\bV1\b/i, "V1")
    .replace(/\bV2\b/i, "V2");

// short, index-rail-friendly label (drop trailing clauses)
const shortLabel = (t) => String(t).split(",")[0].split(" — ")[0].trim();

const isEmpty = (v) =>
  v == null || v === "" || (Array.isArray(v) && v.length === 0);

// A preformatted, copy-to-clipboard block (used for exact copy-paste prompts).
function Pre({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="prd-pre">
      <button type="button" className="prd-pre__copy" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
      <pre>{text}</pre>
    </div>
  );
}

// A row of colour swatches (the colour system). Each swatch is a tile of `hex`; when
// `on` is given the tile shows sample type in that colour with the contrast ratio
// computed at render time, badged pass/fail against body text (4.5:1) and, failing
// that, graphics (3:1). Nothing here is typed by hand, so the badge follows the hex.
function Swatches({ items, compact }) {
  return (
    <div className={"prd-swatches" + (compact ? " is-compact" : "")}>
      {items.map((s, i) => {
        const r = s.on ? ratio(s.on, s.hex) : null;
        const level = r == null ? null : passes(r, "body") ? "aa" : passes(r, "graphic") ? "large" : "fail";
        return (
          <div className="prd-swatch" key={i}>
            <div className="prd-swatch__tile" style={{ background: s.hex, color: s.on || undefined }}>
              {s.on && <span className="prd-swatch__sample" aria-hidden="true">Aa</span>}
              {r != null && (
                <span className={`prd-swatch__ratio is-${level}`} title={level === "aa" ? "Passes body text (4.5:1)" : level === "large" ? "Passes display type and graphics (3:1) only" : "Fails 3:1"}>
                  {fmt(r)}
                </span>
              )}
            </div>
            <p className="prd-swatch__label">{s.label}</p>
            <p className="prd-swatch__hex">{s.hex.toUpperCase()}{s.on ? ` · type ${s.on.toUpperCase()}` : ""}</p>
            {s.note && <p className="prd-swatch__note">{s.note}</p>}
          </div>
        );
      })}
    </div>
  );
}

// Every text-on-background pair of a palette (the colour system's combinations).
// Rows are the type colour, columns the background; each cell is painted as the
// pair with its computed ratio, and dimmed when it clears nothing. Sticky header and
// first column, horizontal scroll on narrow viewports (the PersonaMatrix pattern).
function ColorMatrix({ m }) {
  const { colors, cells } = m;
  return (
    <div className="prd-cmx-wrap">
      <table className="prd-cmx">
        <thead>
          <tr>
            <th scope="col" className="prd-cmx__corner">type ↓ on background →</th>
            {colors.map((c) => (
              <th scope="col" key={c.hex + c.label}>
                <span className="prd-cmx__chip" style={{ background: c.hex }} aria-hidden="true" />
                <span className="prd-cmx__name">{c.label}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {colors.map((fg, i) => (
            <tr key={fg.hex + fg.label}>
              <th scope="row">
                <span className="prd-cmx__chip" style={{ background: fg.hex }} aria-hidden="true" />
                <span className="prd-cmx__name">{fg.label}</span>
              </th>
              {colors.map((bg, j) => {
                const c = cells[i][j];
                if (!c) return <td className="prd-cmx__self" key={j} />;
                const lv = level(c.r);
                return (
                  <td key={j} className={`prd-cmx__cell is-${lv}`} style={{ background: bg.hex, color: fg.hex }} title={`${fg.label} on ${bg.label}: ${fmt(c.r)}`}>
                    <span className="prd-cmx__aa" aria-hidden="true">Aa</span>
                    <span className="prd-cmx__ratio">{c.r.toFixed(1)}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// The banner matrix (the colour system): treatments as rows, themes as columns,
// each cell a banner painted from its recipe with the three ratios under it:
// H headline on field (display, 3:1), K kicker on field and C CTA label on its fill
// (body, 4.5:1). Every colour and ratio comes from the data; nothing is styled here.
function BannerMatrix({ rows }) {
  const themes = rows[0]?.cells || [];
  const mark = (r, kind) => (
    <span className={`prd-bmx__r is-${passes(r, kind) ? "ok" : "fail"}`}>{r.toFixed(1)}</span>
  );
  return (
    <div className="prd-bmx-wrap">
      <div className="prd-bmx" style={{ gridTemplateColumns: `140px repeat(${themes.length}, minmax(220px, 1fr))` }}>
        <div className="prd-bmx__corner" />
        {themes.map((c) => (
          <div className="prd-bmx__theme" key={c.theme}>
            <span className="prd-cmx__chip" style={{ background: c.field }} aria-hidden="true" />
            <span className="prd-bmx__theme-name">{c.themeLabel}</span>
          </div>
        ))}
        {rows.map((row, i) => (
          <Fragment key={row.key}>
            <div className="prd-bmx__row-head">
              <span className="prd-bmx__num">{String(i + 1).padStart(2, "0")}</span>
              <span className="prd-bmx__row-name">{row.label}</span>
              <span className="prd-bmx__row-blurb">{row.blurb}</span>
            </div>
            {row.cells.map((c) => (
              <div className="prd-bmx__cell" key={c.theme}>
                <div className="prd-bmx__banner" style={{ background: c.field, color: c.type }}>
                  <span className="prd-bmx__kicker" style={{ color: c.kicker }}>{c.copy.kicker}</span>
                  <span className="prd-bmx__headline">{c.copy.headline}</span>
                  <span className="prd-bmx__cta" style={{ background: c.ctaFill, color: c.ctaLabel }}>{c.copy.cta}</span>
                </div>
                <div className="prd-bmx__meta">
                  <span className="prd-cmx__chip" style={{ background: c.field }} aria-hidden="true" />
                  <span className="prd-cmx__chip" style={{ background: c.type }} aria-hidden="true" />
                  <span className="prd-cmx__chip" style={{ background: c.ctaFill }} aria-hidden="true" />
                  <span className="prd-bmx__hex">{c.field} / {c.type}</span>
                  <span className="prd-bmx__ratios">H {mark(c.H, "display")} K {mark(c.K, "body")} C {mark(c.C, "body")}</span>
                </div>
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

// Recursive value renderer → native DOM. string/number → <p>; string[] → <ul>;
// { pre } → copyable code block; { swatches } → colour tiles; { matrix } → every
// pair of a palette; { banners } → the banner matrix; object[] → cards;
// object → label/value blocks.
function Value({ v }) {
  const builders = useContext(BuildersContext);
  if (isEmpty(v)) return null;
  if (typeof v === "string" || typeof v === "number")
    return <p className="prd-p">{String(v)}</p>;
  if (v && typeof v === "object" && !Array.isArray(v) && typeof v.builder === "string") {
    const Builder = builders[v.builder];
    return Builder ? <Builder /> : null;
  }
  if (v && typeof v === "object" && !Array.isArray(v) && typeof v.pre === "string")
    return <Pre text={v.pre} />;
  if (v && typeof v === "object" && !Array.isArray(v) && Array.isArray(v.swatches))
    return <Swatches items={v.swatches} compact={!!v.compact} />;
  if (v && typeof v === "object" && !Array.isArray(v) && v.matrix && Array.isArray(v.matrix.colors))
    return <ColorMatrix m={v.matrix} />;
  if (v && typeof v === "object" && !Array.isArray(v) && Array.isArray(v.banners))
    return <BannerMatrix rows={v.banners} />;
  if (Array.isArray(v)) {
    if (v.every((x) => typeof x === "string" || typeof x === "number"))
      return (
        <ul className="prd-list">
          {v.map((x, i) => <li key={i}>{String(x)}</li>)}
        </ul>
      );
    return (
      <div className="prd-cards">
        {v.map((x, i) => (
          <div className="prd-card" key={i}>
            <Obj o={x} />
          </div>
        ))}
      </div>
    );
  }
  return <Obj o={v} />;
}

// Object → label + value blocks (skips the internal `key`).
function Obj({ o }) {
  return Object.entries(o)
    .filter(([k, val]) => k !== "key" && !isEmpty(val))
    .map(([k, val]) => (
      <div className="prd-field" key={k}>
        <p className="prd-field__label">{labelize(k)}</p>
        <Value v={val} />
      </div>
    ));
}

const PILLAR_FIELDS = [
  ["lockedDecisions", "Locked decisions"],
  ["requirements", "Requirements"],
  ["keySurfaces", "Key surfaces"],
  ["moat", "Moat"],
  ["v1", "V1"],
  ["v2", "V2"],
  ["northStar", "North star"],
  ["metrics", "Metrics"],
  ["openQuestions", "Open questions"],
  ["risks", "Risks"],
  ["sources", "Sources"],
];

// Comparison matrix: dimensions as rows, personas as columns. Sticky first
// column + header for scannability; horizontal scroll on narrow viewports.
function PersonaMatrix({ matrix }) {
  if (!matrix || !matrix.dimensions || !matrix.columns) return null;
  const { dimensions, columns } = matrix;
  return (
    <div className="prd-matrix-wrap" role="region" aria-label="Persona comparison" tabIndex={0}>
      <table className="prd-matrix">
        <thead>
          <tr>
            <th className="prd-matrix__corner" scope="col"></th>
            {columns.map((c) => (
              <th key={c.key} scope="col">
                <span className="prd-matrix__name">{c.name}</span>
                {c.archetype && <span className="prd-matrix__arch">{c.archetype}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dimensions.map((d) => (
            <tr key={d.key}>
              <th className="prd-matrix__dim" scope="row">{d.label}</th>
              {columns.map((c) => (
                <td key={c.key}>{c.cells ? c.cells[d.key] : ""}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Emotion arc: a hairline line across the journey beats (score 1..5), with dots
// marking pain (hollow) vs delight (filled). One ink colour, no decoration.
function emotionArcPath(scores, W, H, pad) {
  const n = scores.length;
  if (n < 2) return { d: "", pts: [] };
  const pts = scores.map((s, i) => ({
    x: pad + (i * (W - 2 * pad)) / (n - 1),
    y: pad + (1 - (Math.max(1, Math.min(5, s)) - 1) / 4) * (H - 2 * pad),
  }));
  // Catmull-Rom -> cubic bezier for a smooth, non-clipping line.
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return { d, pts };
}

function EmotionArc({ beats }) {
  const scores = beats.map((b) => b.emotionScore || 3);
  const W = 640, H = 120, pad = 14;
  const { d, pts } = emotionArcPath(scores, W, H, pad);
  if (!d) return null;
  return (
    <svg className="prd-arc" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <line className="prd-arc__axis" x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} />
      <path className="prd-arc__line" d={d} fill="none" />
      {pts.map((p, i) => {
        const kind = beats[i].painOrDelight;
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={kind === "delight" ? 4.5 : 3.5}
            className={`prd-arc__dot prd-arc__dot--${kind || "neutral"}`}
          />
        );
      })}
    </svg>
  );
}

function JourneyList({ journeys }) {
  return journeys.map((j) => (
    <div className="prd-journey" key={j.key || j.name}>
      <h3 className="prd__h3">
        {j.name}{j.archetype ? ` · ${j.archetype}` : ""}
      </h3>
      {j.arcLabel && <p className="prd-p prd-p--quiet prd-journey__arc">{j.arcLabel}</p>}
      {j.who && <p className="prd-p">{j.who}</p>}
      {Array.isArray(j.beats) && j.beats[0] && j.beats[0].emotionScore != null ? (
        <>
          <EmotionArc beats={j.beats} />
          <ol className="prd-beats">
            {j.beats.map((b, i) => (
              <li className={`prd-beat prd-beat--${b.painOrDelight || "neutral"}`} key={i}>
                <p className="prd-beat__head">
                  <span className="prd-beat__title">{b.beat}</span>
                  {b.feeling && <span className="prd-beat__feel">{b.feeling}</span>}
                </p>
                {b.doing && <p className="prd-beat__doing">{b.doing}</p>}
                {b.thinking && <p className="prd-beat__think">{b.thinking}</p>}
              </li>
            ))}
          </ol>
        </>
      ) : (
        <Value v={j.stages || j.beats} />
      )}
    </div>
  ));
}

function Callout({ callout }) {
  if (!callout) return null;
  return (
    <div className="prd-callout">
      {callout.label && <p className="prd-callout__label">{callout.label}</p>}
      <p className="prd-callout__body">{callout.body || callout}</p>
    </div>
  );
}

function Personas({ personaMatrix, personas }) {
  // Combined comparison table first (when present), then the detailed cards. A PRD
  // with only a matrix (Scheduled) shows just the table; one with both (Away) shows
  // the table as an overview above the deep-dive cards.
  return (
    <>
      {personaMatrix && (
        <>
          <PersonaMatrix matrix={personaMatrix} />
          {personaMatrix.interfaceNote && (
            <div className="prd-field">
              <p className="prd-field__label">Interface map</p>
              <p className="prd-p">{personaMatrix.interfaceNote}</p>
            </div>
          )}
        </>
      )}
      {personas.length > 0 && (
        <div className="prd-cards">
          {personas.map((p) => (
            <div className="prd-card" key={p.key}>
              <h3 className="prd__h3">{p.name}{p.archetype ? ` · ${p.archetype}` : ""}</h3>
              {p.tagline && <p className="prd-p prd-p--quiet">{p.tagline}</p>}
              <Obj o={{ who: p.who, cares: p.cares, tells: p.tells, frustrations: p.frustrations, quote: p.quote, awayLeadsWith: p.awayLeadsWith, dialNote: p.dialNote }} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// Journey matrix: the shared stages as rows, each persona's journey as a column,
// so the same beat reads across every traveller at once — the parallel to
// PersonaMatrix. Each cell is the traveller's moment + Away's line at that stage,
// with an emotion dot (hollow = a low, filled = a high). Derived straight from the
// journeys array, no separate matrix data needed.
function JourneyMatrix({ journeys }) {
  const withStages = journeys.filter((j) => Array.isArray(j.stages) && j.stages.length);
  if (withStages.length < 2) return null;
  const stages = withStages[0].stages.map((s) => s.stage);
  const cols = withStages.map((j, i) => {
    const u = j.user;
    return {
      key: (u && typeof u === "object" ? u.name : u) || j.name || i,
      name: typeof u === "string" ? u : u?.name || j.name || `Journey ${i + 1}`,
      persona: u && typeof u === "object" && u.persona ? u.persona.split(",")[0].trim() : "",
      stages: j.stages,
    };
  });
  const emoClass = (e) => (e == null ? "neutral" : e <= 0 ? "pain" : e >= 2 ? "delight" : "neutral");
  return (
    <div className="prd-matrix-wrap" role="region" aria-label="Journey comparison" tabIndex={0}>
      <table className="prd-matrix prd-matrix--journey">
        <thead>
          <tr>
            <th className="prd-matrix__corner" scope="col"></th>
            {cols.map((c) => (
              <th key={c.key} scope="col">
                <span className="prd-matrix__name">{c.name}</span>
                {c.persona && <span className="prd-matrix__arch">{c.persona}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {stages.map((stage, r) => (
            <tr key={stage}>
              <th className="prd-matrix__dim" scope="row">{stage}</th>
              {cols.map((c) => {
                const b = c.stages[r] && c.stages[r].stage === stage
                  ? c.stages[r]
                  : c.stages.find((s) => s.stage === stage) || {};
                return (
                  <td key={c.key} className={`prd-jm__cell prd-jm__cell--${b.tone || "plain"}`}>
                    {b.moment && <span className="prd-jm__moment">{b.moment}</span>}
                    {b.away && (
                      <span className="prd-jm__away">
                        <span className={`prd-jm__dot prd-jm__dot--${emoClass(b.emotion)}`} aria-hidden />
                        {b.away}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Journeys({ journeys }) {
  if (journeys[0] && (journeys[0].beats || journeys[0].arcLabel))
    return <JourneyList journeys={journeys} />;
  // Away shape ({ user, stages }): show the comparison matrix first, then the
  // per-traveller deep dives — same overview-then-cards pattern as Personas.
  const showMatrix = journeys[0] && journeys[0].user && Array.isArray(journeys[0].stages);
  return (
    <>
      {showMatrix && <JourneyEmbedding journeys={journeys} />}
      {showMatrix && <JourneyMatrix journeys={journeys} />}
      {journeys.map((j, i) => {
        // `user` may be a plain string (Dassh/Scheduled) or a persona object (Away:
        // { name, persona, trip, oneLine }). Rendering an object as a child throws,
        // so derive a string heading.
        const u = j.user;
        const heading = typeof u === "string" ? u : u?.name || j.name || `Journey ${i + 1}`;
        const sub = u && typeof u === "object" ? u : null;
        return (
          <div className="prd-journey" key={i}>
            <h3 className="prd__h3">{heading}{sub?.persona ? ` · ${sub.persona}` : ""}</h3>
            {sub?.trip && <p className="prd-p prd-p--quiet">{sub.trip}</p>}
            {sub?.oneLine && <p className="prd-p">{sub.oneLine}</p>}
            <Value v={j.stages} />
          </div>
        );
      })}
    </>
  );
}

// Section fields rendered either as the default card grid or, when toggled, as a
// two-column label/content table. entries = [[label, value], ...].
function Fields({ entries, view }) {
  const rows = entries.filter(([, v]) => !isEmpty(v));
  if (!rows.length) return null;
  if (view === "table") {
    return (
      <table className="prd-ftable">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <th scope="row">
                {String(label).toLowerCase() === "v1" && <span className="prd-live-dot" aria-label="live" />}
                {labelize(label)}
              </th>
              <td><Value v={value} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  return (
    <div className="prd-grid">
      {rows.map(([label, value]) => (
        <div className="prd-field" key={label}>
          <p className="prd-field__label">
            {String(label).toLowerCase() === "v1" && <span className="prd-live-dot" aria-label="live" />}
            {labelize(label)}
          </p>
          <Value v={value} />
        </div>
      ))}
    </div>
  );
}

// One section shown at a time, picked from a sticky tab strip — ported from the
// interactive PRD so the doc reads one pillar at a time instead of as a single
// 16-section wall. Dense fields lay out in a multi-column grid, or a table (toggle).
export default function PrdRenderer({ data, kick, title, narration, agentCopy, builders = {} }) {
  const { synthesis, pillars = [], personas = [], journeys = [], specs = [], personaMatrix } = data;
  const { oneLiner, wireframe: synthWireframe, ...synthRest } = synthesis || {};
  const hasPersonas = personaMatrix || personas.length > 0;

  const sections = [];
  if (synthesis)
    sections.push({
      key: "synthesis", label: "Synthesis", group: "Overview", eyebrow: "Overview", heading: "Synthesis", fields: true,
      render: () => (
        <>
          {synthWireframe && <div className="prd-wireframe"><Value v={synthWireframe} /></div>}
          <Fields entries={Object.entries(synthRest)} view={view} />
        </>
      ),
    });
  pillars.forEach((p) =>
    sections.push({
      key: p.key, label: shortLabel(p.title), group: "Pillars", eyebrow: "Pillar", heading: p.title, lead: p.oneLiner, fields: true,
      interactive: p.interactive, // opt-in builder key → adds a 3rd "Preview" view
      render: () => (
        <>
          {p.wireframe && <div className="prd-wireframe"><Value v={p.wireframe} /></div>}
          <Fields entries={PILLAR_FIELDS.map(([k, lbl]) => [lbl, p[k]])} view={view} />
        </>
      ),
    })
  );
  if (hasPersonas)
    sections.push({
      key: "personas", label: "Personas", group: "Users", eyebrow: "Users", heading: "Personas",
      lead: personaMatrix?.lead,
      render: () => (
        <>
          {personaMatrix?.wireframe && <div className="prd-wireframe"><Value v={personaMatrix.wireframe} /></div>}
          <Personas personaMatrix={personaMatrix} personas={personas} />
        </>
      ),
    });
  if (journeys.length)
    sections.push({
      key: "journeys", label: "Journeys", group: "Users", eyebrow: "Users", heading: "Journeys",
      render: () => <Journeys journeys={journeys} />,
    });
  specs.forEach((s) => {
    const { id, title: st, summary, callout, eyebrow, group: specGroup, family, wireframe, ...rest } = s;
    const heading = st || labelize(id);
    sections.push({
      key: id, label: shortLabel(heading), group: specGroup || "Systems", family, eyebrow, heading, lead: summary, fields: true,
      render: () => (
        <>
          <Callout callout={callout} />
          {wireframe && <div className="prd-wireframe"><Value v={wireframe} /></div>}
          <Fields entries={Object.entries(rest)} view={view} />
        </>
      ),
    });
  });

  const [active, setActive] = useState(sections[0]?.key);
  const [view, setView] = useState("cards");
  const [mode, setMode] = useState("read");
  // narrow screens: the rail collapses into a "Sections" panel (the old chip
  // wall was 77 tabs on the prompt library). Desktop ignores this flag.
  const [navOpen, setNavOpen] = useState(false);
  // rail groups collapse; the group holding the active section is always open,
  // everything else opens on click (Zepto catalogue alone is 38 entries)
  const [openGroups, setOpenGroups] = useState(() => new Set());
  const showSwitch = narration || agentCopy;
  const listening = narration && mode === "listen";
  const agentMode = agentCopy && mode === "agent";
  const cur = sections.find((s) => s.key === active) || sections[0];
  const pick = (key) => {
    setActive(key);
    setNavOpen(false);
    setView("cards"); // reset the field view so a leftover "interactive" view from
    // one section never leaks into another that has no Preview
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  // consecutive sections sharing a group collapse into one rail block (folio pattern)
  const groups = sections.reduce((acc, s) => {
    const last = acc[acc.length - 1];
    if (last && last.group === s.group) last.items.push(s);
    else acc.push({ group: s.group, family: s.family, items: [s] });
    return acc;
  }, []);

  // A data set whose specs carry a `family` gets a second rail level above the
  // groups (the prompt library: Voice vs Image). Sets without one are unchanged,
  // so every other PRD keeps its single-level rail.
  const families = groups.reduce((acc, g) => {
    const last = acc[acc.length - 1];
    if (last && last.family === g.family) last.blocks.push(g);
    else acc.push({ family: g.family, blocks: [g] });
    return acc;
  }, []);
  const tiered = families.some((f) => f.family);

  const toggleGroup = (k) =>
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });

  const renderGroup = (g, gi) => {
    const k = g.group || `g${gi}`;
    const holdsActive = g.items.some((s) => s.key === active);
    // a group with no name has nothing to click, so it stays open
    const open = !g.group || holdsActive || openGroups.has(k);
    return (
      <li className="article__index-group" key={k}>
        {g.group && (
          <button
            type="button"
            className={`article__index-group-head prd__index-group-btn${open ? " is-open" : ""}${holdsActive ? " is-current" : ""}`}
            aria-expanded={open}
            onClick={() => toggleGroup(k)}
          >
            <span className="prd__index-caret" aria-hidden="true" />
            <span className="prd__index-group-label">{g.group}</span>
            <span className="prd__index-count">{g.items.length}</span>
          </button>
        )}
        {open && (
          <ul className="article__index-group-list">
            {g.items.map((s) => (
              <li key={s.key}>
                <a
                  href={`#prd-${s.key}`}
                  className={s.key === active ? "is-active" : undefined}
                  aria-current={s.key === active ? "true" : undefined}
                  onClick={(e) => { e.preventDefault(); pick(s.key); }}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <BuildersContext.Provider value={{ ...BUILDERS, ...builders }}>
    <article className="prd" data-mode={showSwitch ? mode : undefined}>
      {/* left index rail — reuses the folio's .article__index (fixed rail ≥1100px).
          Hidden in Listen / Agent-copy mode, where that view takes over the body. */}
      {!listening && !agentMode && (
      <nav className={`article__index prd__index${navOpen ? " is-open" : ""}`} aria-label="Sections">
        <button
          type="button"
          className="prd__index-trigger"
          aria-expanded={navOpen}
          onClick={() => setNavOpen((v) => !v)}
        >
          <span className="prd__index-trigger-label">Sections</span>
          <span className="prd__index-trigger-current">{cur?.label}</span>
        </button>
        <ul className="prd__index-list">
          {tiered
            ? families.map((f, fi) => (
                <li className="prd__index-family" key={f.family || fi}>
                  {f.family && <span className="prd__index-family-head">{f.family}</span>}
                  <ul>{f.blocks.map(renderGroup)}</ul>
                </li>
              ))
            : groups.map(renderGroup)}
        </ul>
      </nav>
      )}

      <header className="prd__head">
        <p className="prd__kick">{kick}</p>
        <h1 className="prd__title">{title}</h1>
        {showSwitch && (
          <div className="prd-modeswitch" role="tablist" aria-label="View mode">
            <button type="button" role="tab" aria-selected={mode === "read"} className={mode === "read" ? "is-active" : undefined} onClick={() => setMode("read")}>Read</button>
            {narration && <button type="button" role="tab" aria-selected={mode === "listen"} className={mode === "listen" ? "is-active" : undefined} onClick={() => setMode("listen")}>Listen</button>}
            {agentCopy && <button type="button" role="tab" aria-selected={mode === "agent"} className={mode === "agent" ? "is-active" : undefined} onClick={() => setMode("agent")}>Agent copy</button>}
          </div>
        )}
        {oneLiner && <p className="prd__lead">{oneLiner}</p>}
      </header>

      {agentMode ? (
        agentCopy
      ) : listening ? (
        <NarrationPlayer narration={narration} />
      ) : (
      <>
      {cur && (
        <section className="prd__section" id={`prd-${cur.key}`} role="tabpanel" aria-label={cur.heading}>
          {cur.eyebrow && <p className="prd__eyebrow">{cur.eyebrow}</p>}
          <h2 className="prd__h2">{cur.heading}</h2>
          {cur.lead && <p className="prd__lead">{cur.lead}</p>}
          {(cur.fields || cur.interactive) && (
            <div className="prd-viewtoggle" role="group" aria-label="Field view">
              {cur.fields && <button type="button" aria-pressed={view === "cards"} className={view === "cards" ? "is-active" : undefined} onClick={() => setView("cards")}>Cards</button>}
              {cur.fields && <button type="button" aria-pressed={view === "table"} className={view === "table" ? "is-active" : undefined} onClick={() => setView("table")}>Table</button>}
              {cur.interactive && <button type="button" aria-pressed={view === "interactive"} className={view === "interactive" ? "is-active" : undefined} onClick={() => setView("interactive")}>Preview</button>}
            </div>
          )}
          {cur.interactive && view === "interactive" ? <Value v={{ builder: cur.interactive }} /> : cur.render()}
        </section>
      )}
      </>
      )}
    </article>
    </BuildersContext.Provider>
  );
}
