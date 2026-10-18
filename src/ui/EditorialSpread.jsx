import "./editorialSpread.css";

// Editorial intro spread: a 16:9 panel that scales as one unit (container
// query units), then restacks into a column on tablet and phone.
//
// <EditorialSpread
//   label="Introduction"
//   headline={["Bringing", "Schedule", { text: "Platform", upright: true, dx: 6 }]}
//   headlineRotate={-17}              // degrees for the rotated block (dropped < 720px)
//   lead="…"  image={{ src, alt }}  body={["para", "para"]}
//   mark="Zepto"                      // optional wordmark, bottom-left
//   theme={{ from, to, ink, darkFrom, darkTo, darkInk }} />
//
// headline lines are strings or { text, upright, rotate, dx } (dx in cqw).
// Lines before the first upright/own-rotation line share one rotated block.
export default function EditorialSpread({
  label, headline = [], headlineRotate = -17, lead, image, body = [], mark, theme = {}, className = "", id,
}) {
  const lines = headline.map((l) => (typeof l === "string" ? { text: l } : l));
  const split = lines.findIndex((l) => l.upright || l.rotate != null);
  const block = split < 0 ? lines : lines.slice(0, split);
  const rest = split < 0 ? [] : lines.slice(split);
  const vars = {
    "--es-from-l": theme.from, "--es-to-l": theme.to, "--es-ink-l": theme.ink,
    "--es-from-dark": theme.darkFrom, "--es-to-dark": theme.darkTo, "--es-ink-dark": theme.darkInk,
    "--es-rot": `${headlineRotate}deg`,
  };
  Object.keys(vars).forEach((k) => vars[k] === undefined && delete vars[k]);
  return (
    <section className={"es " + className} style={vars} id={id} aria-label={label}>
      <div className="es__panel">
        {label && <p className="es__label">{label}</p>}
        <h2 className="es__headline">
          <span className="es__block">
            {block.map((l, i) => <span className="es__line" key={i}>{l.text} </span>)}
          </span>
          {rest.map((l, i) => (
            <span
              className="es__line es__line--own" key={i}
              style={{ "--es-line-rot": l.upright ? "0deg" : `${l.rotate ?? headlineRotate}deg`, "--es-dx": `${l.dx ?? 0}cqw` }}
            >{l.text} </span>
          ))}
        </h2>
        {lead && <p className="es__lead">{lead}</p>}
        {image && <img className="es__img" src={image.src} alt={image.alt || ""} loading="lazy" decoding="async" />}
        {body.length > 0 && <div className="es__body">{body.map((p, i) => <p key={i}>{p}</p>)}</div>}
        {mark && <p className="es__mark">{mark}</p>}
      </div>
    </section>
  );
}
