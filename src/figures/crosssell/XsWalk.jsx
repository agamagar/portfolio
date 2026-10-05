import { useState } from "react";
import "./crosssell.css";

// Opener: what the walk used to do. Left, a store aisle in one-point
// perspective and a path that meanders past four things nobody came for.
// Right, a phone: search, cart, pay, three taps, a straight line that touches
// nothing. Click either side to replay its path. Nothing here is data; it is
// the argument drawn.

const AISLE_PICKS = [
  { x: 118, y: 168, l: "mop" },
  { x: 262, y: 120, l: "frozen peas" },
  { x: 150, y: 74, l: "torch" },
  { x: 232, y: 44, l: "batteries" },
];

// A walk that wanders across the aisle and back before it reaches the till.
const WALK = "M 190 262 C 150 236 120 210 118 176 C 116 150 200 140 262 128 C 300 120 250 100 150 82 C 110 74 190 56 232 50 C 250 46 200 30 190 18";

export default function XsWalk() {
  const [k, setK] = useState(0);
  const replay = () => setK((n) => n + 1);
  return (
    <div className="fc xk">
      <div className="xk__grid">
        <button type="button" className="xk__side" onClick={replay} aria-label="Replay the store walk">
          <div className="xk__h">A big store</div>
          <svg className="xk__svg" viewBox="0 0 380 280" role="img" aria-label="A store aisle in perspective. A dotted path wanders from the entrance past four highlighted products before it reaches the till.">
            {/* floor and shelves in one-point perspective */}
            <polygon className="xk__floor" points="0,280 380,280 230,20 150,20" />
            <polygon className="xk__shelf" points="0,280 150,20 150,0 0,0" />
            <polygon className="xk__shelf" points="380,280 230,20 230,0 380,0" />
            {[0.15, 0.32, 0.5, 0.68, 0.86].map((t) => (
              <g key={t} className="xk__rail">
                <line x1={150 - 150 * (1 - t)} y1={20 + 260 * (1 - t)} x2={150} y2={20} />
                <line x1={230 + 150 * (1 - t)} y1={20 + 260 * (1 - t)} x2={230} y2={20} />
              </g>
            ))}
            {[40, 90, 140, 190, 240].map((y, i) => (
              <g key={y} className="xk__row">
                <line x1={150 - (y - 20) * 0.58} y1={y} x2={150} y2={20 + (y - 20) * 0.5} />
                <line x1={230 + (y - 20) * 0.58} y1={y} x2={230} y2={20 + (y - 20) * 0.5} />
                {i === 2 && <text className="xk__endcap" x="190" y="152">end cap</text>}
              </g>
            ))}
            <rect className="xk__till" x="172" y="6" width="36" height="14" rx="3" />
            <text className="xk__lbl" x="190" y="16" textAnchor="middle">till</text>
            <text className="xk__lbl" x="190" y="274" textAnchor="middle">in</text>
            {/* the walk */}
            <path key={`w${k}`} className="xk__path xk__path--walk" d={WALK} pathLength="1" />
            {AISLE_PICKS.map((p, i) => (
              <g key={p.l} className="xk__pick" style={{ animationDelay: `${0.5 + i * 0.55}s` }}>
                <circle cx={p.x} cy={p.y} r="7" />
                <text x={p.x + 11} y={p.y + 4}>{p.l}</text>
              </g>
            ))}
          </svg>
          <div className="xk__cap">You went for atta and rice. The walk sold you the rest.</div>
        </button>

        <button type="button" className="xk__side" onClick={replay} aria-label="Replay the app path">
          <div className="xk__h">The app</div>
          <svg className="xk__svg" viewBox="0 0 380 280" role="img" aria-label="A phone with three steps, search, cart, pay, joined by a straight line that passes nothing.">
            <rect className="xk__phone" x="110" y="8" width="160" height="264" rx="22" />
            <rect className="xk__scr" x="118" y="22" width="144" height="236" rx="14" />
            {[
              { y: 58, l: "search", s: "atta" },
              { y: 140, l: "cart", s: "atta, rice" },
              { y: 222, l: "pay", s: "done in forty seconds" },
            ].map((st) => (
              <g key={st.l} className="xk__step">
                <rect x="132" y={st.y - 16} width="116" height="32" rx="8" />
                <text className="xk__step-l" x="146" y={st.y - 2}>{st.l}</text>
                <text className="xk__step-s" x="146" y={st.y + 10}>{st.s}</text>
              </g>
            ))}
            {/* the path: straight down, touching nothing */}
            <path key={`a${k}`} className="xk__path xk__path--app" d="M 190 74 L 190 124 M 190 156 L 190 206" pathLength="1" />
            {/* the same four items, off to the side, never passed */}
            {AISLE_PICKS.map((p, i) => (
              <text key={p.l} className="xk__missed" x={i % 2 ? 300 : 18} y={40 + i * 60} style={{ animationDelay: `${1.2 + i * 0.2}s` }}>{p.l}</text>
            ))}
          </svg>
          <div className="xk__cap">Search, tap, pay. Nothing on the way to anything.</div>
        </button>
      </div>
      <div className="xf__cap">With no aisles left, what does the walking? Click either side to replay.</div>
    </div>
  );
}
