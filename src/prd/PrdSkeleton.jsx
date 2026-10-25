import "./prd.css";

// The doc route's loading state (critique 72.2, 25 Oct): the PRD documents are lazy-loaded, and on a phone-class CPU
// the body stayed empty for about a second after the page shell. This holds the doc's own layout (.prd, its kicker,
// title and lead) with quiet placeholder bars until the real document mounts. Shared by every doc route.
export default function PrdSkeleton() {
  return (
    <article className="prd prd--skeleton" aria-busy="true">
      <span className="sr-only">Loading the document</span>
      <header className="prd__head" aria-hidden="true">
        <p className="prd__kick"><span className="prd-skel" style={{ width: "62%" }} /></p>
        <p className="prd__title"><span className="prd-skel prd-skel--title" style={{ width: "78%" }} /></p>
        <p className="prd__lead">
          <span className="prd-skel" style={{ width: "96%" }} />
          <span className="prd-skel" style={{ width: "88%" }} />
          <span className="prd-skel" style={{ width: "54%" }} />
        </p>
      </header>
      <div aria-hidden="true">
        {[92, 97, 84, 90, 61].map((w, i) => <span key={i} className="prd-skel" style={{ width: w + "%" }} />)}
      </div>
    </article>
  );
}
