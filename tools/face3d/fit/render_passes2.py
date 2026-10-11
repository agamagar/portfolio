# Passes for the lighting fit, without the compositor:
#   Blender -b face_warped.blend -P render_passes2.py -- PARAMS.json OUTDIR W H [SAVE.blend]
# 1. bakes ambient occlusion into a colour attribute "AO" on every part (the site uses it)
# 2. casts one ray per pixel from the fitted camera into a BVH of all triangles and saves
#    the smooth normal (camera space), the AO and the part id at each pixel as .npy
import bpy, sys, os, json
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from fitcam import fitted_camera

argv = sys.argv[sys.argv.index("--") + 1:]
P = json.load(open(argv[0]))
OUT, W, H = argv[1], int(argv[2]), int(argv[3])
SAVE = argv[4] if len(argv) > 4 else None
os.makedirs(OUT, exist_ok=True)
sc = bpy.context.scene
cam = fitted_camera(bpy, P)
sc.render.resolution_x, sc.render.resolution_y = W, H
sc.render.resolution_percentage = 100

IDS = {"Hair": 2, "EyeL": 3, "EyeR": 3, "BrowL": 4, "BrowR": 4, "Mouth": 5, "MouthInner": 6}
PROPS = ("Hat", "HatBand", "Pin")
objs = [o for o in sc.objects if o.type == "MESH" and o.name not in PROPS]
for o in objs:
    o.hide_render = False  # the warp pass hid some parts from its id renders
    if o.data.shape_keys:
        for kb in o.data.shape_keys.key_blocks[1:]:
            kb.value = 0.0
for o in sc.objects:
    if o.type == "MESH" and o.name in PROPS:
        o.hide_render = True

# ---- 1. bake AO to a colour attribute on each part
sc.render.engine = "CYCLES"
sc.cycles.samples = 64
sc.cycles.device = "CPU"
if sc.world is None:
    sc.world = bpy.data.worlds.new("w")
sc.world.light_settings.distance = 0.5
for o in objs:
    me = o.data
    if "AO" not in me.color_attributes:
        me.color_attributes.new("AO", "FLOAT_COLOR", "POINT")
    me.color_attributes.active_color = me.color_attributes["AO"]
    bpy.ops.object.select_all(action="DESELECT")
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.bake(type="AO", target="VERTEX_COLORS")
print("BAKED AO", flush=True)

# was each vertex visible from the fitted camera at rest? (green channel of the AO colour;
# the site's fitted look only trusts the reference texture where it was)
_dg = bpy.context.evaluated_depsgraph_get()
_vs, _ps, _base = [], [], 0
vis_objs = [o for o in objs if o.name not in ("LidL", "LidR", "MouthInner")]
for o in vis_objs:
    me = o.evaluated_get(_dg).to_mesh()
    mw = o.matrix_world
    _vs += [mw @ v.co for v in me.vertices]
    _ps += [[_base + i for i in p.vertices] for p in me.polygons]
    _base += len(me.vertices)
    o.evaluated_get(_dg).to_mesh_clear()
_bvh = BVHTree.FromPolygons(_vs, _ps)
_org = cam.matrix_world.translation
for o in objs:
    me = o.data
    aoa = me.color_attributes.get("AO")
    if aoa is None or aoa.domain != "POINT":
        continue
    basis = me.shape_keys.key_blocks[0].data if me.shape_keys else me.vertices
    mw = o.matrix_world
    nm = mw.to_3x3().inverted().transposed()
    for i in range(len(me.vertices)):
        # from just above the surface toward the camera: blocked means hidden at rest
        # (starting off the surface keeps a vertex on an outline from hitting its own faces)
        p = mw @ basis[i].co + (nm @ me.vertices[i].normal).normalized() * 0.015
        d = _org - p
        hit, _, _, _ = _bvh.ray_cast(p, d.normalized(), d.length)
        c = aoa.data[i].color
        aoa.data[i].color = (c[0], 0.0 if hit is not None else 1.0, c[2], 1.0)
print("VISIBILITY done", flush=True)
if SAVE:
    bpy.ops.wm.save_as_mainfile(filepath=SAVE)

