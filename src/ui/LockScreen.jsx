import { Lock, Mail } from "iconoir-react";
import { PROJECT_ROWS } from "../hello3/workMeta";

// The public site's stand-in for every /work/<slug> (src/lib/site.js). It holds no
// case content: only what the homepage card already shows (organisation, year,
// line, card image), so nothing private has to be in this bundle.
const VISUAL = {
  "/work/scheduled-delivery": "/hello3/cards/card-1.png",
  "/work/away-agent": "/hello3/cards/card-2.png",
  "/work/cross-sell": "/hello3/cards/card-3.png",
  "/work/toppr": "/hello3/cards/card-5.png",
};
const EMAIL = "agamagar117@gmail.com";

export default function LockScreen({ slug }) {
  const href = `/work/${slug}`;
  const row = PROJECT_ROWS.find((r) => r.href === href);
  const title = row ? row.line : "This project";
  const subject = encodeURIComponent(`Access request: ${row ? `${row.org}, ${row.line}` : slug}`);
  return (
    <main className="lockscreen">
      <section className="lockscreen__card" aria-labelledby="lockscreen-title">
        {VISUAL[href] && (
          <div className="lockscreen__visual">
            <img src={VISUAL[href]} alt="" width="666" height="432" draggable="false" />
            <span className="lockscreen__badge" aria-hidden><Lock width={18} height={18} strokeWidth={2} /></span>
          </div>
        )}
        <div className="lockscreen__body">
          {row && <p className="lockscreen__eyebrow">{row.org} · {row.year}</p>}
          <h1 className="lockscreen__title" id="lockscreen-title">{title}</h1>
          <p className="lockscreen__line">This work is under NDA, so the full case study isn't public. I share it on request.</p>
          <a className="lockscreen__cta" href={`mailto:${EMAIL}?subject=${subject}`}>
            <Mail width={16} height={16} strokeWidth={2} aria-hidden />
            Request access
          </a>
        </div>
      </section>
    </main>
  );
}
