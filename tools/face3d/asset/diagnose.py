# diagnose.py : headless diagnosis of the head asset (blender -b tools/face3d/face.blend -P tools/face3d/asset/diagnose.py -- OUT.json)
# Per mesh: topology (tris/quads/ngons, boundary and non-manifold edges, loose verts, poles), UVs (islands, overlap, UV area share, texel density
# spread in px/m for a 1604x862 map), shape keys (names, max delta, which verts move), symmetry (mirror vertex match about x = 0).
import bpy, bmesh, sys, json, math
from mathutils import Vector
out = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "/tmp/diagnose.json"
TEX_W, TEX_H = 1604, 862
res = {}
for o in bpy.data.objects:
    if o.type != "MESH": continue
    me = o.data; bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table(); bm.edges.ensure_lookup_table(); bm.faces.ensure_lookup_table()
    r = {"verts": len(bm.verts), "faces": len(bm.faces), "tris": sum(1 for f in bm.faces if len(f.verts) == 3), "quads": sum(1 for f in bm.faces if len(f.verts) == 4), "ngons": sum(1 for f in bm.faces if len(f.verts) > 4)}
    r["boundary_edges"] = sum(1 for e in bm.edges if e.is_boundary); r["nonmanifold_edges"] = sum(1 for e in bm.edges if not e.is_manifold and not e.is_boundary)
    r["loose_verts"] = sum(1 for v in bm.verts if not v.link_edges)
    val = {}
    for v in bm.verts: val[len(v.link_edges)] = val.get(len(v.link_edges), 0) + 1
    r["valence_hist"] = {str(k): val[k] for k in sorted(val)}
    r["poles_gt5"] = sum(c for k, c in val.items() if k > 5); r["poles_3"] = val.get(3, 0)
    # symmetry about x = 0 (world, object transform assumed identity-ish)
    pts = [o.matrix_world @ v.co for v in bm.verts]
    grid = {}
    for i, p in enumerate(pts): grid.setdefault((round(p.x / 0.004), round(p.y / 0.004), round(p.z / 0.004)), []).append(i)
    miss = 0
    for p in pts:
        k = (round(-p.x / 0.004), round(p.y / 0.004), round(p.z / 0.004))
        if not any((k[0] + dx, k[1] + dy, k[2] + dz) in grid for dx in (-1, 0, 1) for dy in (-1, 0, 1) for dz in (-1, 0, 1)): miss += 1
    r["unmirrored_verts"] = miss; r["unmirrored_pct"] = round(100 * miss / max(1, len(pts)), 1)
    # UVs
    uvl = bm.loops.layers.uv.active
    if uvl:
        # islands by shared UV coords across faces (union-find on faces via edges whose loop UVs match)
        parent = list(range(len(bm.faces)))
        def find(a):
            while parent[a] != a: parent[a] = parent[parent[a]]; a = parent[a]
            return a
        for e in bm.edges:
            fs = list(e.link_faces)
            if len(fs) != 2: continue
            f0, f1 = fs
            def uvs(f):
                d = {}
                for l in f.loops:
                    if l.edge == e: d[l.vert.index] = (round(l[uvl].uv.x, 4), round(l[uvl].uv.y, 4))
                return d
            a, b = uvs(f0), uvs(f1)
            if a and b and all(a.get(k) == b.get(k) for k in a): parent[find(f0.index)] = find(f1.index)
        isl = {}
        for f in bm.faces: isl.setdefault(find(f.index), []).append(f)
        r["uv_islands"] = len(isl)
        uvarea = 0.0; dens = []; flipped = 0
        for f in bm.faces:
            uv = [l[uvl].uv for l in f.loops]
            a = 0.0
            for i in range(len(uv)): a += uv[i].x * uv[(i + 1) % len(uv)].y - uv[(i + 1) % len(uv)].x * uv[i].y
            a *= 0.5; uvarea += abs(a)
            if a < 0: flipped += 1
            area3 = f.calc_area() * (o.matrix_world.to_scale().x ** 2)
            if area3 > 1e-9 and abs(a) > 1e-12: dens.append(math.sqrt(abs(a) * TEX_W * TEX_H / area3))
        r["uv_flipped_faces"] = flipped; r["uv_area_share"] = round(uvarea, 3)
        if dens:
            dens.sort(); n = len(dens)
            r["texel_density_px_per_unit"] = {"p5": round(dens[int(n * .05)], 1), "p50": round(dens[n // 2], 1), "p95": round(dens[int(n * .95)], 1), "max_over_min_p5_p95": round(dens[int(n * .95)] / max(dens[int(n * .05)], 1e-6), 1)}
        # overlap: rasterise island ids to a 256 grid, count cells claimed by 2+ islands
        G = 256; cell = {}; over = 0
        for iid, fs in isl.items():
            seen = set()
            for f in fs:
                uv = [l[uvl].uv for l in f.loops]
                xs = [u.x for u in uv]; ys = [u.y for u in uv]
                for gx in range(int(min(xs) * G), int(max(xs) * G) + 1):
                    for gy in range(int(min(ys) * G), int(max(ys) * G) + 1): seen.add((gx, gy))
            for c in seen: cell.setdefault(c, set()).add(iid)
        r["uv_bbox_overlap_cells_pct"] = round(100 * sum(1 for v in cell.values() if len(v) > 1) / max(1, len(cell)), 1)
        # seam length: edges whose two faces disagree on uv
        seam = sum(1 for e in bm.edges if len(e.link_faces) == 2 and find(e.link_faces[0].index) != find(e.link_faces[1].index))
        r["uv_seam_edges"] = seam
    else:
        r["uv_islands"] = None
    # shape keys
    if me.shape_keys:
        base = me.shape_keys.reference_key; ks = {}
        for kb in me.shape_keys.key_blocks:
            if kb == base: continue
            mx = 0.0; moved = 0
            for i, v in enumerate(kb.data):
                d = (v.co - base.data[i].co).length
                if d > 1e-5: moved += 1
                mx = max(mx, d)
            ks[kb.name] = {"max_delta": round(mx, 4), "verts_moved": moved}
        r["shape_keys"] = ks
    r["bbox"] = [[round(c, 3) for c in min((o.matrix_world @ Vector(c)) for c in o.bound_box)], [round(c, 3) for c in max((o.matrix_world @ Vector(c)) for c in o.bound_box)]]
    res[o.name] = r; bm.free()
json.dump(res, open(out, "w"), indent=1)
print("wrote", out, len(res), "meshes")