# ---- 2. one ray per pixel
dg = bpy.context.evaluated_depsgraph_get()
verts, tris, tri_obj, nrm_corner, ao_corner, uv_corner, tri_mesh, tri_tile = [], [], [], [], [], [], [], []
MESH_NAMES = [o.name for o in objs]
base = 0
# the rays skip the parts the fitted look hides at rest (lids, lip), so the skin behind them
# gets the reference's own eye edges and smile crease
ray_objs = [o for o in objs if o.name not in ("LidL", "LidR", "MouthInner")]
MESH_NAMES = [o.name for o in ray_objs]
for oi, o in enumerate(ray_objs):
    ev = o.evaluated_get(dg)
    me = ev.to_mesh()
    me.calc_loop_triangles()
    mw = o.matrix_world
    nm = mw.to_3x3().inverted().transposed()
    co = [mw @ v.co for v in me.vertices]
    verts += co
    aoa = me.color_attributes.get("AO")
    ao_v = [aoa.data[i].color[0] for i in range(len(me.vertices))] if aoa is not None and aoa.domain == "POINT" else [1.0] * len(me.vertices)
    cn = me.corner_normals
    uvl = me.uv_layers.active
    ta = me.attributes.get("tile")
    for t in me.loop_triangles:
        tri_tile.append(ta.data[t.polygon_index].value if ta is not None else 0)
        uv_corner.append([uvl.data[l].uv[:] if uvl else (0.0, 0.0) for l in t.loops])
        tri_mesh.append(oi)
        tris.append([base + v for v in t.vertices])
        tri_obj.append(IDS.get(o.name, 1))
        nrm_corner.append([(nm @ Vector(cn[l].vector)).normalized()[:] for l in t.loops])
        ao_corner.append([ao_v[v] for v in t.vertices])
    base += len(co)
    ev.to_mesh_clear()
bvh = BVHTree.FromPolygons(verts, tris)
V = np.array([v[:] for v in verts]); T = np.array(tris); NC = np.array(nrm_corner); AC = np.array(ao_corner); TO = np.array(tri_obj)
UC = np.array(uv_corner); TM = np.array(tri_mesh); TT = np.array(tri_tile)

frame = [cam.matrix_world @ v for v in cam.data.view_frame(scene=sc)]  # tr, br, bl, tl
tr, br, bl, tl = frame
org = cam.matrix_world.translation
hit_i, hit_f, hit_p = [], [], []
for j in range(H):
    v = (j + 0.5) / H
    left = tl.lerp(bl, v); right = tr.lerp(br, v)
    for i in range(W):
        p = left.lerp(right, (i + 0.5) / W)
        loc, _, fi, _ = bvh.ray_cast(org, (p - org).normalized())
        if fi is not None:
            hit_i.append(j * W + i); hit_f.append(fi); hit_p.append(loc[:])
hit_i, hit_f, hit_p = np.array(hit_i), np.array(hit_f), np.array(hit_p)
A, B, C = V[T[hit_f, 0]], V[T[hit_f, 1]], V[T[hit_f, 2]]
v0, v1, v2 = B - A, C - A, hit_p - A
dot = lambda x, y: (x * y).sum(1)
d00, d01, d11, d20, d21 = dot(v0, v0), dot(v0, v1), dot(v1, v1), dot(v2, v0), dot(v2, v1)
den = d00 * d11 - d01 * d01; den[den == 0] = 1e-12
wb = (d11 * d20 - d01 * d21) / den; wc = (d00 * d21 - d01 * d20) / den; wa = 1 - wb - wc
n = wa[:, None] * NC[hit_f, 0] + wb[:, None] * NC[hit_f, 1] + wc[:, None] * NC[hit_f, 2]
n /= np.linalg.norm(n, axis=1, keepdims=True) + 1e-9
normal = np.zeros((H * W, 3), np.float32); ao = np.zeros(H * W, np.float32); idx = np.zeros(H * W, np.int16)
normal[hit_i] = n
ao[hit_i] = wa * AC[hit_f, 0] + wb * AC[hit_f, 1] + wc * AC[hit_f, 2]
idx[hit_i] = TO[hit_f]
normal, ao, idx = normal.reshape(H, W, 3), ao.reshape(H, W), idx.reshape(H, W)
uv = np.full((H * W, 2), -1, np.float32); mesh = np.full(H * W, -1, np.int16)
uv[hit_i] = wa[:, None] * UC[hit_f, 0] + wb[:, None] * UC[hit_f, 1] + wc[:, None] * UC[hit_f, 2]
mesh[hit_i] = TM[hit_f]
tile = np.zeros(H * W, np.int8); tile[hit_i] = TT[hit_f]
np.save(os.path.join(OUT, "tile.npy"), tile.reshape(H, W))
np.save(os.path.join(OUT, "uv.npy"), uv.reshape(H, W, 2))
np.save(os.path.join(OUT, "mesh.npy"), mesh.reshape(H, W))
json.dump(MESH_NAMES, open(os.path.join(OUT, "meshes.json"), "w"))
np.save(os.path.join(OUT, "normal.npy"), normal)
np.save(os.path.join(OUT, "ao.npy"), ao[..., None])
np.save(os.path.join(OUT, "indexob.npy"), idx[..., None].astype(np.float32))
np.save(os.path.join(OUT, "alpha.npy"), (idx > 0)[..., None].astype(np.float32))
np.save(os.path.join(OUT, "camrot.npy"), np.array(cam.matrix_world.to_3x3()))
print("PASSES DONE", OUT, flush=True)
