# Clean skin textures for the hero's clay and noir heads (2026-10-12).
#
# Why: the fitted skin texture is projected from the reference photo, so the eyes, brows and the
# mouth's crease are painted into it. The shader shows that "raw" skin at rest and fades to the
# "clean" skin (the GLB's albedo-ratio map) while a feature moves (uActs x margins). But the GLB's
# clean map still carried the features (a faint smile crease, eye-socket rings, pale brow smudges),
# and noir's has no raw/clean split at all, so on every emote the painted copy stayed behind: two
# mouths, a shadow where an eye was, ghost brows.
#
# What this does, offline, into NEW files (the GLBs and fit files are not touched):
#   skin-clean.png        clay: the GLB's skin map with the feature regions inpainted
#   skin-clean-noir.png   noir: the same
#   skin-raw-noir.png     noir: the GLB's original map (features in), the "raw" skin at rest
#   margins-noir.png      noir: where its features are (R eyes, G brows, B mouth), from the id pass
# faceRig3D.js loads them (CLEAN_SKIN) and gives noir the raw / margin fade clay already had.
#
# Inputs, dumped from the live rigs by the harness (see Claude/2026-10-11_hero-morph.md, Round 18):
#   gat/<rig>_skinmap.png   the rig's skin map (1604 x 862: the skin layer left, the hair layer right)
#   gat/<rig>_ids.bin       the id pass at rest, 802 x 862 uint8, bottom-up rows (3/4 eyes, 5/6 brows, 7 mouth)
# Usage: python3 clean_skin.py GAT_DIR OUT_DIR   (OUT_DIR = public/faces)
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from skimage.restoration import inpaint_biharmonic

W, H = 802, 862
gat, out = sys.argv[1], sys.argv[2]


def ids_of(rig):
    return np.fromfile(f"{gat}/{rig}_ids.bin", dtype=np.uint8).reshape(H, W)[::-1]  # to top-down rows


def disk(r):
    y, x = np.ogrid[-r:r + 1, -r:r + 1]
    return x * x + y * y <= r * r


def grow(mask, r):
    return ndi.binary_dilation(mask, structure=disk(r)) if r > 0 else mask


def margins_from_ids(ids, d_eye, d_brow, d_mouth):
    eyes = grow(np.isin(ids, (3, 4)), d_eye)
    brows = grow(np.isin(ids, (5, 6)), d_brow)
    mouth = grow(ids == 7, d_mouth)
    return eyes, brows, mouth


def soft(mask, s=5):
    return np.clip(ndi.gaussian_filter(mask.astype(float), s) * 1.6, 0, 1)


def diffuse_fill(rgb, mask, iters=900):
    """Fill the masked pixels of rgb (H x W x 3, 0..1) by diffusion: start from the nearest known
    pixel, then relax toward the mean of the four neighbours (a harmonic fill, smooth like skin)."""
    out = rgb.copy()
    idx = ndi.distance_transform_edt(mask, return_distances=False, return_indices=True)
    out[mask] = rgb[idx[0][mask], idx[1][mask]]
    for it in range(iters):
        avg = 0.25 * (np.roll(out, 1, 0) + np.roll(out, -1, 0) + np.roll(out, 1, 1) + np.roll(out, -1, 1))
        out[mask] = avg[mask]
    return out


def residual(lum, ids, ring):
    """Pixels still darker than their surroundings near a feature (what the first pass missed).
    ring: (ids, search radius, darkness threshold): the mouth's crease has a long soft falloff, so
    it gets a wider window and a lower threshold."""
    bg = np.kron(ndi.median_filter(lum[::2, ::2], size=25), np.ones((2, 2)))[:H, :W]
    out = np.zeros(lum.shape, bool)
    for codes, pad, thr in ring:
        out |= ((bg - lum) > thr) & grow(np.isin(ids, codes), pad)
    return out


def inpaint_skin(skin_rgba, mask, ids, rounds=7):
    """Inpaint the skin layer (left half) where mask is set, then again where the feature's marks
    are still darker than their surroundings; the hair layer (right half) is kept."""
    arr = np.asarray(skin_rgba).astype(float) / 255.0
    rgb = arr[:, :W, :3]
    ring = [((3, 4), 28, 8), ((5, 6), 22, 8), ((7,), 62, 5)]
    m = mask.copy()
    res = rgb
    for r in range(rounds):
        res = diffuse_fill(rgb, grow(m, 2))
        lum = (0.299 * res[..., 0] + 0.587 * res[..., 1] + 0.114 * res[..., 2]) * 255
        more = residual(lum, ids, ring)
        print("  round", r, "residual dark px", int(more.sum()))
        if more.sum() < 40:
            break
        m = m | grow(more, 4)
    else:  # the last round's residue is covered too
        m = m | grow(more, 4)
        res = diffuse_fill(rgb, grow(m, 2))
    f = soft(grow(m, 2), 2.0)[..., None]
    outarr = arr.copy()
    outarr[:, :W, :3] = rgb * (1 - f) + res * f   # feathered into its surroundings
    return Image.fromarray(np.clip(outarr * 255 + 0.5, 0, 255).astype("uint8"), "RGBA")


# ---- clay: the existing margins, a little larger, are the mask ----
mclay = np.asarray(Image.open(f"{out}/margins.png").convert("RGB"))
clay_mask = grow((mclay[..., :2] > 40).any(axis=2), 6) | grow(mclay[..., 2] > 40, 16)  # the mouth gets more
clay = Image.open(f"{gat}/clay_skinmap.png").convert("RGBA")
print("clay"); inpaint_skin(clay, clay_mask, ids_of("clay")).save(f"{out}/skin-clean.png")

# ---- noir: margins from its own id pass, grown to clay's proportions, then the same inpaint ----
nids = ids_of("noir")
eyes, brows, mouth = margins_from_ids(nids, 12, 11, 24)
nm = np.stack([soft(eyes), soft(brows), soft(mouth)], axis=-1)
Image.fromarray((nm * 255).astype("uint8"), "RGB").save(f"{out}/margins-noir.png")
noir = Image.open(f"{gat}/noir_skinmap.png").convert("RGBA")
noir.save(f"{out}/skin-raw-noir.png")
print("noir"); inpaint_skin(noir, grow(eyes | brows | mouth, 4), nids).save(f"{out}/skin-clean-noir.png")
print("wrote skin-clean.png, skin-clean-noir.png, skin-raw-noir.png, margins-noir.png to", out)


# ---- clay margins, widened: the shader shows the raw skin wherever a margin is 0, so any painted mark
# outside the hand-made margins (the mouth's crease, brow smudges) would stay. Add every pixel where the
# raw and clean skins differ to the margin of the nearest feature channel (R eyes, G brows, B mouth). ----
raw = np.asarray(Image.open(f"{out}/skin-raw.png").convert("RGB")).astype(float)[:, :W]
cln = np.asarray(Image.open(f"{out}/skin-clean.png").convert("RGB")).astype(float)[:, :W]
diff = grow(np.abs(raw - cln).max(axis=2) > 6, 3)
mc = mclay.astype(float) / 255.0
have = mc.max(axis=2) > 0.16
idx = ndi.distance_transform_edt(~have, return_distances=False, return_indices=True)
ch = np.argmax(mc, axis=2)[idx[0], idx[1]]                      # nearest feature's channel
add = soft(diff, 3)
for c in range(3):
    mc[..., c] = np.maximum(mc[..., c], add * (ch == c))
Image.fromarray((np.clip(mc, 0, 1) * 255 + 0.5).astype("uint8"), "RGB").save(f"{out}/margins-clay.png")
print("wrote margins-clay.png")
