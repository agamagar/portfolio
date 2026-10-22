// THE source list for a case section: a quiet "Sources" line of outbound links under the prose.
// A section sets `sources: [{ t: "Fullstory travel survey, May 2026", href: "https://..." }]`.
import "./sourceList.css";

export default function SourceList({ items }) {
  if (!items?.length) return null;
  return (
    <p className="srcs">
      <span className="srcs__label">Sources</span>
      {items.map((s) => (
        <a key={s.href} className="srcs__a" href={s.href} target="_blank" rel="noopener noreferrer">{s.t}</a>
      ))}
    </p>
  );
}
