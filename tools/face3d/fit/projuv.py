# Give the visible parts a UV map projected from the fitted camera: u, v = where the point
# lands in the reference frame. Skin and Hair get two layers side by side in u: layer 1 for
# faces that sit in front of another front-facing part of the same surface (the nose over
# the cheek, the ear rim over the head, one lock over another), layer 0 for the rest, so
# the surface behind an overlap keeps its own colour right up to the edge.
#   Blender -b IN.blend -P projuv.py -- PARAMS.json OUT.blend
import bpy, sys, os, json
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from bpy_extras.object_utils import world_to_camera_view
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from fitcam import fitted_camera
argv = sys.argv[sys.argv.index("--") + 1:]
P = json.load(open(argv[0]))
sc = bpy.context.scene
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = 802, 862, 100
cam = fitted_camera(bpy, P)
org = cam.matrix_world.translation
LAYERED = ("Skin", "Hair")
for name in ("Skin", "Hair", "EyeL", "EyeR", "BrowL", "BrowR", "Mouth", "LidL", "LidR"):
    o = bpy.data.objects[name]
    me = o.data
    for uv in list(me.uv_layers):
        me.uv_layers.remove(uv)
    lay = me.uv_layers.new(name="proj")
    basis = me.shape_keys.key_blocks[0].data if me.shape_keys else me.vertices
    mw = o.matrix_world
    wco = [mw @ basis[i].co for i in range(len(me.vertices))]
    pv = [world_to_camera_view(sc, cam, c) for c in wco]
    tile = [0] * len(me.polygons)
    if name in LAYERED:
        bvh = BVHTree.FromPolygons(wco, [list(p.vertices) for p in me.polygons])
        for p in me.polygons:
            c = sum((wco[v] for v in p.vertices), Vector()) / len(p.vertices)
            d = (c - org).normalized()
            # walk along the ray past this face: any later hit facing the camera means this
            # face covers another front-facing part of the same surface
            start = c + d * 1e-4
            for _ in range(6):
                loc, nrm, fi, _ = bvh.ray_cast(start, d)
                if fi is None:
                    break
                if nrm.dot(d) < 0:
                    tile[p.index] = 1
                    break
                start = loc + d * 1e-4
    attr = me.attributes.get("tile") or me.attributes.new("tile", "INT", "FACE")
    for p in me.polygons:
        attr.data[p.index].value = tile[p.index]
    # the lids sit in the skin texture's first layer (their pixels are skin at rest)
    half = name in LAYERED or name in ("LidL", "LidR")
    for p in me.polygons:
        for li in p.loop_indices:
            c = pv[me.loops[li].vertex_index]
            lay.data[li].uv = ((c.x + tile[p.index]) * 0.5, c.y) if half else (c.x, c.y)
    print("PROJUV", name, "occluder faces", sum(tile), "of", len(tile))
bpy.ops.wm.save_as_mainfile(filepath=argv[1])
print("PROJUV done")
