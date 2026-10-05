// Live prompt picker for the Team illustrations system (promptLibrary/image, group
// "Team illustrations"). Five dials drive one composed prompt: team, mode, character
// (character mode only), style and length. Every word comes from teamRecipe.compose()
// in promptLibrary/image/teamViews.js, the same recipe the catalogs are composed from.
import { useState } from "react";
import { teamRecipe, TEAMS, MODES, STYLE_META, SETTINGS, COMPACT_LIMIT, keepColour } from "./promptLibrary/image/teamViews.js";

export default function TeamIllustrationsPromptBuilder() {
  const [team, setTeam] = useState(TEAMS[0].key);
  const [mode, setMode] = useState(MODES[0].key);
  const [character, setCharacter] = useState(0);
  const [style, setStyle] = useState(STYLE_META[0].key);
  const [length, setLength] = useState("full");
  const [setting, setSetting] = useState(SETTINGS[0].key);
  const [inScene, setInScene] = useState(TEAMS.map((x) => x.key));
  const [copied, setCopied] = useState(false);

  const t = TEAMS.find((x) => x.key === team) || TEAMS[0];
  const c = t.characters[character] || t.characters[0];
  const st = SETTINGS.find((x) => x.key === setting) || SETTINGS[0];
  const isScene = mode === "scene";
  const toggleTeam = (k) => setInScene((cur) => (cur.includes(k) ? (cur.length > 1 ? cur.filter((x) => x !== k) : cur) : [...cur, k]));
  const prompt = teamRecipe.compose({ team, mode, character: c.key, setting, teams: inScene, style, length: isScene ? "full" : length });
  const over = length === "compact" && prompt.length > COMPACT_LIMIT;

  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const chips = (label, items, value, set) => (
    <div className="prd-faces__dial">
      <span className="prd-faces__label">{label}</span>
      <div className="prd-amx__styles" role="group" aria-label={label}>
        {items.map((it) => (
          <button
            key={it.key}
            type="button"
            className={"prd-amx__style" + (value === it.key ? " is-on" : "")}
            aria-pressed={value === it.key}
            onClick={() => set(it.key)}
          >
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="prd-builder prd-teamillo">
      {chips("Mode", MODES, mode, setMode)}
      {!isScene && chips("Team", TEAMS, team, (k) => { setTeam(k); setCharacter(0); })}
      {isScene && chips("Setting", SETTINGS, setting, setSetting)}
      {isScene && (
        <div className="prd-faces__dial">
          <span className="prd-faces__label">Teams in the scene</span>
          <div className="prd-amx__styles" role="group" aria-label="Teams in the scene">
            {TEAMS.map((x) => (
              <button
                key={x.key}
                type="button"
                className={"prd-amx__style" + (inScene.includes(x.key) ? " is-on" : "")}
                aria-pressed={inScene.includes(x.key)}
                onClick={() => toggleTeam(x.key)}
              >
                {x.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {mode === "character" &&
        chips(
          "Character",
          t.characters.map((x, i) => ({ key: i, label: x.label })),
          character,
          setCharacter
        )}
      {chips("Style", STYLE_META, style, setStyle)}
      {!isScene && chips(
        "Length",
        [
          { key: "full", label: "Full, what ships" },
          { key: "compact", label: `Compact, under ${COMPACT_LIMIT}` },
        ],
        length,
        setLength
      )}
      <p className="prd-teams__job">
        <strong>{isScene ? `${st.label}, ${inScene.length} of 7 teams, ${inScene.length * 3} people.` : mode === "character" ? `${t.label} · ${c.label}.` : `${t.label}.`}</strong>{" "}
        {isScene ? keepColour(st.stage) : keepColour(mode === "character" ? c.cue : t.object)}. {prompt.length} characters{over && !isScene ? ", over the compact cap" : ""}{isScene ? ", full register only" : ""}.
      </p>
      <div className="prd-pre">
        <button type="button" className="prd-pre__copy" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
        <pre>{prompt}</pre>
      </div>
    </div>
  );
}
