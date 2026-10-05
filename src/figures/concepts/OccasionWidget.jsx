import "./occasionWidget.css";

// Surface 2 — the occasion widget, shown as the cross-sell MVP repurposes it: a themeable
// banner (heading + copy, the part that scales across every occasion) over the existing
// shell of image tabs, a product rail, and a see-all. This first pass is #12 "Movie night"
// from the banner-combinations sheet. The occasion (banner text, background token, tabs,
// products) is data-driven so the same shell re-skins for any of the 20. Product imagery is
// placeholder for now (real cutouts to come from Figma). Copy is from the data sheet.

const OCCASION = {
  key: "movie-night",
  reason: "Because you added chips",
  heading: "Movie night, sorted",
  copy: "Something cold and a dip for the chips.",
  tabs: ["Snacks", "Drinks", "Dessert", "Dips"],
  products: [
    { name: "Butter popcorn", price: "₹45" },
    { name: "Coke 750ml", price: "₹40" },
    { name: "Salsa dip", price: "₹85" },
    { name: "Nachos", price: "₹60" },
  ],
};

export default function OccasionWidget() {
  const o = OCCASION;
  return (
    <div className="ow-wrap">
      <div className="ow" data-occasion={o.key}>
        <div className="ow-banner">
          <div className="ow-banner__text">
            <p className="ow-eyebrow">{o.reason}</p>
            <h3 className="ow-heading">{o.heading}</h3>
            <p className="ow-copy">{o.copy}</p>
          </div>
          <span className="ow-banner__glow" aria-hidden="true" />
        </div>

        <div className="ow-tabs">
          {o.tabs.map((t, i) => (
            <div key={t} className={"ow-tab" + (i === 0 ? " is-active" : "")}>
              <span className="ow-tab__img" aria-hidden="true" />
              <span className="ow-tab__label">{t}</span>
            </div>
          ))}
        </div>

        <div className="ow-rail">
          {o.products.map((p) => (
            <div key={p.name} className="ow-card">
              <span className="ow-card__img" aria-hidden="true" />
              <p className="ow-card__name">{p.name}</p>
              <div className="ow-card__foot">
                <span className="ow-card__price">{p.price}</span>
                <span className="ow-card__add">Add</span>
              </div>
            </div>
          ))}
        </div>

        <div className="ow-seeall">See all</div>
      </div>
    </div>
  );
}
