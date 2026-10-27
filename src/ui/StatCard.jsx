import "./statCard.css";

// THE stat card (Agam, 27 Oct, from the impact reference): a line icon and a two-line title, one huge number with a smaller
// unit, and a short caption at the foot. Three tones, all in the site's purple: "brand" (saturated), "tint" (light lavender),
// "deep" (near-black purple). Ink colours are set per tone to pass contrast (see statCard.css).
//   <StatCard tone="brand" icon={<Storefront />} title="..." value="1,144" unit="stores" caption="..." />
export default function StatCard({ tone = "brand", icon, title, value, unit, caption, className = "", ...rest }) {
  return (
    <article className={`stat stat--${tone} ${className}`.trim()} {...rest}>
      <header className="stat__top">
        {icon && <span className="stat__icon" aria-hidden="true">{icon}</span>}
        <h4 className="stat__title">{title}</h4>
      </header>
      <p className="stat__num"><span className="stat__value">{value}</span>{unit && <span className="stat__unit">{unit}</span>}</p>
      <p className="stat__cap">{caption}</p>
    </article>
  );
}
