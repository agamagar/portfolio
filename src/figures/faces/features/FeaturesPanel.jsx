// The face system's panel (/face-lab): one control per feature param, generated from the modules' own
// param specs (features/modules/*.js), so a new module or param shows up here with no change to this file.
import { MODULES, PRESETS, complete } from "./core";
import { styleDefaults } from "./modules/hair";

const clean = (cfg) => Object.fromEntries(Object.entries(cfg).filter(([k]) => !k.startsWith("_")).map(([k, v]) => [k, Object.fromEntries(Object.entries(v).filter(([, x]) => x !== null && x !== undefined))]));

export default function FeaturesPanel({ face, onChange, onCopied }) {
  const cfg = face || {};
  const full = complete(cfg);
  const get = (m, k, spec) => {
    const v = cfg[m.id]?.[k];
    if (v !== undefined && v !== null) return v;
    if (spec.fromStyle) return styleDefaults(full[m.id].style)[k];
    return spec.default;
  };
  const set = (m, k, v, spec) => {
    const block = { ...(cfg[m.id] || {}), [k]: v };
    for (const r of spec.resets || []) delete block[r];
    onChange({ ...cfg, [m.id]: block });
  };
  const json = () => JSON.stringify(clean(cfg), null, 2);
  const copy = async () => { try { await navigator.clipboard.writeText(json()); onCopied?.("Copied face JSON"); } catch { onCopied?.("Copy failed"); } };
  return (
    <details open className="fl-features">
      <summary>Features (face system)</summary>
      <div className="fl-row">
        <select value="" onChange={(e) => e.target.value && onChange(JSON.parse(JSON.stringify(PRESETS[e.target.value])))} aria-label="Load face preset">
          <option value="">Load face preset…</option>{Object.keys(PRESETS).map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <button onClick={copy}>Copy face JSON</button>
        <button onClick={() => onChange({})}>Neutral</button>
      </div>
      {MODULES.map((m) => (
        <details key={m.id} className="fl-feat" open={["hair", "eyes", "mouth"].includes(m.id)}>
          <summary>{m.label}</summary>
          {Object.entries(m.params).map(([k, spec]) => {
            const v = get(m, k, spec);
            if (spec.showWhen && !Object.entries(spec.showWhen).every(([dep, vals]) => vals.includes(get(m, dep, m.params[dep])))) return null;
            if (spec.type === "select") return (
              <label className="fl-sl" key={k}><span>{spec.label}</span>
                <select value={v} onChange={(e) => set(m, k, e.target.value, spec)}>{spec.options.map(([o, l]) => <option key={o} value={o}>{l}</option>)}</select><output /></label>);
            if (spec.type === "color") return (
              <label className="fl-sl" key={k}><span>{spec.label}</span>
                <input type="color" value={v} onChange={(e) => set(m, k, e.target.value, spec)} /><output>{v}</output></label>);
            if (spec.type === "bool") return (
              <label className="fl-sl" key={k}><span>{spec.label}</span>
                <input type="checkbox" checked={!!v} onChange={(e) => set(m, k, e.target.checked, spec)} /><output /></label>);
            return (
              <label className="fl-sl" key={k}><span>{spec.label}</span>
                <input type="range" min={spec.min} max={spec.max} step={spec.step} value={v} onChange={(e) => set(m, k, +e.target.value, spec)} /><output>{(+v).toFixed(2)}</output></label>);
          })}
        </details>
      ))}
    </details>
  );
}
