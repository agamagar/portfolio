// Composes the "Zepto catalogue" group: one system spec, then one catalog spec per
// category, every block generated from the recipe rather than frozen as text.
//
// Nothing here is hand-written prompt prose. If a style changes, or a material class
// changes, every one of the 340 blocks below changes with it on the next render.
import { SPECS as PROSE } from "./zeptoCatalogue.data.js";
import {
  CATEGORIES,
  SUBCATEGORIES,
  STYLES,
  CLASSES,
  LAYERS,
  composeSub,
  classOf,
} from "./zeptoCatalogueViews.js";

// The style shown in the catalog specs. Every other style is one dial away, which is
// the entire point of the group, so the catalogs show the default rather than
// multiplying 340 blocks by four looks.
const SHOWN_STYLE = "studio";

// The rail's shortLabel helper (PrdRenderer.jsx) cuts a title at its first comma,
// which would render "Dairy, Bread & Eggs" as "Dairy". The real Zepto label is kept
// verbatim in the taxonomy and in the summary; only the title swaps commas for the
// same middle dot the titles already use, so the rail entry stays unambiguous.
const titleLabel = (label) => label.replace(/, /g, " \u00b7 ");

const catalogSpec = (cat) => ({
  id: `pl-zepto-catalogue-${cat.key}`,
  group: "Zepto catalogue",
  eyebrow: "Zepto",
  title: `Zepto catalogue · ${titleLabel(cat.label)}`,
  summary: `${cat.subs.length} subcategor${cat.subs.length === 1 ? "y" : "ies"} of ${
    cat.label
  }, composed in the Studio packshot style${
    cat.homeRail
      ? ". This category appears in the app's home rail but not in the category sitemap, so treat its slug as less certain than the rest"
      : ""
  }. Swap the style dial for App grid, Campaign world or Soft toy model and every block below is rebuilt from the same subject.`,
  ...Object.fromEntries(
    cat.subs.map((sub) => [
      `${sub.label} (${classOf(sub.klass).label})`,
      { pre: composeSub(sub, { style: SHOWN_STYLE }) },
    ])
  ),
});

// The prose spec carries the writing; the recipe carries the prompts. The two are
// joined here so the system spec can show a real composed example rather than a
// paraphrase of one.
const systemSpec = () => {
  const sample = SUBCATEGORIES.find((s) => s.id === "dairy-bread-eggs/milk") || SUBCATEGORIES[0];
  const base = PROSE.find((s) => s.id === "pl-zepto-catalogue-system");
  return {
    ...base,
    "The same subject in all four styles": Object.fromEntries(
      STYLES.map((s) => [s.label, { pre: composeSub(sample, { style: s.key }) }])
    ),
    "The same subject, staged around a supplied pack": {
      pre: composeSub(sample, { style: SHOWN_STYLE, layer: "stage" }),
    },
    "The same subject, compact register": {
      pre: composeSub(sample, { style: SHOWN_STYLE, length: "compact" }),
    },
  };
};

const classSpec = () => ({
  ...PROSE.find((s) => s.id === "pl-zepto-catalogue-classes"),
  "The seventeen classes": Object.fromEntries(
    CLASSES.map((c) => [
      c.label,
      [
        `Ground: ${c.ground}`,
        `Light: ${c.light}`,
        `Shadow: ${c.shadow}`,
        `Used by ${SUBCATEGORIES.filter((s) => s.klass === c.key).length} subcategories.`,
      ],
    ])
  ),
});

export const zeptoCatalogueSpecs = [
  systemSpec(),
  classSpec(),
  ...CATEGORIES.map(catalogSpec),
];

export { CATEGORIES, SUBCATEGORIES, STYLES, CLASSES, LAYERS, composeSub };
