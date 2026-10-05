// Away product analytics as native portfolio DOM (was an embedded iframe on
// /work/away-deep-search). Data pulled from PostHog (awayAnalyticsData.js) and
// organized by pages (screens) and flows (funnels). Same tabbed left-index shell
// as the PRD (folio .article__index), so every number is scannable by Agentation.
import { useState } from "react";
import { awayAnalyticsData } from "./awayAnalyticsData";
import "./prd.css";

const nf = (n) => n.toLocaleString("en-US");

function Kpis({ items }) {
  return (
    <div className="prd-kpis">
      {items.map((k) => (
        <div className="prd-kpi" key={k.label}>
          <p className="prd-kpi__value">
            {k.href ? (
              <a
                className="prd-kpi__verify"
                href={k.href}
                target="_blank"
                rel="noopener noreferrer"
                title="Verify in PostHog"
              >
                {k.value}
              </a>
            ) : (
              k.value
            )}
          </p>
          <p className="prd-kpi__label">{k.label}</p>
          {k.sub && <p className="prd-kpi__sub">{k.sub}</p>}
        </div>
      ))}
    </div>
  );
}

function Bars({ rows }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="prd-bars">
      {rows.map((r) => (
        <div className="prd-bar-row" key={r.name}>
          <span className="prd-bar-row__name" title={r.name}>{r.name}</span>
          <span className="prd-bar-track" aria-hidden="true">
            <span className="prd-bar" style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }} />
          </span>
          <span className="prd-bar-row__val">{r.val}</span>
        </div>
      ))}
    </div>
  );
}

// (the simple per-flow Funnel was replaced by the rich JourneySection below, which
// renders takeaway + KPIs + funnel-with-notes + cohort + insights + caveats,
// the referral-depth treatment for every flow.)

// Referral redemption path: bars normalized to the largest step (not a strict
// funnel), each with a plain-language note beneath it.
function RefFunnel({ steps }) {
  const max = Math.max(...steps.map((s) => s.users), 1);
  return (
    <div className="prd-steps">
      {steps.map((s) => (
        <div className="prd-step" key={s.label}>
          <div className="prd-bar-row">
            <span className="prd-bar-row__name" title={s.label}>{s.label}</span>
            <span className="prd-bar-track" aria-hidden="true">
              <span className="prd-bar" style={{ width: `${Math.max(2, (s.users / max) * 100)}%` }} />
            </span>
            <span className="prd-bar-row__val">
              {nf(s.users)}<span className="prd-bar-row__unit"> users</span>
              {s.events ? <span className="prd-bar-row__unit"> · {nf(s.events)} ev</span> : null}
            </span>
          </div>
          {s.note && <p className="prd-step__note">{s.note}</p>}
        </div>
      ))}
    </div>
  );
}

