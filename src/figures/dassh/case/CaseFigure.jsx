// CaseFigure: the frame every Dassh case figure sits in, a <figure> and the page's one caption voice.
// `type` names the figure in the DOM (dspec--<type>). Tokens and resets: ../dasshSpecs.css.
import "../dasshSpecs.css";

export function CaseFigure({ type, caption, children }) {
  return (
    <figure className={`dspec dspec--${type}`}>
      {children}
      {caption ? <figcaption className="dspec__cap">{caption}</figcaption> : null}
    </figure>
  );
}
