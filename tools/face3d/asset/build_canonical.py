# build_canonical.py : the canonical head, step 1 (symmetry). blender -b tools/face3d/face.blend -P this -- OUT.blend
# The source Skin is a near-symmetric sculpt whose topology is not mirrored (40% of vertices have no partner). Here the near side (x <= 0: the
# side the reference photos show) is the master: the mesh is bisected at x = 0, the far half dropped, the seam snapped to x = 0, and the master
# mirrored into a new far half, so every vertex has an exact partner (index mirror map saved as a vertex attribute `mirror`). Shape keys follow:
# the master half's deltas make the Left key, mirrored (x negated) the Right key; jaw/puff are symmetric.
import bpy, bmesh, sys, json
from mathutils import Vector
out = sys.argv[sys.argv.index("--") + 1]
sk = bpy.data.objects["Skin"]; me = sk.data
keys = [kb.name for kb in me.shape_keys.key_blocks][1:]
bm = bmesh.new(); bm.from_mesh(me)
shape = {n: bm.verts.layers.shape[n] for n in keys}
geom = list(bm.verts) + list(bm.edges) + list(bm.faces)
bmesh.ops.bisect_plane(bm, geom=geom, plane_co=(0, 0, 0), plane_no=(1, 0, 0), clear_outer=True, clear_inner=False, dist=1e-6)
# clear_outer keeps the x<0 side (the plane normal points to +x = "outer"): check
xs = [v.co.x for v in bm.verts]
print("after bisect: x range", min(xs), max(xs), "verts", len(bm.verts))
for v in bm.verts:
    if abs(v.co.x) < 5e-4:
        v.co.x = 0.0
        for n in keys: v[shape[n]].x = 0.0 if abs(v[shape[n]].x) < 5e-3 else v[shape[n]].x
# the symmetry plane's boundary verts must stay on the plane in every key too
for v in bm.verts:
    if v.co.x == 0.0:
        for n in keys: v[shape[n]].x = 0.0
master = len(bm.verts)
idx = {v: i for i, v in enumerate(bm.verts)}
geom = list(bm.verts) + list(bm.edges) + list(bm.faces)
bmesh.ops.mirror(bm, geom=geom, axis="X", merge_dist=1e-5)
bm.verts.ensure_lookup_table(); bm.faces.ensure_lookup_table()
# the mirrored faces came out flipped: recalc normals outward
bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
# (bmesh.ops.mirror mirrors the shape-key coordinates with the positions: no manual negation)
print("verts", len(bm.verts), "faces", len(bm.faces))
mesh = bpy.data.meshes.new("SkinCanon")
obj = bpy.data.objects.new("SkinCanon", mesh); bpy.context.scene.collection.objects.link(obj)
# (bmesh writes shape keys only into a mesh that already has key blocks: create them first, in the source's order)
obj.shape_key_add(name="Basis", from_mix=False)
for n in keys: obj.shape_key_add(name=n, from_mix=False)
bm.to_mesh(mesh)
# partner index by position
kd = __import__("mathutils").kdtree.KDTree(len(mesh.vertices))
for i, v in enumerate(mesh.vertices): kd.insert(v.co, i)
kd.balance()
mir = [kd.find(Vector((-v.co.x, v.co.y, v.co.z)))[1] for v in mesh.vertices]
# LEFT / RIGHT keys: the master half (x < 0) holds one side's real deltas; the pair is rebuilt so each key moves ONE side only:
# the key whose source delta on x < 0 is the larger one is the x < 0 side's (named ...Right: the face's right is the viewer's left), and its
# partner is that same delta mirrored onto x > 0 (via the index mirror map). Symmetric keys (jaw, puff) stay as they are.
kbs = mesh.shape_keys.key_blocks; basis = kbs["Basis"]
def dmax(k): return max(((k.data[i].co - basis.data[i].co).length for i in range(len(basis.data)) if basis.data[i].co.x < -1e-6), default=0)
pairs = [(n[:-4], n, n[:-4] + "Right") for n in keys if n.endswith("Left") and n[:-4] + "Right" in keys]
for stem, ln, rn in pairs:
    a, b = kbs[ln], kbs[rn]
    big, small = (a, b) if dmax(a) >= dmax(b) else (b, a)
    # big lives on x < 0: zero it on x > 0; the partner on x > 0 is its mirror image
    for i, bv in enumerate(basis.data):
        d = big.data[i].co - bv.co
        if bv.co.x > 1e-6: big.data[i].co = bv.co.copy(); 
    for i, bv in enumerate(basis.data):
        if bv.co.x > 1e-6:
            j = mir[i]; dj = big.data[j].co - basis.data[j].co
            small.data[i].co = bv.co + Vector((-dj.x, dj.y, dj.z))
        else:
            small.data[i].co = bv.co.copy()
    # the key on the x < 0 side is named ...Right (the face's right); swap names if the big one was called Left
    if big is a: a.name, b.name = rn + "_tmp", ln; a.name = rn
print("pairs rebuilt:", [p[1:] for p in pairs])
for p in mesh.polygons: p.use_smooth = True   # (the mirrored half had lost the smooth flag: the stippled look on that side)
maxd = max((mesh.vertices[mir[i]].co - Vector((-v.co.x, v.co.y, v.co.z))).length for i, v in enumerate(mesh.vertices))
print("mirror max distance", maxd)
attr = mesh.attributes.new("mirror", "INT", "POINT")
for i, m in enumerate(mir): attr.data[i].value = m
bpy.ops.wm.save_as_mainfile(filepath=out)
json.dump({"verts": len(mesh.vertices), "faces": len(mesh.polygons), "mirror_max_dist": maxd, "keys": keys}, open(out + ".json", "w"))