// label → value + optional note (virality, referred-user quality)
function MetricList({ items }) {
  return (
    <dl className="prd-metrics">
      {items.map((m) => (
        <div className="prd-metric" key={m.label}>
          <dt className="prd-metric__label">{m.label}</dt>
          <dd className="prd-metric__value">
            {m.value}
            {m.note && <span className="prd-metric__note">{m.note}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function InsightList({ items }) {
  return (
    <ul className="prd-list prd-insights">
      {items.map((x, i) => <li key={i}>{x}</li>)}
    </ul>
  );
}

function Caveats({ items }) {
  if (!items || !items.length) return null;
  return (
    <div className="prd-caveats">
      <p className="prd-field__label">Caveats</p>
      <ul className="prd-list">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
    </div>
  );
}

// One journey deep-dive, used for every flow AND for referrals so they share the
// same shape in the index: takeaway callout, KPIs, funnel with notes, whatever
// metric groups exist (cohort / virality / referred-user quality), the insight
// narrative, and caveats.
function JourneySection({ data }) {
  const groups = [
    ["Cohort & quality", data.cohort],
    ["Virality & sharing", data.virality],
    ["Referred-user quality", data.quality],
  ].filter(([, items]) => Array.isArray(items) && items.length > 0);
  return (
    <>
      {data.headline && (
        <div className="prd-callout">
          <p className="prd-callout__label">Takeaway</p>
          <p className="prd-callout__body">{data.headline}</p>
        </div>
      )}
      {data.kpis && data.kpis.length > 0 && <Kpis items={data.kpis} />}
      {data.funnel && data.funnel.length > 0 && (
        <>
          <h3 className="prd__h3 prd-subhead">Funnel</h3>
          <RefFunnel steps={data.funnel} />
        </>
      )}
      {groups.map(([label, items]) => (
        <div key={label}>
          <h3 className="prd__h3 prd-subhead">{label}</h3>
          <MetricList items={items} />
        </div>
      ))}
      {data.insights && data.insights.length > 0 && (
        <>
          <h3 className="prd__h3 prd-subhead">What the data says</h3>
          <InsightList items={data.insights} />
        </>
      )}
      <Caveats items={data.caveats} />
    </>
  );
}

export default function AwayAnalyticsDoc() {
  const { window: win, source, overview, pages, flows, referrals } = awayAnalyticsData;
  const R = referrals;

  const sections = [
    {
      key: "overview", label: "Overview", group: "Summary", eyebrow: "Summary", heading: "Overview",
      render: () => <Kpis items={overview} />,
    },
    {
      key: "pages", label: "Pages", group: "Summary", eyebrow: "By screen", heading: "Pages",
      lead: `${pages.length} screens, by views and unique users.`,
      render: () => (
        <Bars
          rows={pages.map((p) => ({
            name: p.screen,
            value: p.views,
            val: `${nf(p.views)} views · ${nf(p.users)} users`,
          }))}
        />
      ),
    },
    // every flow AND referrals as peer journeys, one consistent shape each
    ...[
      ...flows,
      ...(R ? [{ key: "referrals", name: "Referrals", ...R }] : []),
    ].map((j) => ({
      key: j.key, label: j.name, group: "Flows", eyebrow: "Flow", heading: j.name,
      lead: j.lead,
      render: () => <JourneySection data={j} />,
    })),
  ];

  const [active, setActive] = useState("overview");
  const cur = sections.find((s) => s.key === active) || sections[0];
  const pick = (key) => {
    setActive(key);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  const groups = sections.reduce((acc, s) => {
    const last = acc[acc.length - 1];
    if (last && last.group === s.group) last.items.push(s);
    else acc.push({ group: s.group, items: [s] });
    return acc;
  }, []);

  return (
    <article className="prd">
      <nav className="article__index prd__index" aria-label="Sections">
        <ul>
          {groups.map((g, gi) => (
            <li className="article__index-group" key={gi}>
              <span className="article__index-group-head">{g.group}</span>
              <ul className="article__index-group-list">
                {g.items.map((s) => (
                  <li key={s.key}>
                    <a
                      href={`#an-${s.key}`}
                      className={s.key === active ? "is-active" : undefined}
                      aria-current={s.key === active ? "true" : undefined}
                      onClick={(e) => { e.preventDefault(); pick(s.key); }}
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </nav>

      <header className="prd__head">
        <p className="prd__kick">Product analytics · {source}</p>
        <h1 className="prd__title">Deep search &amp; negotiation</h1>
        <p className="prd__lead">
          Live Away product data from PostHog, divided by pages and flows. {win}.
        </p>
        <p className="prd-basenote" role="note">
          <svg className="prd-basenote__icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
          </svg>
          <span>
            How the base is calculated, and why it looks large: the 5,347 figure is distinct person_id over {win}, which overcounts real users. Only about 1,950 IDs fired Application Installed (matching the under-2,000 download count), about 3,996 opened the app, about 1,466 became identified, and 124 logged in. The rest are anonymous pre-login sessions, reinstalls (PostHog mints a fresh ID per install), and server-side event attribution. Rates labelled "vs base" use the 5,347 denominator, so they read as conservative floors: against the roughly 1,950-install base they are about 2.7x higher (booking 8.4% of tracked IDs is about 23% of installs).
          </span>
        </p>
      </header>

      <div className="prd__tabs" role="tablist" aria-label="Sections">
        {sections.map((s) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={s.key === active}
            className={`prd__tab${s.key === active ? " is-active" : ""}`}
            onClick={() => pick(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <section className="prd__section" id={`an-${cur.key}`} role="tabpanel" aria-label={cur.heading}>
        <p className="prd__eyebrow">{cur.eyebrow}</p>
        <h2 className="prd__h2">{cur.heading}</h2>
        {cur.lead && <p className="prd__lead">{cur.lead}</p>}
        {cur.render()}
      </section>
    </article>
  );
}
