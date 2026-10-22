# Face gate baseline and fix list (22 Oct 2026, first full run, 26 faces; software GL, native 802x862)

Pass / warn / fail per check over 26 faces: holes 10/5/11, blackpix 25/1/0, stretch 5/20/1, symmetry 17/5/4, seams 20/4/2, lidcover 10/3/13,
ghosts 17/4/5, framing 0/10/16, aliasing 26/0/0, edges83 20/2/4, exposure 26/0/0, flicker 14/1/11, errors 26/0/0, loadmem 26/0/0, parts 18/2/6, browsers 26/0/0.
Faces: 24 fail, 2 warn (clay, print), 0 pass. Crops: `report/crops/<face>__<check>.png` (magenta = flagged px); metrics per face in `report/summary.json`.
Thresholds were calibrated on this run so Agam's named defects fail; read them in thresholds.json before trusting a "pass".

## For the 3D face session (face internals; the gate found them, the safe fixes do not)
1. **Blink does not close the eye** (lidcover, blinkclosed_front): riso 98% of the eye still visible, stone 99%, hose 53%, cel 48%. These skins' lids never cover the eye.
   Pale/off-colour lids: noir dL -16 (dark disc), cel dE 9.6 (24.9), stone dE 9.9, riso 8.2, pixel 6.9, claySun 5.1, felt 4.1. clay 1.7 is the reference.
   Do not copy the skin material onto the lids: tried (safeFixes `lid`), it made noir 17→38, stone 9.9→21, claySun 5→15, felt 4→9.
2. **Features baked into the skin texture ghost through emotes** (ghosts): pixel mouth 71% of the vacated mouth px not skin-coloured (emote_shy), riso mouth 66% (sad),
   noir brows 55% (grin), cel eyes 36% (angry), hose brows 26% (sad); stone 23, felt 18, claySun 18 (warn). The clean-skin map still carries those features.
3. **Melted far side** (symmetry, 3/4 left vs mirrored 3/4 right): noir 0.29, riso 0.20, stone 0.18, claySun 0.18, pixel 0.17, clay 0.15 (0.10 warn, 0.17 fail);
   plast is 0.03-0.06. Crops show the whole far cheek differing from the near side. riso also fails stretch (|L-R| projection stretch 0.12).
4. **Thin line artefacts on skin** (seams): pixel 217 line-px per 10k skin, noir 155 (the nose scratch), hose 158 (outline, by design: override), cel 123, clay 91.
5. **Edge halo at 83 px** (edges83): cel 57%, pixel 41%, hose 30%, riso 25% of edge px (fringe vs interior neighbour, both themes), noir 21 (warn), print 15.
6. **Framing differs per skin** (framing, skin box and eye anchor vs clay): every fitted skin is 2-3% off-centre and 1-14% off in scale (stone x1.14, riso x1.10, cel x1.04, noir x0.91). Frame fix verified: it takes noir/felt/stone/claySun to 0.00.
7. **Pixel flicker** (flicker, 3 frames of 0.003 rad drift): pixel 16 px/10k (the pixel grid shimmers under a drift), print 48 (halftone dots; overridden).
8. **Soft-clay presets** (plast + 15 presets): hair strands leave gaps inside the face's territory (holes, up to 100 px/10k on mohawk-stubble, 67 dupatta-studs, 48 bun-bindi-hoops);
   strand edges flicker (boycut-glasses 70, bun-bindi-hoops 60, taqiyah-beard 21); lids vs glasses frames (lidcover 8-9.6 on the seven faces with glasses/beard, check masks glasses, so look at the crops).
   parts: bald/hijab/sikh-turban presets carry a stray 18-vertex Hair piece 3 head-heights from the head and Hair is "not drawn"; taqiyah-beard's brows are not drawn (0 px change when hidden), deep-tone-braid's barely (51 px);
   dupatta-studs earrings not drawn; nose pin 0.07-0.08 head heights off the skin (long-bindi-nosepin, grey-braid, dupatta-studs).
   Headwear (hijab, dupatta, turban, taqiyah) IS built, visible and drawn in headless Chromium (software GL) and WebKit in this run; the missing-in-headless report did not reproduce here, so look at GPU/ANGLE path or load order.
9. **Not seen in this baseline**: no NaN or black-pixel regressions (blackpix 0 fail), no console or WebGL errors, no cross-browser (chromium vs webkit) part differences, exposure fine, print framing fine (6.0 = hair touching the frame on emotes only).
   The earlier "print off-centre/small" and "rough turned views" were not reproduced as failures (print: framing 6.0, symmetry 0.03).

## Safe fixes: what was measured (noir, felt, stone, claySun, before → after)
- `frame` (auto-centre and scale): framing 10.7-15.4 → 0.00 on all four. Verified. Side effect: it rescales the head to clay's size, so pixel-level metrics move (seams rose with magnification).
- `normals` (symmetrise asymmetric normals): geometry already near-symmetric (asymNormalFrac 0.01%); no measurable shading change on its own; combined run with `frame` shows lidcover 4-10 → 3-6 (claySun 5.1 → 2.8, felt 4.1 → 2.9, stone 9.9 → 6.2, noir 17 → 20.8) but seams and ghosts rose, so it is not proven safe: off by default.
- `lid`: measured worse, now a no-op.
- `mirrorFill`, `inpaint`: wired, pixel routines unit-tested (selftest.mjs), but no fitted skin has alpha holes in its skin map (holes passes), so they are unproven on real faces; with them on, seams and load rose. Off by default.
