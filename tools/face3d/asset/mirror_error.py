# mirror_error.py : how far each Skin vertex is from the nearest vertex of its mirror image (x -> -x). (blender -b face.blend -P this)
import bpy, bmesh, json, sys
from mathutils import Vector, kdtree
out = sys.argv[sys.argv.index("--") + 1]
o = bpy.data.objects["Skin"]; me = o.data
pts = [o.matrix_world @ v.co for v in me.vertices]
kd = kdtree.KDTree(len(pts))
for i, p in enumerate(pts): kd.insert(p, i)
kd.balance()
ds = sorted(kd.find(Vector((-p.x, p.y, p.z)))[2] for p in pts)
n = len(ds)
# also by region: the far half (x>0) vs near half
def band(lo, hi, f): 
    a = sorted(kd.find(Vector((-p.x, p.y, p.z)))[2] for p in pts if f(p))
    return {"n": len(a), "p50": round(a[len(a)//2], 4), "p90": round(a[int(len(a)*.9)], 4)} if a else None
res = {"all": {"p50": round(ds[n//2], 4), "p90": round(ds[int(n*.9)], 4), "p99": round(ds[int(n*.99)], 4), "max": round(ds[-1], 4)},
       "head_width": round(max(p.x for p in pts) - min(p.x for p in pts), 3),
       "x_gt_0_face": band(0, 0, lambda p: p.x > 0.05 and p.z > 0.3), "x_lt_0_face": band(0, 0, lambda p: p.x < -0.05 and p.z > 0.3),
       "ears_x>1": band(0, 0, lambda p: p.x > 1.0), "ears_x<-1": band(0, 0, lambda p: p.x < -1.0)}
# triangle vs quad layout by side
bm = bmesh.new(); bm.from_mesh(me); bm.faces.ensure_lookup_table()
side = {"L": [0, 0], "R": [0, 0]}
for f in bm.faces:
    c = o.matrix_world @ f.calc_center_median(); s = "L" if c.x < 0 else "R"; side[s][0 if len(f.verts) == 3 else 1] += 1
res["tris_quads_by_side"] = side
json.dump(res, open(out, "w"), indent=1); print(json.dumps(res))
