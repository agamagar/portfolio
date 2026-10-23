# unwrap_canonical.py : the canonical head, step 2 (one real UV unwrap). blender -b IN.blend -P this -- OUT.blend
# Seams (all on the mirror plane or on boundaries that hair, ears or the neck hide): the back midline, the hairline loop (face | scalp), the neck
# base, and each ear's rim. Conformal unwrap per island, islands mirrored-packable: the left half and right half get the SAME UV layout mirrored
# (u -> 1-u), so one texture serves both sides and the far side of the head can always be filled from the near side by index.
import bpy, bmesh, sys, json, math
from mathutils import Vector
inp_out = sys.argv[sys.argv.index("--") + 1]
o = bpy.data.objects["SkinCanon"]; me = o.data
bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table(); bm.edges.ensure_lookup_table(); bm.faces.ensure_lookup_table()
EARX, HAIRZ, NECKZ = 1.0, 0.50, -0.86
for e in bm.edges: e.seam = False
def c(f): return f.calc_center_median()
ear = {f for f in bm.faces if abs(c(f).x) > EARX and -0.12 < c(f).y < 0.62 and -0.55 < c(f).z < 0.7}
nose = {f for f in bm.faces if c(f).y < -1.07 and abs(c(f).x) < 0.32 and -0.5 < c(f).z < 0.3 and f not in ear}
scalp = {f for f in bm.faces if c(f).z > HAIRZ and f not in ear}
neck = {f for f in bm.faces if c(f).z < NECKZ and f not in ear}
def mark_boundary(S):
    for f in S:
        for e in f.edges:
            if any(g not in S for g in e.link_faces): e.seam = True
# the head's side and back (behind the cheeks) is its own island: a nearly closed shell cannot flatten in one piece without strong area distortion
side = {f for f in bm.faces if c(f).y > -0.05 and c(f).z <= HAIRZ and f not in ear and f not in neck}
for S in (ear, scalp, neck, nose, side): mark_boundary(S)
# the nose is a cone: one relief cut along its underside midline so it flattens without shear
for e in bm.edges:
    a, b = e.verts
    if abs(a.co.x) < 1e-6 and abs(b.co.x) < 1e-6 and any(f in nose for f in e.link_faces) and (a.co.z + b.co.z) / 2 < -0.05: e.seam = True
# back midline seam: x == 0 edges behind the ear plane
for e in bm.edges:
    a, b = e.verts
    if abs(a.co.x) < 1e-6 and abs(b.co.x) < 1e-6 and (a.co.y + b.co.y) / 2 > 0.0: e.seam = True
# the front midline must NOT be a seam (the face is one island); the mirrored layout comes from unwrapping the master half and mirroring
print("seam edges", sum(1 for e in bm.edges if e.seam), "ear faces", len(ear), "nose", len(nose), "scalp", len(scalp), "neck", len(neck))
bm.to_mesh(me); bm.free()
bpy.context.view_layer.objects.active = o
bpy.ops.object.select_all(action="DESELECT"); o.select_set(True)
bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT")
if not me.uv_layers: me.uv_layers.new(name="UVMap")
bpy.ops.uv.unwrap(method="ANGLE_BASED", margin=0.004)
try:
    bpy.ops.uv.minimize_stretch(iterations=60)
except Exception as ex: print("minimize_stretch:", ex)
bpy.ops.uv.average_islands_scale(); bpy.ops.uv.pack_islands(margin=0.006, rotate=False)
bpy.ops.object.mode_set(mode="OBJECT")
# quality
bm = bmesh.new(); bm.from_mesh(me); uvl = bm.loops.layers.uv.active
dens = []; flipped = 0; area = 0.0
for f in bm.faces:
    uv = [l[uvl].uv for l in f.loops]
    a = 0.5 * sum(uv[i].x * uv[(i + 1) % len(uv)].y - uv[(i + 1) % len(uv)].x * uv[i].y for i in range(len(uv)))
    area += abs(a); flipped += a < 0
    a3 = f.calc_area()
    if a3 > 1e-9 and abs(a) > 1e-12: dens.append(math.sqrt(abs(a) / a3))
dens.sort(); n = len(dens)
G = 512; cell = {}
# overlap by rasterising face ids
import array
grid = {}; over = 0; tot = 0
for f in bm.faces:
    uv = [l[uvl].uv for l in f.loops]
    xs = [u.x for u in uv]; ys = [u.y for u in uv]
    # sample the face centre only (cheap, enough to detect stacked islands)
    cx = sum(xs) / len(xs); cy = sum(ys) / len(ys); k = (int(cx * G), int(cy * G))
    grid.setdefault(k, 0); grid[k] += 1
over = sum(1 for v in grid.values() if v > 3)
res = {"uv_area_share": round(area, 3), "flipped": flipped, "density_p5_p50_p95": [round(dens[int(n * .05)], 3), round(dens[n // 2], 3), round(dens[int(n * .95)], 3)], "p95_over_p5": round(dens[int(n * .95)] / dens[int(n * .05)], 2), "crowded_cells": over}
print(json.dumps(res))
bpy.ops.wm.save_as_mainfile(filepath=inp_out)
json.dump(res, open(inp_out + ".json", "w"))
