// CornerNest: the fourth rule's maths. A true-size nest, then one corner at 3x, wrong and right. The band is the padding.
//   spec { sky?, nest: { k, t }, wrong: { k, t }, right: { k, t }, caption? }   sky: the sheet's, the section's own (mint by default)
import { CaseFigure } from "./CaseFigure";
import { rr } from "../roundedRect";
import "./cornerNest.css";

// True size: a 32 sheet with 16 of padding holds a 16 card, whose 8 of padding holds 8 blocks. The three corners share
// one centre, at (32, 32): that is the rule, drawn. The sheet is a sky, and the card and blocks are glass on it.
function Nest({ sky = "mint" }) {
  return (
    <svg className="dspec-corner__nest" viewBox="0 0 240 168" width="240" height="168" aria-hidden="true">
      <defs>
        <linearGradient id="dspec-nest-sky" x1="0" y1="0" x2="0" y2="1">
          <stop style={{ stopColor: `var(--gradient-${sky}-start)` }} offset="0" />
          <stop style={{ stopColor: `var(--gradient-${sky}-end)` }} offset="1" />
        </linearGradient>
      </defs>
      <path d={rr(0, 0, 240, 168, 32)} fill="url(#dspec-nest-sky)" />
      <path className="dspec-corner__f2" d={rr(16, 16, 208, 136, 16)} />
      <path className="dspec-corner__f3" d={rr(24, 24, 192, 56, 8)} />
      <path className="dspec-corner__f3" d={rr(24, 88, 192, 56, 8)} />
      {/* the three corner arcs, concentric */}
      <path className="dspec-corner__arc" d="M0,32 A32,32 0 0 1 32,0" />
      <path className="dspec-corner__arc" d="M16,32 A16,16 0 0 1 32,16" />
      <path className="dspec-corner__arc" d="M24,32 A8,8 0 0 1 32,24" />
      <circle className="dspec-corner__ctr" cx="32" cy="32" r="2.5" />
      {/* the values sit in the bands wide enough to hold them; the legend under the drawing names all three */}
      <text className="dspec-corner__t" x="40" y="11.5">r32</text>
      <text className="dspec-corner__t" x="40" y="56">r8</text>
      <text className="dspec-corner__t" x="40" y="120">r8</text>
    </svg>
  );
}

// 3x zoom on one corner: outer r16 (48), padding 8 (24), inner r16 or r8 (48 or 24).
function Zoom({ inner }) {
  const R = 48, P = 24, O = 10; // outer radius, padding, offset of the outer corner in the panel
  const c1 = O + R, c2 = O + P + inner; // corner centres: outer, inner
  const k = Math.SQRT1_2;
  const a = c1 - R * k, b = c2 - inner * k; // where the 45 degree line meets each arc
  return (
    <svg className="dspec-corner__zoom" viewBox="0 0 150 150" width="150" height="150" aria-hidden="true">
      <path className="dspec-corner__band" fillRule="evenodd" d={rr(O, O, 220, 220, R) + rr(O + P, O + P, 220 - 2 * P, 220 - 2 * P, inner)} />
      <path className="dspec-corner__edge" d={rr(O, O, 220, 220, R)} />
      <path className="dspec-corner__edge" d={rr(O + P, O + P, 220 - 2 * P, 220 - 2 * P, inner)} />
      <line className="dspec-corner__dim" x1={a} y1={a} x2={b} y2={b} />
      <line className="dspec-corner__dim" x1={O} y1={128} x2={O + P} y2={128} />
      <text className="dspec-corner__t dspec-corner__t--acc" x={b + 5} y={b + 4}>{((b - a) * Math.SQRT2 / 3).toFixed(1).replace(/\.0$/, "")}</text>
      <text className="dspec-corner__t dspec-corner__t--acc" x={O + P + 5} y={132}>8</text>
    </svg>
  );
}

function Cell({ item, children, nest }) {
  return (
    <div className={"dspec-corner__cell" + (nest ? " dspec-corner__cell--nest" : "")}>
      {children}
      <p className="dspec-corner__k">{item.k}</p>
      <p className="dspec-corner__d">{item.t}</p>
    </div>
  );
}

export function CornerNest({ spec }) {
  return (
    <CaseFigure type="corners" caption={spec.caption}>
      <div className="dspec-corner">
        <Cell item={spec.nest} nest><Nest sky={spec.sky} /></Cell>
        <div className="dspec-corner__pair">
          <Cell item={spec.wrong}><Zoom inner={48} /></Cell>
          <Cell item={spec.right}><Zoom inner={24} /></Cell>
        </div>
      </div>
    </CaseFigure>
  );
}
