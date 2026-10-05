// The library's two global rules for image generation, declared once.
//
// Before this file they were restated inside all 176 image prompts, in three
// different wordings that had drifted apart over five build sessions. They are
// now one constant, appended at assembly to any block marked `rules: true`, so
// changing the rule changes every prompt.
export const NO_TEXT =
  "No text, letters, numbers or labels anywhere in the image.";

export const NO_BRANDING =
  "Strip all branding: no logos, wordmarks, brand names or brand marks of any kind.";

export const LIBRARY_RULES = `${NO_TEXT} ${NO_BRANDING}`;

// Append the rules to a prompt body. `extra` is for a group that needs one more
// prohibition of its own (the airplane set bars livery and registration marks),
// which sits between the two global sentences rather than replacing either.
export function withRules(body, extra) {
  const b = String(body).trimEnd();
  return extra ? `${b} ${NO_TEXT} ${extra} ${NO_BRANDING}` : `${b} ${LIBRARY_RULES}`;
}

// The master [SUBJECT] templates state the rules mid-block rather than at the end,
// so they carry this token instead and get the same one constant substituted in.
export const RULES_TOKEN = "{{RULES}}";

// The same two rules in one short sentence, for recipes composing under a hard
// character cap (Figma's GPT Image 2 prompt field). Same prohibitions, fewer words.
export const LIBRARY_RULES_COMPACT = "No text, letters, logos or branding anywhere.";
export function withRulesCompact(body, extra) {
  const b = String(body).trimEnd();
  return extra ? `${b} ${LIBRARY_RULES_COMPACT} ${extra}` : `${b} ${LIBRARY_RULES_COMPACT}`;
}

// Walk a spec and expand every { pre, rules: true } block into finished text, plus
// any {{RULES}} token wherever it sits. Blocks with neither (a pose list, a
// consistency tip) are left untouched.
export function applyRules(node, extra) {
  if (Array.isArray(node)) return node.map((n) => applyRules(n, extra));
  if (node && typeof node === "object") {
    if (typeof node.pre === "string") {
      let pre = node.pre.split(RULES_TOKEN).join(withRules("", extra).trim());
      if (node.rules) pre = withRules(pre, extra);
      return { pre };
    }
    return Object.fromEntries(
      Object.entries(node).map(([k, v]) => [k, applyRules(v, extra)])
    );
  }
  return node;
}
