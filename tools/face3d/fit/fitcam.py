# The fitted camera, shared by render_ids.py, apply_warp.py and render_passes.py.
import math
from mathutils import Vector, Matrix


def fitted_camera(bpy, P, name="fitcam"):
    sc = bpy.context.scene
    cam = bpy.data.objects.get(name)
    if cam is None:
        cam = bpy.data.objects.new(name, bpy.data.cameras.new(name))
        sc.collection.objects.link(cam)
    cd = cam.data
    cd.sensor_fit = "VERTICAL"
    cd.angle_y = math.radians(P["cam_fov"])
    cd.shift_x, cd.shift_y = P.get("cam_sx", 0.0), P.get("cam_sy", 0.0)
    yaw, pitch, d = math.radians(P["cam_yaw"]), math.radians(P["cam_pitch"]), P["cam_dist"]
    target = Vector((P.get("cam_tx", 0.0), 0, P["cam_tz"]))
    loc = target + Vector((-math.sin(yaw) * math.cos(pitch), -math.cos(yaw) * math.cos(pitch), math.sin(pitch))) * d
    view = (target - loc).normalized()
    R = Matrix.Rotation(math.radians(P["cam_roll"]), 4, view) @ view.to_track_quat("-Z", "Y").to_matrix().to_4x4()
    R.translation = loc
    cam.matrix_world = R
    sc.camera = cam
    return cam
