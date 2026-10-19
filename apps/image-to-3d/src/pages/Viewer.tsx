import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "../App";
import { formatUsd, MODELS, type ModelId } from "../../shared/models";
import { STYLE_LABELS, STYLES, type Spec, type Style } from "../../shared/spec";
import { Icon } from "../components/Icon";
import { Segmented } from "../components/Segmented";
import { StageView } from "../components/StageView";
import { Dialog, ScoreBadge, Spinner, TagInput, useToast } from "../components/ui";
import { api, type LibraryItem } from "../lib/api";
import { Link, navigate } from "../lib/router";
import type { Stage } from "../three/stage";
import { slug } from "./Create";

export function ViewerPage({ id }: { id: string }) {
  const { session } = useSession();
  const toast = useToast();
  const canEdit = session.authenticated;
  const [item, setItem] = useState<LibraryItem | null>(null);
  const [spec, setSpec] = useState<Spec | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [style, setStyle] = useState<Style>("clay");
  const [stage, setStage] = useState<Stage | null>(null);
  const [title, setTitle] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const shownFor = useRef<string>("");

  useEffect(() => {
    let alive = true;
    api
      .item(id)
      .then((r) => {
        if (!alive) return;
        setItem(r.item);
        setSpec(r.spec);
        setStyle(r.item.style);
        setTitle(r.item.title);
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!stage || !spec) return;
    const key = `${id}:${style}`;
    const keepView = shownFor.current.startsWith(`${id}:`);
    shownFor.current = key;
    stage.show(spec, { style, keepView }).catch((e) => toast(String(e), "error"));
  }, [stage, spec, style, id, toast]);

  const patch = useCallback(
    async (p: { title?: string; tags?: string[]; shared?: boolean }) => {
      if (!item) return;
      try {
        const r = await api.patch(item.id, p);
        setItem(r.item);
        toast("Saved");
      } catch (e) {
        toast(e instanceof Error ? e.message : String(e), "error");
      }
    },
    [item, toast],
  );

  const download = async () => {
    if (!stage || !item) return;
    const glb = await stage.exportGlb();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([glb], { type: "model/gltf-binary" }));
    a.download = `${slug(item.title)}-${style}.glb`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  if (error) {
    return (
      <div className="page">
        <div className="glass card narrow" role="alert">
          <h1>Couldn't open this model</h1>
          <p className="muted">{error}</p>
          <Link className="btn" href="/library">
            <Icon name="arrowLeft" size={16} /> Library
          </Link>
        </div>
      </div>
    );
  }
  if (!item) {
    return (
      <div className="center-block">
        <Spinner label="Loading model" />
      </div>
    );
  }

  const shareUrl = item.shareToken ? `${location.origin}/s/${item.shareToken}` : "";

  return (
    <div className="viewer-layout">
      <section className="stage-wrap" aria-label="3D viewer">
        <div className="stage glass tall">
          <StageView onReady={setStage} autoRotate label={`3D model: ${item.title}. Drag to orbit, scroll to zoom, right-drag to pan.`} />
          <div className="stage-toolbar">
            <Link href="/library" className="icon-btn glass" aria-label="Back to the library" title="Library">
              <Icon name="arrowLeft" />
            </Link>
            <button type="button" className="icon-btn glass" aria-label="Reset view" title="Reset view" onClick={() => stage?.resetView()}>
              <Icon name="refresh" />
            </button>
          </div>
          {!spec && <p className="stage-empty">This item has no spec to rebuild from.</p>}
        </div>
      </section>

      <aside className="panel glass details" aria-label="Model details">
        {canEdit ? (
          <div className="field">
            <label className="field-label" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              className="title-input"
              value={title}
              maxLength={80}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => title.trim() && title !== item.title && void patch({ title })}
              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            />
          </div>
        ) : (
          <h1 className="panel-title">{item.title}</h1>
        )}

        {canEdit ? (
          <TagInput tags={item.tags} onChange={(tags) => void patch({ tags })} />
        ) : (
          <div className="tag-filter">
            {item.tags.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
        )}

        <Segmented label="Style" options={STYLES.map((s) => ({ value: s, label: STYLE_LABELS[s] }))} value={style} onChange={setStyle} />

        <dl className="stats">
          <div>
            <dt>Match</dt>
            <dd>{item.score !== null ? <ScoreBadge score={item.score} /> : "—"}</dd>
          </div>
          <div>
            <dt>Triangles</dt>
            <dd className="mono">{item.triangles.toLocaleString()}</dd>
          </div>
          <div>
            <dt>Model</dt>
            <dd>{MODELS[item.model as ModelId]?.label ?? item.model}</dd>
          </div>
          <div>
            <dt>Cost</dt>
            <dd className="mono">{formatUsd(item.costUsd)}</dd>
          </div>
          <div>
            <dt>Passes</dt>
            <dd className="mono">{item.passes}</dd>
          </div>
          <div>
            <dt>Saved</dt>
            <dd>
              <time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString()}</time>
            </dd>
          </div>
        </dl>

        {item.files.source && (
          <div className="source-views">
            {([["source", "Front"], ["left", "Left"], ["right", "Right"]] as const).map(([k, label]) =>
              item.files[k] ? (
                <figure className="source-figure" key={k}>
                  <img src={item.files[k]} alt={`${label} source view for ${item.title}`} />
                  <figcaption className="muted small">{k === "source" && !item.files.left && !item.files.right ? "Source image" : `${label} view`}</figcaption>
                </figure>
              ) : null,
            )}
          </div>
        )}

        <div className="actions stack">
          <button type="button" className="btn primary" onClick={() => void download()} disabled={!stage || !spec}>
            <Icon name="download" size={16} /> Download GLB ({STYLE_LABELS[style]})
          </button>
          {item.files.glb && (
            <a className="btn" href={item.files.glb} download>
              <Icon name="download" size={16} /> Saved GLB{item.sizes.glb ? ` · ${(item.sizes.glb / 1e6).toFixed(2)} MB` : ""}
            </a>
          )}
        </div>

        {canEdit && (
          <div className="field">
            <span className="field-label">Sharing</span>
            {shareUrl ? (
              <>
                <input id="share-url" aria-label="Share link" className="mono code" readOnly value={shareUrl} onFocus={(e) => e.target.select()} />
                <p className="muted small">Anyone with this link can view and download the model (not your photos). Others can report it.</p>
                <div className="actions">
                  <button
                    type="button"
                    className="btn small"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(shareUrl);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1600);
                      } catch {
                        toast("Couldn't copy: select the link and copy it manually", "error");
                      }
                    }}
                  >
                    <Icon name={copied ? "check" : "copy"} size={16} /> {copied ? "Copied" : "Copy link"}
                  </button>
                  <button type="button" className="btn small" onClick={() => void patch({ shared: false })}>
                    Stop sharing
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="muted small">Private. Only you can open this model.</p>
                <button type="button" className="btn small" onClick={() => void patch({ shared: true })}>
                  <Icon name="link" size={16} /> Share by link
                </button>
              </>
            )}
          </div>
        )}

        {item.expiresAt && (
          <p className="muted small">
            Photos are deleted 24 hours after upload; this model is deleted on {new Date(item.expiresAt).toLocaleDateString()}. Download the GLB to keep it.
          </p>
        )}

        {spec && (
          <details className="spec-json">
            <summary>
              <Icon name="code" size={14} /> Spec JSON
            </summary>
            <pre className="mono">{JSON.stringify(spec, null, 2)}</pre>
          </details>
        )}

        {canEdit && (
          <button type="button" className="btn danger" onClick={() => setConfirmDelete(true)}>
            <Icon name="trash" size={16} /> Delete
          </button>
        )}
      </aside>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} title={`Delete “${item.title}”?`}>
        <p className="muted">This removes the model, its GLB, thumbnail, source image and spec. It can't be undone.</p>
        <div className="dialog-actions">
          <button type="button" className="btn" onClick={() => setConfirmDelete(false)} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className="btn danger"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await api.remove(item.id);
                toast("Deleted");
                navigate("/library");
              } catch (e) {
                toast(e instanceof Error ? e.message : String(e), "error");
                setBusy(false);
              }
            }}
          >
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </Dialog>
    </div>
  );
}
