// Live prompt picker for the Schedule images system (promptLibrary/image, group
// "Schedule images", spec pl-schedule-images-system). Scene, angle, colorway,
// reference and register drive one assembled prompt.
//
// Every word it emits comes from scheduleImagesRecipe.compose() in
// promptLibrary/image/scheduleImagesViews.js, the same recipe the written-out
// scene catalog below it is composed from, so the picker and the catalog cannot drift.
import { useEffect, useState } from "react";
import {
  scheduleImagesRecipe,
  LOOKS,
  PERSONAS,
  DAYLIGHTS,
  allowedDaylights,
  PHONES,
  SCENES,
  ANGLES,
  PEOPLE,
  OBJECT_SCENES,
  OBJECTS,
  OBJECT_GROUPS,
  COLORWAYS,
  REFERENCES,
  COMPACT_LIMIT,
  MAX_OBJECTS,
  allowedAngles,
  allowedPeople,
} from "./promptLibrary/image/scheduleImagesViews.js";

const SEP = " · ";

export default function ScheduleImagesPromptBuilder() {
  const [look, setLook] = useState(LOOKS[0].key);
  const [phone, setPhone] = useState(PHONES[0].key);
  const [persona, setPersona] = useState(PERSONAS[0].key);
  const [daylight, setDaylight] = useState(DAYLIGHTS[0].key);
  const [scene, setScene] = useState(SCENES[0].key);
  const [angle, setAngle] = useState(ANGLES[0].key);
  const [people, setPeople] = useState(PEOPLE[0].key);
  const [objectScene, setObjectScene] = useState(OBJECT_SCENES[0].key);
  const crateMode = people === "none";
  const [objects, setObjects] = useState([]);
  const toggleObject = (key) =>
    setObjects((cur) =>
      cur.includes(key) ? cur.filter((k) => k !== key) : cur.length >= MAX_OBJECTS ? cur : [...cur, key]
    );

  // Smart build logic: the selectors are dynamic. Only options that make visual
  // sense for the current scene and people are offered; a pick that stops
  // fitting after a change falls back (angle to the scene's own camera, people
  // to one person); Objects only with nothing picked auto-fills Breakfast so
  // the staging is never of unnamed goods.
  const okPeople = allowedPeople({ scene });
  const okAngles = allowedAngles({ scene, objectScene, people });
  useEffect(() => {
    if (!okPeople.includes(people)) setPeople("one");
  }, [scene]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!okAngles.includes(angle)) setAngle("own");
  }, [scene, objectScene, people]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (crateMode && objects.length === 0) setObjects([...OBJECT_GROUPS[0].objects]);
  }, [crateMode]); // eslint-disable-line react-hooks/exhaustive-deps
  const [colorway, setColorway] = useState(COLORWAYS[0].key);
  const [reference, setReference] = useState(REFERENCES[0].key);
  const [length, setLength] = useState("compact");
  const [copied, setCopied] = useState(false);

  const lookMeta = LOOKS.find((l) => l.key === look) || LOOKS[0];
  const phoneMeta = PHONES.find((x) => x.key === phone) || PHONES[0];
  const personaMeta = PERSONAS.find((x) => x.key === persona) || PERSONAS[0];
  const okDaylights = crateMode ? [] : allowedDaylights({ scene });
  const daylightKey = okDaylights.includes(daylight) ? daylight : okDaylights[0];
  const daylightMeta = DAYLIGHTS.find((d) => d.key === daylightKey);
  const sceneMeta = SCENES.find((s) => s.key === scene) || SCENES[0];
  const angleMeta = ANGLES.find((a) => a.key === angle) || ANGLES[0];
  const cw = COLORWAYS.find((c) => c.key === colorway) || COLORWAYS[0];
  const peopleMeta = PEOPLE.find((x) => x.key === people) || PEOPLE[0];
  const objectSceneMeta = OBJECT_SCENES.find((o) => o.key === objectScene) || OBJECT_SCENES[0];
  const prompt = scheduleImagesRecipe.compose({ look, persona, daylight, phone, scene, objectScene, angle, people, objects, colorway, reference, length });
  const over = length === "compact" && prompt.length > COMPACT_LIMIT;

  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const chips = (label, items, value, set, allowed) => (
    <div className="prd-faces__dial">
      <span className="prd-faces__label">{label}</span>
      <div className="prd-amx__styles" role="group" aria-label={label}>
        {items.filter((it) => !allowed || allowed.includes(it.key)).map((it) => (
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

  const isDefault =
    look === LOOKS[0].key && phone === PHONES[0].key && persona === PERSONAS[0].key && daylight === DAYLIGHTS[0].key && angle === "own" && people === "one" && !objects.length &&
    colorway === COLORWAYS[0].key && reference === REFERENCES[0].key && length === "compact";
  // Shuffle (Agam, 2026-09-04: "randomise the fine-tune parameters to always
  // produce an interesting composition"). Rolls people, angle, objects, case colour
  // and time of day inside what the scene allows; leans off the scene's own camera
  // and keeps the two risky angles (POV, overhead) for when a reference is attached;
  // never more than two objects (the framework's two-prop rule).
  const shuffle = () => {
    const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const nextPeople = rnd(allowedPeople({ scene }).filter((k) => k !== "none"));
    let okA = allowedAngles({ scene, objectScene, people: nextPeople });
    if (reference === "none") okA = okA.filter((k) => k !== "pov" && k !== "overhead");
    const others = okA.filter((k) => k !== "own");
    const nextAngle = others.length && Math.random() < 0.7 ? rnd(others) : "own";
    const roll = Math.random();
    const nextObjects = roll < 0.4 ? [] : rnd(OBJECT_GROUPS).objects.slice(0, roll < 0.75 ? 1 : 2);
    const okD = allowedDaylights({ scene });
    setPeople(nextPeople);
    setAngle(nextAngle);
    setObjects(nextObjects);
    setColorway(rnd(COLORWAYS).key);
    if (okD.length) setDaylight(rnd(okD));
  };
  const reset = () => {
    setLook(LOOKS[0].key); setPhone(PHONES[0].key); setPersona(PERSONAS[0].key); setDaylight(DAYLIGHTS[0].key); setAngle("own"); setPeople("one"); setObjects([]);
    setColorway(COLORWAYS[0].key); setReference(REFERENCES[0].key); setLength("compact");
  };
  const tuned = [
    persona !== PERSONAS[0].key ? personaMeta.label : null,
    okDaylights.length > 1 && daylightKey !== DAYLIGHTS[0].key && daylightMeta ? daylightMeta.label : null,
    look !== LOOKS[0].key ? lookMeta.label : null,
    phone !== PHONES[0].key ? phoneMeta.label : null,
    angle !== "own" ? angleMeta.label : null,
    people !== "one" ? peopleMeta.label : null,
    objects.length ? `${objects.length} object${objects.length > 1 ? "s" : ""}` : null,
    colorway !== COLORWAYS[0].key ? cw.label : null,
    reference !== REFERENCES[0].key ? (REFERENCES.find((r) => r.key === reference) || {}).label : null,
    length !== "compact" ? "Full length" : null,
  ].filter(Boolean);

  // Two-step picker: pick a scene, copy the block. Everything else is a default
  // that lives under Fine-tune (Agam, 2026-09-04: "simplify the UI, make it super
  // easy to use").
  return (
    <div className="prd-builder prd-builder--simple">
      {crateMode ? chips("Object scene", OBJECT_SCENES, objectScene, setObjectScene) : chips("Scene", SCENES, scene, setScene)}
      <p className="prd-amx__campaign-blurb">{crateMode ? objectSceneMeta.blurb : sceneMeta.blurb}</p>
      {!crateMode && chips("Journey", PERSONAS, persona, setPersona)}
      {!crateMode && <p className="prd-amx__campaign-blurb">{personaMeta.blurb} One pick changes every scene: the commute, the ride home, the home, the clothes, what they carry.</p>}
      {okDaylights.length > 1 && chips("Time of day", DAYLIGHTS, daylightKey, setDaylight, okDaylights)}
      {okDaylights.length > 1 && daylightMeta && <p className="prd-amx__campaign-blurb">{daylightMeta.blurb}{okDaylights.length < DAYLIGHTS.length ? " Only the conditions this scene can take are shown." : ""}</p>}
      {okDaylights.length === 1 && daylightMeta && <p className="prd-amx__campaign-blurb">Time of day: {daylightMeta.label.toLowerCase()} only, the scene needs it.</p>}

      <p className="prd-amx__picked">
        {crateMode ? `Objects · ${objectSceneMeta.label}` : sceneMeta.label}
        {tuned.length ? SEP + tuned.join(SEP) : ""}
        <span
          className="prd-amx__stylechip"
          style={over ? { color: "var(--danger, #c0392b)" } : undefined}
          aria-live="polite"
        >
          {prompt.length.toLocaleString()}
          {length === "compact" ? ` / ${COMPACT_LIMIT}` : ""}
        </span>
      </p>

      <div className="prd-pre">
        <button type="button" className="prd-pre__copy" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </button>
        {!crateMode && (
          <button type="button" className="prd-pre__copy prd-pre__shuffle" onClick={shuffle} title="Roll angle, people, objects, case colour and time of day into a new composition">
            Shuffle
          </button>
        )}
        <pre>{prompt}</pre>
      </div>
      <p className="prd-amx__campaign-blurb">
        Paste the whole block into a fresh Figma chat every time; nothing carries over. If the result is close, change one thing here and paste again.
      </p>

      <details className="prd-builder__more">
        <summary>
          Fine-tune
          {tuned.length ? <span className="prd-builder__more-count">{tuned.length}</span> : null}
          {!isDefault ? (
            <button type="button" className="prd-builder__reset" onClick={(e) => { e.preventDefault(); reset(); }}>
              Reset
            </button>
          ) : null}
        </summary>

        {chips("Angle", ANGLES, angle, setAngle, okAngles)}
        <p className="prd-amx__campaign-blurb">
          {angle === "own"
            ? crateMode ? objectSceneMeta.camera : sceneMeta.camera
            : angleMeta.full}
          {angleMeta.risk ? ` ${angleMeta.risk}` : ""}
        </p>

        {chips("People", PEOPLE, people, setPeople, crateMode ? PEOPLE.map((x) => x.key) : okPeople)}
        <p className="prd-amx__campaign-blurb">{peopleMeta.blurb}</p>

        <div className="prd-faces__dial">
          <span className="prd-faces__label">Objects from the last order</span>
          <div className="prd-amx__styles" role="group" aria-label="Object groups">
            {OBJECT_GROUPS.map((g) => {
              const on = g.objects.length === objects.length && g.objects.every((k) => objects.includes(k));
              return (
                <button
                  key={g.key}
                  type="button"
                  className={"prd-amx__style" + (on ? " is-on" : "")}
                  aria-pressed={on}
                  onClick={() => setObjects(on ? [] : [...g.objects])}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
          <div className="prd-amx__styles" role="group" aria-label={`Objects, up to ${MAX_OBJECTS}`}>
            {OBJECTS.map((o) => {
              const on = objects.includes(o.key);
              const full = !on && objects.length >= MAX_OBJECTS;
              return (
                <button
                  key={o.key}
                  type="button"
                  className={"prd-amx__style" + (on ? " is-on" : "")}
                  aria-pressed={on}
                  disabled={full}
                  style={full ? { opacity: 0.45 } : undefined}
                  onClick={() => toggleObject(o.key)}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
        <p className="prd-amx__campaign-blurb">
          {objects.length
            ? `In the scene as the goods from the last order: ${objects.map((k) => (OBJECTS.find((o) => o.key === k) || {}).short).join(", ")}. One or two reads best; three is the cap.`
            : "None: the goods are not there yet. A group adds three at once, the cap; one or two reads best."}
        </p>

        <div className="prd-faces__dial">
          <span className="prd-faces__label">{crateMode ? "Brand colour" : "Case colour"}</span>
          <div className="prd-faces__swatches" role="group" aria-label={crateMode ? "Brand colour" : "Case colour"}>
            {COLORWAYS.map((c) => (
              <button
                key={c.key}
                type="button"
                className={"prd-faces__sw" + (colorway === c.key ? " is-on" : "")}
                aria-pressed={colorway === c.key}
                aria-label={c.label}
                title={c.label}
                onClick={() => setColorway(c.key)}
              >
                <span className="prd-faces__chip" style={{ background: c.color }} aria-hidden="true" />
                <span className="prd-faces__swname">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {!crateMode && chips("Phone", PHONES, phone, setPhone)}
        {!crateMode && <p className="prd-amx__campaign-blurb">{phoneMeta.blurb}</p>}

        {chips("Look", LOOKS, look, setLook)}
        <p className="prd-amx__campaign-blurb">{crateMode ? "Object stills always use the campaign hard sun." : lookMeta.blurb}</p>

        {chips("Reference image", REFERENCES, reference, setReference)}
        <p className="prd-amx__campaign-blurb">
          {reference === "moodboard"
            ? "Attach one real photograph in the same chat. The block takes only its photographic quality, none of its content."
            : reference === "anchor"
            ? "Attach the set's best still in the same chat, every time. The block takes only its palette, light and shadow tint."
            : "No image: the words carry the whole look. Switch to a moodboard frame for the keeper."}
        </p>

        {chips(
          "Length",
          [
            { key: "compact", label: `Compact · Figma (under ${COMPACT_LIMIT})` },
            { key: "full", label: "Full" },
          ],
          length,
          setLength
        )}
      </details>
    </div>
  );
}
