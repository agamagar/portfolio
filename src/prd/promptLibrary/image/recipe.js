// The shared recipe contract for an image-prompt system, generalised from the
// Airplane views group, which was the only one of the six built this way.
//
// A recipe is: some DIALS (the things you pick), some STYLES (the look each pick
// is rendered in), and a compose() that turns one combination into one prompt.
// The dials describe SHAPE only and the styles describe LOOK only, which is what
// lets any style hold for any pick. Everything ends with the library rules, so a
// recipe never restates them.
//
// A group that is still a frozen catalog (icons, specimen, hands) can be lifted
// onto this contract one at a time; nothing here requires all six to move at once.
import { withRules, withRulesCompact } from "../rules.js";

// Join prompt clauses into one paragraph, dropping empties, and close with the
// library rules. This is the only place a composed prompt is allowed to end.
export function composeParts(parts, extraRule, { compact = false, extraRuleCompact } = {}) {
  const body = parts
    .filter(Boolean)
    .map((s) => String(s).trim())
    .join(" ");
  return compact ? withRulesCompact(body, extraRuleCompact ?? extraRule) : withRules(body, extraRule);
}

// Declare a recipe. Returns the same object with a checked shape and a compose()
// that always routes through the style registry, so adding a style is one entry
// rather than a new branch at every call site.
export function defineRecipe({
  key,
  label,
  dials = {},
  styles = [],
  extraRule,
  extraRuleCompact,
  tokens = [],
}) {
  if (!key) throw new Error("recipe needs a key");
  if (!styles.length) throw new Error(`recipe "${key}" needs at least one style`);
  const byKey = new Map(styles.map((s) => [s.key, s]));

  // pick = { style, ...one value per dial }, resolved by the chosen style's parts()
  const compose = (pick = {}) => {
    const style = byKey.get(pick.style) || styles[0];
    // pick.length === "compact" swaps in the one-sentence rules; a recipe that has no
    // compact register simply ignores the flag in its parts() and only saves the rules.
    return composeParts(style.parts(pick), extraRule, {
      compact: pick.length === "compact",
      extraRuleCompact,
    });
  };

  return {
    key,
    label,
    dials,
    styles,
    tokens,
    extraRule,
    extraRuleCompact,
    // metadata for a picker UI: label + blurb only, no prose
    styleMeta: styles.map(({ key: k, label: l, blurb }) => ({ key: k, label: l, blurb })),
    compose,
  };
}
