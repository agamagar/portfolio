// PostCSS plugin: every selector that uses :hover only applies while html is NOT scrolling
// (src/ui/scrollHover.js toggles html.is-scrolling). The guard is wrapped in :where(), so
// it adds no specificity and the cascade is exactly what it was. Selectors that start at
// html / :root get the guard on that compound instead of an impossible "html html".
const HEAD = /^(html|:root)((?:\.[\w-]+|#[\w-]+|\[[^\]]*\]|:[\w-]+(?:\([^)]*\))?)*)/;
const GUARD = ":where(html:not(.is-scrolling))";
export default function scrollHover() {
  return {
    postcssPlugin: "scroll-hover",
    Rule(rule) {
      if (!rule.selector.includes(":hover") || rule.__scrollHover) return;
      let inKeyframes = false;
      for (let p = rule.parent; p; p = p.parent) if (p.type === "atrule" && /keyframes/i.test(p.name)) inKeyframes = true;
      if (inKeyframes) return;
      rule.__scrollHover = true;
      rule.selectors = rule.selectors.map((sel) => {
        if (!sel.includes(":hover")) return sel;
        const m = HEAD.exec(sel);
        if (m) return sel.replace(HEAD, `$&:where(:not(.is-scrolling))`);
        return `${GUARD} ${sel}`;
      });
    },
  };
}
scrollHover.postcss = true;
