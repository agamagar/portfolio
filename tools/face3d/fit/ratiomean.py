# ratiomean.py: each textured part's surface colour as a ratio, for a fit json without albedo2's
# "ratioMean" (noir). (A turn's revealed surface takes its colour from "seen", seen.py; the ratio
# still shapes the blur at the edge of what the reference saw.) The shader paints that
# colour wherever a turn reveals surface the reference never saw; without it, it falls back
# to the texture's smallest mip, which averages in the texture's padding (noir: near white).
# The UVs are projected from the fitted camera, so a face the camera saw has positive area
# in UV space; the median is over those faces' texels, weighted by their area.
# A part's light can be fitted on a sliver (noir's hair, under the hat: a dark fringe in
# shadow), so the ratio alone says little about the colour it gives a surface the turn
# brings round to face the camera. So the value written is the median RADIANCE the reference
# shows on the part (light x AO^k x ratio, per seen face) divided by the part's light averaged
# over the normals a camera-facing surface shows (cosine-weighted): a revealed surface then lands near the part's seen colour.
#   Blender -b -P ratiomean.py -- MODEL.glb FIT.json [--write]
# (an unpacked GLB: Blender's importer has no meshopt)
import bpy, sys, json
import numpy as np
a = sys.argv[sys.argv.index("--") + 1:]
glb, fitp, write = a[0], a[1], "--write" in a
fit = json.load(open(fitp))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb)
PART = lambda n: "hair" if n == "Hair" else "brow" if n.startswith("Brow") else "eye" if n.startswith("Eye") else "hat" if n.startswith("Hat") else "skin"
from mathutils import Quaternion, Matrix
q = fit["camera"]["quaternion"]  # three.js axes, x y z w
Rc = np.array(Quaternion((q[3], q[0], q[1], q[2])).to_matrix())
def sh9(n):
    x, y, z = n[..., 0], n[..., 1], n[..., 2]
    return np.stack([0.282095 * np.ones_like(x), 0.488603 * y, 0.488603 * z, 0.488603 * x, 1.092548 * x * y, 1.092548 * y * z,
                     0.315392 * (3 * z * z - 1), 1.092548 * x * z, 0.546274 * (x * x - y * y)], -1)
rng = np.random.default_rng(1)
# the normals a camera sees on a surface turned to it: cosine-weighted over the facing hemisphere
u1, u2 = rng.random(4000), rng.random(4000)
hemi = np.stack([np.sqrt(u1) * np.cos(2 * np.pi * u2), np.sqrt(u1) * np.sin(2 * np.pi * u2), np.sqrt(1 - u1)], -1)
out = {}
for o in bpy.data.objects:
    if o.type != "MESH" or not o.data.uv_layers: continue
    img = None
    for s in o.material_slots:
        if s.material and s.material.node_tree:
            img = next((nd.image for nd in s.material.node_tree.nodes if nd.type == "TEX_IMAGE" and nd.image), img)
    if img is None: continue
    w, h = img.size
    px = np.array(img.pixels[:], np.float32).reshape(h, w, 4)[..., :3]  # bottom-up rows, linear floats as stored
    L = fit["light"][PART(o.name)] if PART(o.name) in fit["light"] else fit["light"]["skin"]
    uv = o.data.uv_layers.active.data
    cols, wts, nv, aos = [], [], [], []
    ca = o.data.color_attributes.get("Color")
    nm = o.matrix_world.to_3x3().inverted().transposed()
    for p in o.data.polygons:
        nb = nm @ p.normal
        nv.append(Rc.T @ np.array([nb.x, nb.z, -nb.y]))  # Blender Z-up -> glTF Y-up -> camera
        aos.append(np.mean([ca.data[i if ca.domain == "CORNER" else o.data.loops[i].vertex_index].color[0] for i in p.loop_indices]) if ca else 1.0)
        q = [uv[i].uv for i in p.loop_indices]
        area = 0.5 * sum(q[i].x * q[(i + 1) % len(q)].y - q[(i + 1) % len(q)].x * q[i].y for i in range(len(q)))
        cx = sum(t.x for t in q) / len(q); cy = sum(t.y for t in q) / len(q)
        x = min(w - 1, max(0, int(cx * w))); y = min(h - 1, max(0, int(cy * h)))
        cols.append(px[y, x]); wts.append(area)
    cols, wts = np.array(cols), np.array(wts)
    sign = 1 if wts[wts > 0].sum() >= -wts[wts < 0].sum() else -1
    keep = wts * sign > 0
    # decode as the shader does: pow(texel, gamma) * scale (Blender's pixels are the stored bytes / 255)
    dec = np.power(np.clip(cols, 0, 1), L.get("gamma", 1)) * L.get("scale", 4)
    nv = np.array(nv); nv /= np.linalg.norm(nv, axis=1, keepdims=True) + 1e-9
    sh = np.array(L["sh"])  # 3 x 9
    lit = np.maximum(sh9(nv) @ sh.T, 0) * np.power(np.maximum(np.array(aos), 1e-3), L.get("k", 0))[:, None]
    rad = np.maximum(lit, L.get("floor", 0.03)) * dec
    hem = np.maximum(np.maximum(sh9(hemi) @ sh.T, 0).mean(0), L.get("floor", 0.03))
    med = []
    for c in range(3):
        v, ww = rad[keep, c] / hem[c], wts[keep] * sign
        idx = np.argsort(v); cw = np.cumsum(ww[idx]); med.append(float(v[idx][np.searchsorted(cw, cw[-1] / 2)]))
    out[o.name] = med
    print("RATIOMEAN", o.name, [round(m, 3) for m in med], "faces seen", int(keep.sum()), "/", len(keep))
if write:
    fit["ratioMean"] = out
    json.dump(fit, open(fitp, "w"), indent=1)
    print("WROTE", fitp)
