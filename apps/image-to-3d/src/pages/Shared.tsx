import { useEffect, useState } from "react";
import { STYLE_LABELS } from "../../shared/spec";
import { Icon } from "../components/Icon";
import { StageView } from "../components/StageView";
import { Dialog, Spinner, ThemeToggle, ToastProvider, useToast } from "../components/ui";
import { api, type SharedModel } from "../lib/api";
import { Link } from "../lib/router";
import type { Stage } from "../three/stage";

const REASONS: [string, string][] = [
  ["sexual", "Sexual content"],
  ["minors", "Involves a child"],
  ["violence", "Violence or weapons"],
  ["hate", "Hate or harassment"],
  ["illegal", "Illegal"],
  ["copyright", "Copyright"],
  ["other", "Something else"],
];

/** The public, read-only page for a model its owner shared. No sign-in, no photos, with a report link. */
export function SharedPage({ token }: { token: string }) {
  return (
    <ToastProvider>
      <Shared token={token} />
    </ToastProvider>
  );
}

function Shared({ token }: { token: string }) {
  const toast = useToast();
  const [data, setData] = useState<SharedModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage | null>(null);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState("other");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "Shared model · Image to 3D";
    api.shared(token).then(setData, (e) => setError(e instanceof Error ? e.message : String(e)));
  }, [token]);

  useEffect(() => {
    if (stage && data?.spec) stage.show(data.spec, { style: data.item.style }).catch((e) => toast(String(e), "error"));
  }, [stage, data, toast]);

  if (error) {
    return (
      <main className="center-screen">
        <div className="glass card narrow" role="alert">
          <h1>This model isn't available</h1>
          <p className="muted">{error}</p>
          <Link className="btn" href="/">
            Make your own
          </Link>
        </div>
      </main>
    );
  }
  if (!data) {
    return (
      <div className="center-block">
        <Spinner label="Loading model" />
      </div>
    );
  }
  const { item } = data;
  return (
    <main className="viewer-layout">
      <section className="stage-wrap" aria-label="3D viewer">
        <div className="stage glass tall">
          <StageView onReady={setStage} autoRotate label={`3D model: ${item.title}. Drag to orbit, scroll to zoom.`} />
        </div>
      </section>
      <aside className="panel glass details" aria-label="Model details">
        <h1 className="panel-title">{item.title}</h1>
        <div className="tag-filter">
          <span className="chip">{STYLE_LABELS[item.style] ?? item.style}</span>
          {item.tags.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>
        <p className="muted small">Made with Image to 3D. Shared by its creator; available until {new Date(item.expiresAt).toLocaleDateString()}.</p>
        <div className="actions stack">
          {item.files.glb && (
            <a className="btn primary" href={item.files.glb} download>
              <Icon name="download" size={16} /> Download GLB
            </a>
          )}
          <Link className="btn" href="/">
            <Icon name="sparkle" size={16} /> Make your own
          </Link>
          <button type="button" className="btn small" onClick={() => setReporting(true)}>
            <Icon name="flag" size={16} /> Report this model
          </button>
        </div>
        <ThemeToggle />
      </aside>

      <Dialog open={reporting} onClose={() => setReporting(false)} title="Report this model">
        <div className="field">
          <label className="field-label" htmlFor="reason">
            What's wrong?
          </label>
          <select id="reason" value={reason} onChange={(e) => setReason(e.target.value)}>
            {REASONS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="details">
            Details <span className="muted">(optional)</span>
          </label>
          <textarea id="details" rows={3} maxLength={500} value={details} onChange={(e) => setDetails(e.target.value)} />
        </div>
        <div className="dialog-actions">
          <button type="button" className="btn" onClick={() => setReporting(false)} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className="btn primary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await api.report(token, reason, details);
                toast("Thanks, we'll review it");
                setReporting(false);
              } catch (e) {
                toast(e instanceof Error ? e.message : String(e), "error");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Sending…" : "Send report"}
          </button>
        </div>
      </Dialog>
    </main>
  );
}
