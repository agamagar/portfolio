import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "../App";
import { EFFORTS, estimateGeneration, formatUsd, MODEL_IDS, MODELS, type Effort, type ModelId } from "../../shared/models";
import { STYLE_LABELS, STYLES, type Style } from "../../shared/spec";
import { Icon } from "../components/Icon";
import { Segmented } from "../components/Segmented";
import { StageView } from "../components/StageView";
import { Dialog, ScoreBadge, Spinner, TagInput, useToast } from "../components/ui";
import { api } from "../lib/api";
import { dataUrlToBlob, prepareImage, type PreparedImage } from "../lib/image";
import { runPipeline, type PipelineState } from "../lib/pipeline";
import { navigate } from "../lib/router";
import type { Stage } from "../three/stage";

const VIEWS = ["front", "left", "right"] as const;
type View = (typeof VIEWS)[number];
type Views = Record<View, PreparedImage | null>;
const VIEW_LABELS: Record<View, string> = { front: "Front", left: "Left", right: "Right" };

function ViewSlot(props: { view: View; image: PreparedImage | null; disabled: boolean; onFile: (f: File | undefined) => void; onRemove: () => void }) {
  const { view, image, disabled } = props;
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const label = VIEW_LABELS[view];
  return (
    <div
      className={`view-slot${over ? " dragging" : ""}${image ? " has-image" : ""}`}
      data-testid={`slot-${view}`}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (!disabled) props.onFile(e.dataTransfer.files[0]);
      }}
    >
      <button type="button" className="view-slot-main" onClick={() => input.current?.click()} disabled={disabled} aria-label={image ? `Replace ${label.toLowerCase()} view` : `Choose ${label.toLowerCase()} view`}>
        {image ? (
          <img src={image.url} alt={`${label} view`} />
        ) : (
          <span className="view-slot-empty">
            <Icon name="image" size={22} />
            <span>Drop or choose</span>
          </span>
        )}
      </button>
      <div className="view-slot-foot">
        <span className="view-slot-name">
          {label}
          <span className="muted">{view === "front" ? "required" : "optional"}</span>
        </span>
        {image && (
          <button type="button" className="icon-btn" onClick={props.onRemove} disabled={disabled} aria-label={`Remove ${label.toLowerCase()} view`} title="Remove">
            <Icon name="x" size={14} />
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-label={`${label} view file`}
        data-testid={view === "front" ? "file-input" : `file-input-${view}`}
        onChange={(e) => {
          props.onFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}

const EFFORT_LABELS: Record<Effort, string> = { low: "Low", medium: "Medium", high: "High" };

export function CreatePage() {
  const { session, refresh } = useSession();
  const toast = useToast();
  const stageRef = useRef<Stage | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [views, setViews] = useState<Views>({ front: null, left: null, right: null });
  const [imageError, setImageError] = useState<string | null>(null);
  const image = views.front;
  const viewList = VIEWS.map((v) => views[v]).filter((x): x is PreparedImage => !!x);
  const [notes, setNotes] = useState("");
  const [style, setStyle] = useState<Style>("clay");
  const [model, setModel] = useState<ModelId>("claude-opus-5-5");
  const [effort, setEffort] = useState<Effort>("medium");
  const [passes, setPasses] = useState(Math.min(2, session.maxRefinePasses));
  const [run, setRun] = useState<PipelineState | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);

  const running = !!run?.running;
  const shown = run?.versions[run.shownIndex] ?? null;

  useEffect(() => () => abortRef.current?.abort(), []);
  const viewsRef = useRef(views);
  viewsRef.current = views;
  useEffect(() => () => VIEWS.forEach((v) => viewsRef.current[v] && URL.revokeObjectURL(viewsRef.current[v]!.url)), []);

  const estimate = useMemo(
    () => (image ? estimateGeneration({ model, passes, imageWidth: image.width, imageHeight: image.height, views: viewList.length }) : null),
    [image, viewList.length, model, passes],
  );

  const takeFile = useCallback(async (view: View, file: File | undefined) => {
    if (!file) return;
    setImageError(null);
    try {
      const next = await prepareImage(file);
      setViews((cur) => {
        if (cur[view]) URL.revokeObjectURL(cur[view]!.url);
        return { ...cur, [view]: next };
      });
    } catch (err) {
      setImageError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  // paste an image from the clipboard anywhere on the page
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = [...(e.clipboardData?.files ?? [])].find((f) => f.type.startsWith("image/"));
      if (!file || running) return;
      const view = VIEWS.find((v) => !viewsRef.current[v]) ?? "front";
      void takeFile(view, file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [takeFile, running]);

  const removeView = (view: View) =>
    setViews((cur) => {
      if (cur[view]) URL.revokeObjectURL(cur[view]!.url);
      return { ...cur, [view]: null };
    });

  const start = async () => {
    const stage = stageRef.current;
    if (!image || !stage || running) return;
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const final = await runPipeline(
      { stage, images: { front: image.payload, left: views.left?.payload, right: views.right?.payload }, style, model, effort, notes, passes, signal: ctrl.signal },
      (s) => setRun(s),
    );
    void refresh();
    if (final.error) toast(final.error, "error");
    else if (final.versions.length) toast(`Done. Kept version ${final.bestIndex + 1}.`);
  };

  const showVersion = async (i: number) => {
    if (!run || !stageRef.current) return;
    await stageRef.current.show(run.versions[i].spec, { style });
    setRun({ ...run, shownIndex: i });
  };

  const changeStyle = async (s: Style) => {
    setStyle(s);
    if (shown && stageRef.current && !running) await stageRef.current.show(shown.spec, { style: s, keepView: true });
  };

  const downloadGlb = async () => {
    if (!stageRef.current || !shown) return;
    try {
      const glb = await stageRef.current.exportGlb();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([glb], { type: "model/gltf-binary" }));
      a.download = `${slug(shown.spec.title)}-${style}.glb`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } catch (err) {
      toast(err instanceof Error ? err.message : String(err), "error");
    }
  };

  const ready = session.apiConfigured && session.storage;

  return (
    <div className="create-layout">
      <section className="panel glass controls" aria-labelledby="create-heading">
        <h1 id="create-heading" className="panel-title">
          New model
        </h1>

        <div className="field">
          <span className="field-label" id="views-label">
            Reference views <span className="muted">(front required, sides help depth)</span>
          </span>
          <div className="view-slots" role="group" aria-labelledby="views-label">
            {VIEWS.map((v) => (
              <ViewSlot
                key={v}
                view={v}
                image={views[v]}
                disabled={running}
                onFile={(f) => void takeFile(v, f)}
                onRemove={() => removeView(v)}
              />
            ))}
          </div>
        </div>
        {imageError && (
          <p className="error-text" role="alert">
            {imageError}
          </p>
        )}

        <div className="field">
          <label className="field-label" htmlFor="notes">
            What is it? <span className="muted">(optional)</span>
          </label>
          <textarea
            id="notes"
            rows={2}
            maxLength={500}
            placeholder="e.g. a ceramic mug with a fox handle"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={running}
          />
        </div>

        <Segmented label="Style" options={STYLES.map((s) => ({ value: s, label: STYLE_LABELS[s] }))} value={style} onChange={changeStyle} disabled={running} />

        <div className="field">
          <span className="field-label" id="model-label">
            Model
          </span>
          <div className="model-cards" role="radiogroup" aria-labelledby="model-label">
            {MODEL_IDS.map((id) => (
              <label key={id} className={`model-card${model === id ? " on" : ""}`}>
                <input type="radio" name="model" value={id} checked={model === id} onChange={() => setModel(id)} disabled={running} />
                <span className="model-name">{MODELS[id].label}</span>
                <span className="model-blurb">{MODELS[id].blurb}</span>
                <span className="model-price mono">
                  ${MODELS[id].input}/${MODELS[id].output}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="row-2">
          <Segmented label="Effort" options={EFFORTS.map((e) => ({ value: e, label: EFFORT_LABELS[e] }))} value={effort} onChange={setEffort} disabled={running} />
          <div className="field">
            <label className="field-label" htmlFor="passes">
              Refine passes
            </label>
            <div className="stepper">
              <button type="button" aria-label="Fewer passes" onClick={() => setPasses((p) => Math.max(0, p - 1))} disabled={running || passes <= 0}>
                −
              </button>
              <output id="passes" aria-live="polite" className="mono">
                {passes}
              </output>
              <button
                type="button"
                aria-label="More passes"
                onClick={() => setPasses((p) => Math.min(session.maxRefinePasses, p + 1))}
                disabled={running || passes >= session.maxRefinePasses}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="estimate" aria-live="polite">
          <span className="muted">Estimated cost</span>
          <span className="mono">{estimate ? `${formatUsd(estimate.low)} – ${formatUsd(estimate.high)}` : "—"}</span>
        </div>

        {!ready && (
          <p className="notice" role="note">
            {!session.apiConfigured ? "ANTHROPIC_API_KEY isn't set on the server." : "No storage is configured: connect a Vercel Blob store."}
          </p>
        )}

        {running ? (
          <button type="button" className="btn block" onClick={() => abortRef.current?.abort()}>
            <Icon name="stop" size={16} /> Cancel
          </button>
        ) : (
          <button type="button" className="btn primary block" onClick={start} disabled={!image || !ready}>
            <Icon name="sparkle" size={16} /> {run?.versions.length ? "Generate again" : "Generate 3D model"}
          </button>
        )}
      </section>

      <section className="stage-wrap" aria-label="3D preview">
        <div className="stage glass">
          <StageView onReady={(s) => (stageRef.current = s)} label={shown ? `3D model: ${shown.spec.title}. Drag to orbit, scroll to zoom.` : "3D preview, empty"} />
          {!run && (
            <div className="stage-empty" aria-hidden="true">
              <Icon name="cube" size={40} />
              <p>Your model appears here</p>
            </div>
          )}
          {image && run && (
            <figure className="source-inset glass">
              <img src={image.url} alt="" />
              <figcaption>Source</figcaption>
            </figure>
          )}
          {shown && (
            <div className="stage-toolbar">
              <button type="button" className="icon-btn glass" aria-label="Reset view" title="Reset view" onClick={() => stageRef.current?.resetView()}>
                <Icon name="refresh" />
              </button>
            </div>
          )}
        </div>

        {run && (
          <div className="below">
            <Progress run={run} />
            {run.versions.length > 0 && (
          <div className="versions glass" role="group" aria-label="Versions">
            <div className="versions-list">
              {run.versions.map((v, i) => (
                <button
                  key={v.n}
                  type="button"
                  className={`version${i === run.shownIndex ? " on" : ""}`}
                  aria-pressed={i === run.shownIndex}
                  onClick={() => void showVersion(i)}
                  disabled={running}
                >
                  <img src={v.preview} alt="" />
                  <span className="version-meta">
                    v{v.n}
                    {i === run.bestIndex && !running && <span className="best">best</span>}
                    <ScoreBadge score={v.score} />
                  </span>
                </button>
              ))}
            </div>
            <div className="versions-side">
              <div className="cost mono" title="Actual Claude API cost of this generation">
                {formatUsd(run.costUsd)}
              </div>
              <div className="actions">
                <button type="button" className="btn" onClick={downloadGlb} disabled={running || !shown}>
                  <Icon name="download" size={16} /> GLB
                </button>
                <button type="button" className="btn primary" onClick={() => setSaveOpen(true)} disabled={running || !shown}>
                  Save to library
                </button>
              </div>
            </div>
          </div>
            )}
          </div>
        )}
        {shown && (shown.critique || shown.changes.length > 0 || shown.warnings.length > 0) && !running && (
          <details className="notes glass">
            <summary>Notes on version {shown.n}</summary>
            {shown.critique && (
              <p>
                <strong>Critique:</strong> {shown.critique}
              </p>
            )}
            {shown.changes.length > 0 && (
              <>
                <strong>Changes from the previous version</strong>
                <ul>
                  {shown.changes.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </>
            )}
            {shown.warnings.length > 0 && (
              <>
                <strong>Builder warnings</strong>
                <ul>
                  {shown.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </>
            )}
          </details>
        )}
      </section>

      {shown && image && run && (
        <SaveDialog
          open={saveOpen}
          onClose={() => setSaveOpen(false)}
          defaults={{ title: shown.spec.title, tags: shown.spec.tags }}
          onSave={async ({ title, tags }) => {
            const stage = stageRef.current!;
            const id = crypto.randomUUID();
            const glb = await stage.exportGlb();
            if (glb.byteLength > 4_200_000) throw new Error(`The GLB is ${(glb.byteLength / 1e6).toFixed(1)} MB; the upload limit is 4.2 MB. Try Low-poly.`);
            const thumb = dataUrlToBlob(stage.snapshot(512, "image/png", false));
            await Promise.all([
              api.upload(id, "source", image.blob),
              ...(["left", "right"] as const).flatMap((v) => (views[v] ? [api.upload(id, v, views[v]!.blob)] : [])),
              api.upload(id, "model", new Blob([glb], { type: "model/gltf-binary" })),
              api.upload(id, "thumb", thumb),
            ]);
            await api.save({
              id,
              title,
              tags,
              style,
              model: run.model,
              spec: { ...shown.spec, style },
              score: shown.score,
              passes: run.versions.length - 1,
              costUsd: run.costUsd,
              triangles: shown.triangles,
            });
            toast("Saved to the library");
            navigate(`/m/${id}`);
          }}
        />
      )}
    </div>
  );
}

function Progress({ run }: { run: PipelineState }) {
  const active = run.steps.find((s) => s.status === "active");
  return (
    <div className="progress glass">
      <ol className="steps" aria-label="Progress">
        {run.steps.map((s) => (
          <li key={s.id} className={`step ${s.status}`} aria-current={s.status === "active" ? "step" : undefined}>
            <span className="step-dot" aria-hidden="true">
              {s.status === "active" ? <Spinner /> : s.status === "done" ? <Icon name="check" size={12} /> : s.status === "error" ? <Icon name="x" size={12} /> : null}
            </span>
            <span className="step-label">{s.label}</span>
            {s.detail && <span className="step-detail">{s.detail}</span>}
            <span className="sr-only">({s.status})</span>
          </li>
        ))}
      </ol>
      <div className="live" aria-live="polite" aria-atomic="false">
        {active && <span className="sr-only">{active.label}</span>}
        {run.running && run.thinking && (
          <p className="thinking">
            <span className="thinking-label">Claude is thinking</span>
            {run.thinking.slice(-280)}
          </p>
        )}
        {run.running && run.outputChars > 0 && <p className="muted mono small">Writing spec… {(run.outputChars / 1000).toFixed(1)}k chars</p>}
        {run.error && (
          <p className="error-text" role="alert">
            {run.error}
          </p>
        )}
      </div>
    </div>
  );
}

function SaveDialog({
  open,
  onClose,
  defaults,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  defaults: { title: string; tags: string[] };
  onSave: (v: { title: string; tags: string[] }) => Promise<void>;
}) {
  const [title, setTitle] = useState(defaults.title);
  const [tags, setTags] = useState(defaults.tags);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open) {
      setTitle(defaults.title);
      setTags(defaults.tags);
      setError(null);
    }
  }, [open, defaults.title, defaults.tags]);
  return (
    <Dialog open={open} onClose={onClose} title="Save to library">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            await onSave({ title, tags });
            onClose();
          } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="field">
          <label className="field-label" htmlFor="save-title">
            Title
          </label>
          <input id="save-title" value={title} maxLength={80} required onChange={(e) => setTitle(e.target.value)} />
        </div>
        <TagInput tags={tags} onChange={setTags} />
        <p className="muted small">Saves the spec, a GLB export, a thumbnail and the source views.</p>
        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <button type="button" className="btn" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn primary" disabled={busy || !title.trim()}>
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

export function slug(s: string) {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "model"
  );
}
