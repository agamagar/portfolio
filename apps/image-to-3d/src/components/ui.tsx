import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "./Icon";

// --- toasts ----------------------------------------------------------------

interface Toast {
  id: number;
  text: string;
  tone: "info" | "error";
}
const ToastCtx = createContext<(text: string, tone?: Toast["tone"]) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, tone: Toast["tone"] = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === "error" ? 7000 : 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast glass ${t.tone}`}>
            <Icon name={t.tone === "error" ? "x" : "check"} size={16} />
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

// --- theme -----------------------------------------------------------------

type Theme = "system" | "light" | "dark";
function readTheme(): Theme {
  try {
    const t = localStorage.getItem("i3d-theme");
    return t === "light" || t === "dark" ? t : "system";
  } catch {
    return "system";
  }
}
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
    try {
      if (theme === "system") localStorage.removeItem("i3d-theme");
      else localStorage.setItem("i3d-theme", theme);
    } catch {
      /* private mode */
    }
  }, [theme]);
  return [theme, setTheme] as const;
}

export function ThemeToggle() {
  const [theme, setTheme] = useTheme();
  const next: Record<Theme, Theme> = { system: "light", light: "dark", dark: "system" };
  const label = { system: "Theme: system", light: "Theme: light", dark: "Theme: dark" }[theme];
  return (
    <button type="button" className="icon-btn" onClick={() => setTheme(next[theme])} aria-label={`${label}. Switch theme`} title={label}>
      <Icon name={theme === "light" ? "sun" : theme === "dark" ? "moon" : "monitor"} />
    </button>
  );
}

// --- dialog ----------------------------------------------------------------

/** Native <dialog>: focus trapping, Esc and inert background come for free. */
export function Dialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} className="dialog glass" aria-labelledby="dialog-title" onClose={onClose} onCancel={onClose}>
      <h2 id="dialog-title">{title}</h2>
      {children}
    </dialog>
  );
}

// --- misc ------------------------------------------------------------------

export function Spinner({ label }: { label?: string }) {
  return <span className="spinner" role={label ? "status" : undefined} aria-label={label} />;
}

export function ScoreBadge({ score }: { score: number | null | undefined }) {
  if (score === null || score === undefined) return null;
  const tone = score >= 8 ? "good" : score >= 6 ? "ok" : "low";
  return (
    <span className={`score ${tone}`} title="How closely the render matches the source, scored by Claude">
      {score.toFixed(1)}
    </span>
  );
}

export function TagInput({ tags, onChange, label = "Tags" }: { tags: string[]; onChange: (t: string[]) => void; label?: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const t = draft.trim().toLowerCase().slice(0, 24);
    if (t && !tags.includes(t)) onChange([...tags, t].slice(0, 12));
    setDraft("");
  };
  return (
    <div className="field">
      <label className="field-label" htmlFor="tag-input">
        {label}
      </label>
      <div className="tag-input">
        {tags.map((t) => (
          <span key={t} className="chip">
            {t}
            <button type="button" aria-label={`Remove tag ${t}`} onClick={() => onChange(tags.filter((x) => x !== t))}>
              <Icon name="x" size={12} />
            </button>
          </span>
        ))}
        <input
          id="tag-input"
          value={draft}
          placeholder={tags.length ? "" : "Add a tag"}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            } else if (e.key === "Backspace" && !draft && tags.length) onChange(tags.slice(0, -1));
          }}
          onBlur={add}
        />
      </div>
    </div>
  );
}
