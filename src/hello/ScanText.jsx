// THE TWO-TONE HEADING TEXT (annotation msrq817u, "instead of works, write a
// small explainer for each, with all text as 50% grey and scannable text as
// 90% white"). Shared by both marquee variants - the step carousel and the
// drift engine - so the split and the two opacities are defined exactly once.
//
// `text` is the whole blurb; `scan` is a verbatim substring to lift out. A
// plain string, not markup in the data, because the blurbs are prose written
// by hand and a `**bold**` convention would be one more thing to get wrong
// copying them in. If `scan` does not appear in `text` - a typo, or a blurb
// added without one - the whole line falls back to flat 50%, which is a
// legible line, not a crash.
export default function ScanText({ text, scan }) {
  if (!text) return null;
  const i = scan ? text.indexOf(scan) : -1;
  if (i < 0) return <span className="hm-bar__dim">{text}</span>;
  return (
    <>
      <span className="hm-bar__dim">{text.slice(0, i)}</span>
      <span className="hm-bar__scan">{scan}</span>
      <span className="hm-bar__dim">{text.slice(i + scan.length)}</span>
    </>
  );
}
