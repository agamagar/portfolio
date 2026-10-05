// Live prompt picker for the Airplane views system (promptLibrary/image, group
// "Airplane views"). An interactive matrix: rows are the eight aircraft, columns the
// six views; picking a cell (or a row / column header) picks both. A Style dial above
// the table swaps the whole look between the thin technical line drawing and the
// photorealistic all-white studio render. The prompt below updates on every change.
//
// Prompts are composed from the shared recipe in promptLibrary/image/airplaneViews.js (the same source the
// build script uses to write the static line catalogs), so the picker, the render style,
// and the written-out blocks can never drift.
import { Fragment, useState } from "react";
import { AIRCRAFT, VIEWS, GROUPS, STYLE_META, CAMPAIGNS, compose, RENDER_TOKENS } from "./promptLibrary/image/airplaneViews.js";

const SEP = " · ";
// rows are grouped by segment (GROUPS); each aircraft resolves its per-view cue by category.
const viewLabel = (v) => v.label.replace(/ view$/, "");

export default function AirplanePromptBuilder() {
  const [craftKey, setCraftKey] = useState(AIRCRAFT[0].key);
  const [viewKey, setViewKey] = useState(VIEWS[0].key);
  const [style, setStyle] = useState(STYLE_META[0].key);
  const [campaignKey, setCampaignKey] = useState(CAMPAIGNS[0].key);
  const [copied, setCopied] = useState(false);

  const craft = AIRCRAFT.find((a) => a.key === craftKey) || AIRCRAFT[0];
  const view = VIEWS.find((v) => v.key === viewKey) || VIEWS[0];
  const campaign = CAMPAIGNS.find((c) => c.key === campaignKey) || CAMPAIGNS[0];
  const styleLabel = STYLE_META.find((s) => s.key === style).label;
  const prompt = compose(style, craft, view, campaignKey);

  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="prd-builder">
      <div className="prd-amx__styles" role="group" aria-label="Style">
        {STYLE_META.map((s) => (
          <button
            key={s.key}
            type="button"
            className={"prd-amx__style" + (style === s.key ? " is-on" : "")}
            aria-pressed={style === s.key}
            onClick={() => setStyle(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {style === "art" && (
        <div className="prd-amx__campaign">
          <label className="prd-amx__campaign-field">
            <span className="prd-amx__campaign-label">Campaign</span>
            <select
              className="prd-builder__select"
              value={campaignKey}
              onChange={(e) => setCampaignKey(e.target.value)}
            >
              {CAMPAIGNS.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </label>
          <p className="prd-amx__campaign-blurb">{campaign.blurb}</p>
        </div>
      )}

      <div className="prd-amx" role="group" aria-label="Pick an aircraft and a view">
        <table className="prd-amx__table">
          <thead>
            <tr>
              <th className="prd-amx__corner" aria-hidden="true" />
              {VIEWS.map((v) => (
                <th key={v.key} scope="col">
                  <button
                    type="button"
                    className={"prd-amx__head" + (viewKey === v.key ? " is-on" : "")}
                    onClick={() => setViewKey(v.key)}
                  >
                    {viewLabel(v)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GROUPS.map((g) => {
              const rows = AIRCRAFT.filter((a) => a.group === g);
              if (!rows.length) return null;
              return (
                <Fragment key={g}>
                  <tr className="prd-amx__grouprow">
                    <th scope="colgroup" colSpan={VIEWS.length + 1} className="prd-amx__group">
                      {g}
                    </th>
                  </tr>
                  {rows.map((a) => (
                    <tr key={a.key}>
                      <th scope="row">
                        <button
                          type="button"
                          className={"prd-amx__head prd-amx__head--row" + (craftKey === a.key ? " is-on" : "")}
                          onClick={() => setCraftKey(a.key)}
                        >
                          {a.key}
                        </button>
                      </th>
                      {VIEWS.map((v) => {
                        const on = craftKey === a.key && viewKey === v.key;
                        return (
                          <td key={v.key}>
                            <button
                              type="button"
                              className={"prd-amx__cell" + (on ? " is-on" : "")}
                              aria-pressed={on}
                              aria-label={`${a.key}, ${viewLabel(v)}`}
                              onClick={() => {
                                setCraftKey(a.key);
                                setViewKey(v.key);
                              }}
                            >
                              <span className="prd-amx__dot" aria-hidden="true" />
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="prd-amx__picked">
        {craft.key}
        {SEP}
        {viewLabel(view)}
        <span className="prd-amx__stylechip">{styleLabel}</span>
        {style === "art" && <span className="prd-amx__stylechip">{campaign.label}</span>}
      </p>

      <div className="prd-pre">
        <button type="button" className="prd-pre__copy" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
        <pre>{prompt}</pre>
      </div>

      {style === "render" && (
        <div className="prd-amx__loop">
          <p className="prd-amx__loop-title">Dial the render in (words-only loop)</p>
          <p className="prd-amx__loop-note">
            The model gets no reference image, so the whole look lives in this text. Generate,
            compare to the look you want, then nudge one token below and regenerate until it locks.
          </p>
          <ul className="prd-amx__loop-list">
            {RENDER_TOKENS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
