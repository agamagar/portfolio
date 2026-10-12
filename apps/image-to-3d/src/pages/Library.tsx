import { useEffect, useMemo, useState } from "react";
import { STYLE_LABELS } from "../../shared/spec";
import { Icon } from "../components/Icon";
import { ScoreBadge, Spinner } from "../components/ui";
import { api, type LibraryItem } from "../lib/api";
import { Link } from "../lib/router";

export function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  useEffect(() => {
    api
      .library()
      .then((r) => setItems(r.items))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const i of items ?? []) for (const t of i.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([t]) => t);
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items ?? []).filter(
      (i) =>
        activeTags.every((t) => i.tags.includes(t)) &&
        (!q || i.title.toLowerCase().includes(q) || i.tags.some((t) => t.includes(q)) || i.subjectKind.includes(q) || i.style.includes(q)),
    );
  }, [items, query, activeTags]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Library</h1>
          <p className="muted">{items ? `${items.length} model${items.length === 1 ? "" : "s"}` : " "}</p>
        </div>
        <div className="search glass">
          <Icon name="search" size={16} />
          <label htmlFor="search" className="sr-only">
            Search models
          </label>
          <input id="search" type="search" placeholder="Search titles and tags" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="tag-filter" role="group" aria-label="Filter by tag">
          {allTags.slice(0, 24).map((t) => {
            const on = activeTags.includes(t);
            return (
              <button
                key={t}
                type="button"
                className={`chip toggle${on ? " on" : ""}`}
                aria-pressed={on}
                onClick={() => setActiveTags((a) => (on ? a.filter((x) => x !== t) : [...a, t]))}
              >
                {t}
              </button>
            );
          })}
          {activeTags.length > 0 && (
            <button type="button" className="chip clear" onClick={() => setActiveTags([])}>
              Clear
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
      {!items && !error && (
        <div className="center-block">
          <Spinner label="Loading the library" />
        </div>
      )}
      {items && items.length === 0 && (
        <div className="empty glass">
          <Icon name="cube" size={32} />
          <h2>No models yet</h2>
          <p className="muted">Generate one from an image and save it here.</p>
          <Link href="/" className="btn primary">
            <Icon name="sparkle" size={16} /> Create a model
          </Link>
        </div>
      )}
      {items && items.length > 0 && filtered.length === 0 && <p className="muted">No models match.</p>}

      <ul className="grid" aria-label="Models">
        {filtered.map((i) => (
          <li key={i.id}>
            <Link href={`/m/${i.id}`} className="card-link glass">
              <div className="thumb">{i.files.thumb ? <img src={i.files.thumb} alt="" loading="lazy" /> : <Icon name="cube" size={32} />}</div>
              <div className="card-body">
                <div className="card-title">
                  <span>{i.title}</span>
                  <ScoreBadge score={i.score} />
                </div>
                <div className="card-meta">
                  <span className="chip small">{STYLE_LABELS[i.style] ?? i.style}</span>
                  <time dateTime={i.createdAt}>{new Date(i.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</time>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
