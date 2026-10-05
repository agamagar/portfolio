// The banner matrix: treatments x themes, each cell a banner composed from the
// theme's ramp by a recipe, with every type colour SOLVED by contrast, never picked.
// H = headline on field, K = kicker on field, C = CTA label on CTA fill.
//
// Five treatments are the ones legible in the rendered board (out/): Signature,
// Inverted, Light field, Deep fill, Tint. The generator has twelve; the other seven
// arrive with tokens.json.
import { RAMPS } from "./ramps.js";
import { ratio, passes } from "../contrast.js";

const WHITE = "#FFFFFF";

export const THEME_COPY = {
  green: { kicker: "Amazon Fresh", headline: "Big deals? Checks out.", cta: "Shop deals" },
  purple: { kicker: "Zepto", headline: "10 minutes? Checks out.", cta: "Shop deals" },
  orange: { kicker: "Instant", headline: "Hungry now? Checks out.", cta: "Order now" },
  blue: { kicker: "Everyday", headline: "Free delivery? Checks out.", cta: "Start saving" },
  yellow: { kicker: "Value", headline: "Half price? Checks out.", cta: "Grab deal" },
  lavender: { kicker: "Zepto · New", headline: "Get it now, or later?", cta: "Choose a slot" },
};

// Whichever candidate clears best on a fill; first candidate wins ties.
const solve = (fill, candidates) =>
  candidates.reduce((best, c) => (ratio(c, fill) > ratio(best, fill) ? c : best), candidates[0]);

// A CTA prefers the theme's 500 as fill when a label can clear body text on it,
// otherwise the fallback fill (a hot CTA stays hot before it collapses to ink).
const cta = (s, preferred, fallback, labels) => {
  const onPreferred = solve(preferred, labels);
  if (passes(ratio(onPreferred, preferred), "body")) return { fill: preferred, label: onPreferred };
  return { fill: fallback, label: solve(fallback, labels) };
};

export const TREATMENTS = [
  {
    key: "signature",
    label: "Signature",
    blurb: "Primary field, brand type.",
    build: (s) => {
      const field = s[500];
      const type = solve(field, [s[900], WHITE]);
      return { field, type, kicker: type === WHITE ? s[100] : s[800], cta: { fill: s[900], label: solve(s[900], [s[50], s[100], WHITE]) } };
    },
  },
  {
    key: "inverted",
    label: "Inverted",
    blurb: "Night mode of the signature.",
    // accent type on the deep field: the 500 where it clears display type, else the
    // first lighter step that does (a mid-tone purple cannot hold on its own 900)
    build: (s) => {
      const field = s[900];
      const type = [s[500], s[400], s[300]].find((c) => passes(ratio(c, field), "display")) || s[300];
      return { field, type, kicker: s[400], cta: cta(s, s[500], s[100], [s[900], WHITE]) };
    },
  },
  {
    key: "light-field",
    label: "Light field",
    blurb: "Tint field, deep type. The softest loud option.",
    build: (s) => ({ field: s[200], type: s[900], kicker: s[700], cta: cta(s, s[500], s[900], [WHITE, s[900], s[50]]) }),
  },
  {
    key: "deep-fill",
    label: "Deep fill",
    blurb: "Premium, late-night register.",
    build: (s) => ({ field: s[800], type: s[50], kicker: s[200], cta: { fill: s[100], label: s[900] } }),
  },
  {
    key: "tint",
    label: "Tint",
    blurb: "Quietest. In-app promo.",
    build: (s) => ({ field: s[50], type: s[900], kicker: s[600], cta: cta(s, s[500], s[900], [WHITE, s[900], s[50]]) }),
  },
];

// One row per treatment, one cell per theme. Every ratio is computed; a kicker that
// cannot clear body text on its field falls back to the headline colour.
export const BANNERS = TREATMENTS.map((t) => ({
  key: t.key,
  label: t.label,
  blurb: t.blurb,
  cells: RAMPS.map((r) => {
    const b = t.build(r.steps);
    const kicker = passes(ratio(b.kicker, b.field), "body") ? b.kicker : b.type;
    return {
      theme: r.key,
      themeLabel: r.label,
      copy: THEME_COPY[r.key],
      field: b.field,
      type: b.type,
      kicker,
      ctaFill: b.cta.fill,
      ctaLabel: b.cta.label,
      H: ratio(b.type, b.field),
      K: ratio(kicker, b.field),
      C: ratio(b.cta.label, b.cta.fill),
    };
  }),
}));
