// /face-lab: the procedural clay head (src/figures/faces/clay): an SDF built in three.js, params as JSON, orbit by yaw/pitch.
// window.__clay = { set(params), render(yaw, pitch) -> dataURL, meta } for the headless fit loop (tools/face3d/claydev).
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { buildClayHead, studioLights } from "../figures/faces/clay/ClayHead.js";
import { DEFAULT, mergeParams } from "../figures/faces/clay/params.js";
export default function ClayLab() {
  const cv = useRef(null), mounted = useRef(false), st = useRef({}), [json, setJson] = useState(() => JSON.stringify(DEFAULT, null, 1)), [yaw, setYaw] = useState(-25), [pitch, setPitch] = useState(8), [n, setN] = useState(96), [info, setInfo] = useState(""), [err, setErr] = useState("");
  useEffect(() => {
    const r = new THREE.WebGLRenderer({ canvas: cv.current, antialias: true, alpha: true, premultipliedAlpha: false, preserveDrawingBuffer: true }); r.setPixelRatio(1); r.setSize(560, 560, false);
    r.setClearColor("#e9e9eb", 1); r.toneMapping = THREE.NoToneMapping; r.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-2.4, 2.4, 2.4, -2.4, 0.1, 50); cam.position.set(0, 0, 10);
    studioLights(THREE, scene); st.current = { r, scene, cam, head: null, pivot: new THREE.Group() }; scene.add(st.current.pivot);
    const s = st.current;
    s.build = (over, nn) => { if (s.head) { s.pivot.remove(s.head.group); s.head.dispose(); } s.head = buildClayHead(THREE, over, { n: nn }); s.pivot.add(s.head.group); setInfo(`${s.head.meta.ms} ms, ${Math.round(s.head.meta.tris)} tris`); };
    s.draw = (yy, pp) => { s.pivot.rotation.set((pp * Math.PI) / 180, (yy * Math.PI) / 180, 0, "YXZ"); r.render(scene, cam); };
    window.__clay = { set: (over, nn = 96) => { s.build(over, nn); s.draw(0, 0); return s.head.meta; }, render: (yy, pp) => { r.setClearColor("#e9e9eb", 0); s.draw(yy, pp); const u = r.domElement.toDataURL("image/png"); r.setClearColor("#e9e9eb", 1); s.draw(yy, pp); return u; }, get meta() { return s.head?.meta; }, stats: () => { const m = s.head.group.getObjectByName('Head'), c = m.geometry.attributes.color, p = m.geometry.attributes.position; let g = 0, r = 0, f = 0, names = []; s.head.group.traverse((o) => { if (o.isMesh) names.push(o.name); }); for (let i = 0; i < p.count; i++) if (p.getZ(i) > 0.6 && Math.abs(p.getX(i)) < 0.6 && p.getY(i) < 0.4 && p.getY(i) > -0.5) { f++; if (c.getY(i) > c.getX(i)) g++; else r++; } return { f, g, r, names, verts: p.count }; }, probe: (x, y) => { const m = s.head.group.getObjectByName('Head'), c = m.geometry.attributes.color, p = m.geometry.attributes.position; let best = -1, bz = -9; for (let i = 0; i < p.count; i++) if (Math.hypot(p.getX(i) - x, p.getY(i) - y) < 0.03 && p.getZ(i) > bz) { bz = p.getZ(i); best = i; } return best < 0 ? null : { z: bz, rgb: [c.getX(best), c.getY(best), c.getZ(best)], pos: [p.getX(best), p.getY(best), p.getZ(best)], mat: m.material.vertexColors, col: m.material.color.getHexString() }; }, show: (name, on) => { s.head.group.traverse((o) => { if (o.name === name) o.visible = on; }); } };
    s.build(DEFAULT, 96); s.draw(-25, 8); mounted.current = true;
    return () => { s.head?.dispose(); r.dispose(); delete window.__clay; };
  }, []);
  const apply = () => { try { setErr(""); st.current.build(JSON.parse(json), n); st.current.draw(yaw, pitch); } catch (e) { setErr(String(e.message || e)); } };
  const firstN = useRef(true);
  useEffect(() => { if (firstN.current) { firstN.current = false; return; } apply(); }, [n]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { st.current.draw?.(yaw, pitch); }, [yaw, pitch]);
  return (
    <section className="fl-cell" style={{ maxWidth: 1100 }}>
      <details open><summary>Clay head (procedural SDF, three.js)</summary>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
          <canvas ref={cv} width={560} height={560} style={{ width: 420, height: 420, borderRadius: 12 }} />
          <div style={{ flex: 1, minWidth: 280 }}>
            <label className="fl-sl"><span>Yaw</span><input type="range" min="-180" max="180" value={yaw} onChange={(e) => setYaw(+e.target.value)} /><output>{yaw}</output></label>
            <label className="fl-sl"><span>Pitch</span><input type="range" min="-45" max="45" value={pitch} onChange={(e) => setPitch(+e.target.value)} /><output>{pitch}</output></label>
            <label className="fl-sl"><span>Grid</span><select value={n} onChange={(e) => setN(+e.target.value)}>{[64, 96, 128].map((v) => <option key={v}>{v}</option>)}</select><output>{info}</output></label>
            <textarea value={json} onChange={(e) => setJson(e.target.value)} spellCheck={false} style={{ width: "100%", height: 220, font: "11px monospace" }} />
            <div className="fl-row"><button onClick={apply}>Apply params</button><button onClick={() => { setJson(JSON.stringify(DEFAULT, null, 1)); }}>Reset</button>{err && <span style={{ color: "#c33" }}>{err}</span>}</div>
          </div>
        </div>
      </details>
    </section>
  );
}
