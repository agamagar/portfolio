import { useState } from "react";
import "./bannerLab.css";

// Banner exploration for the occasion widget (Surface 2). Same widget approach; here we ideate
// only the banner, across many COMPOSITIONS organised into tabs by family (type / image /
// product / object / minimal). Same Movie-night copy from the data sheet across all. Product and
// motif art is placeholder (real cutouts from Figma later). Each still re-skins per occasion via
// a background token; the widget shell (tabs, product rail, see-all) is unchanged.

const M = {
  eyebrow: "Because you added chips",
  heading: "Movie night, sorted",
  copy: "Something cold and a dip for the chips.",
};

const FAMILIES = [
  { key: "type", label: "Type", items: [
    { k: "type-big", label: "Oversized" },
    { k: "type-caps", label: "Stacked caps" },
    { k: "type-mark", label: "Highlighted word" },
  ] },
  { key: "image", label: "Image", items: [
    { k: "img-scrim", label: "Text on image" },
    { k: "img-spot", label: "Spotlight" },
    { k: "img-duotone", label: "Duotone wash" },
  ] },
  { key: "product", label: "Product", items: [
    { k: "prod-right", label: "Hero, right bleed" },
    { k: "prod-scatter", label: "Product scatter" },
  ] },
  { key: "object", label: "Object", items: [
    { k: "obj-ticket", label: "Ticket stub" },
    { k: "obj-marquee", label: "Marquee sign" },
  ] },
  { key: "minimal", label: "Minimal", items: [
    { k: "min-light", label: "Light" },
    { k: "min-dark", label: "Dark, precise" },
  ] },
];

function PlayIcon({ cls }) {
  return (
    <svg className={cls} viewBox="0 0 48 48" width="38" height="38" fill="none" aria-hidden="true">
      <rect x="4" y="10" width="40" height="28" rx="7" stroke="currentColor" strokeWidth="2" opacity="0.85" />
      <path d="M20 20l9 5-9 5z" fill="currentColor" />
    </svg>
  );
}

function TextBlock() {
  return (
    <div className="bl-text">
      <p className="bl-eyebrow">{M.eyebrow}</p>
      <h4 className="bl-heading">{M.heading}</h4>
      <p className="bl-copy">{M.copy}</p>
    </div>
  );
}

function Inner({ k }) {
  switch (k) {
    case "type-big":
      return <h4 className="bl-heading bl-heading--big">Movie night,<br /><span className="bl-accent">sorted.</span></h4>;
    case "type-caps":
      return <div className="bl-caps"><span className="bl-caps__line">MOVIE</span><span className="bl-caps__line">NIGHT</span><p className="bl-copy">{M.copy}</p></div>;
    case "type-mark":
      return <div className="bl-text"><h4 className="bl-heading">Movie <span className="bl-mark">night</span>, sorted</h4><p className="bl-copy">{M.copy}</p></div>;
    case "img-scrim":
      return <><span className="bl-scrim" aria-hidden="true" /><TextBlock /></>;
    case "img-spot":
      return <><span className="bl-beam" aria-hidden="true" /><TextBlock /></>;
    case "img-duotone":
      return <TextBlock />;
    case "prod-right":
      return <><TextBlock /><div className="bl-prod" aria-hidden="true"><span>Popcorn<br />+ Coke</span></div></>;
    case "prod-scatter":
      return <><div className="bl-scatter" aria-hidden="true"><span /><span /><span /><span /></div><div className="bl-text"><h4 className="bl-heading">{M.heading}</h4><p className="bl-copy">{M.copy}</p></div></>;
    case "obj-ticket":
      return <><div className="bl-ticket-main"><p className="bl-eyebrow">{M.eyebrow}</p><h4 className="bl-heading">{M.heading}</h4><p className="bl-copy">{M.copy}</p></div><div className="bl-ticket-stub" aria-hidden="true"><PlayIcon cls="bl-stub-icon" /><span className="bl-stub-text">TONIGHT</span></div></>;
    case "obj-marquee":
      return <><span className="bl-bulbs bl-bulbs--top" aria-hidden="true" /><div className="bl-text bl-text--center"><h4 className="bl-heading">{M.heading}</h4><p className="bl-copy">{M.copy}</p></div><span className="bl-bulbs bl-bulbs--bot" aria-hidden="true" /></>;
    case "min-dark":
      return <div className="bl-text"><span className="bl-rule" aria-hidden="true" /><h4 className="bl-heading">{M.heading}</h4><p className="bl-copy">{M.copy}</p></div>;
    case "min-light":
    default:
      return <TextBlock />;
  }
}

export default function BannerLab() {
  const [tab, setTab] = useState("type");
  const fam = FAMILIES.find((f) => f.key === tab) || FAMILIES[0];
  return (
    <div className="bl-root">
      <div className="bl-tabs" role="tablist">
        {FAMILIES.map((f) => (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={f.key === tab}
            className={"bl-tab" + (f.key === tab ? " is-active" : "")}
            onClick={() => setTab(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="bl-wrap">
        {fam.items.map((it) => (
          <div key={it.k} className="bl-item">
            <span className="bl-label">{it.label}</span>
            <div className={"bl-banner bl-banner--" + it.k}><Inner k={it.k} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
