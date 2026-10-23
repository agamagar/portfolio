# Multi-view fit from the target sheet: what it can and cannot give (23-24 Oct)

`skin_masks.py` cuts the skin-only mask (face, ears, neck) of the heads where it is separable (quiff_ci, curly, vitiligo_fade, silver_nasal; the chef and scar
heads blend into the pale background and need a hand mask). `fit_head_views.py` fits shared shape parameters plus a pose per view by maximising silhouette IoU
(differential evolution, then Powell). Result: mean IoU 0.88 (0.88 / 0.91 / 0.81 / 0.91), `fit_views.png` (grey = both, orange = fit only, blue = target only).

**Do not apply these parameters to the head.** The fit is degenerate:
- All 12 heads are the same kind of view (face turned 30-45 degrees towards the viewer's right, a little from above). The optimiser's per-view yaws came out
  43 to 73 degrees apart for what is one camera, and the depth parameter collapsed to 0.63 of the width to absorb error. One consistent angle cannot fix
  depth: width and height are well constrained, depth and the jaw's forward curve are not.
- Hair and hats hide the cranium in most heads, so only the face and ear outline constrain the shape.
So the sheet fixes the head's width/height/jaw outline/ear size, and nothing about its depth or profile.

## What would fix it
A front / 3-4 / side / back turnaround of the SAME head (the chef) with the hair and hat removed or kept consistent, from an image model or an artist. With
three or four true angles, this fit becomes well posed (same code, add the views and masks), and the sculpt pass can use per-view LPIPS.
