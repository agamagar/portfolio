# 13. Photo inventory: the room, the window, the lamp, the outside

Understanding phase only. Nothing here is built. Every number says where it came from.
Tags: **VERIFIED** = measured from pixels, EXIF or geometry I solved. **INFERRED** = my reading of the evidence, could be wrong.

Scratch work (scripts, linear decodes, crops) lives in
`/private/tmp/claude-501/-Users-agamagarwal-My-Drive-Active---Portfolio/f6eb71b2-3a66-4ec7-b85d-ffd026e2b335/scratchpad/`
(`crops/`, `lin/`, `crop.py`, `edges.py`, `linlib.py`, `rawlin.swift`, `heiclin.swift`).

---

## 0. How to read the numbers

* **W** = the clear glass width of one pane. Every window dimension is given in W first, because the photos fix proportions far better than absolute size.
* **Absolute scale: W = 9 cm best estimate, range 7.5 to 11 cm (INFERRED).** Anchors:
  * Hot Wheels car on the sill, about 7.0 cm long (standard 1:64 basic car). In the 50 mm photo (5481) the car is 530 px and a pane is 590 to 610 px; in 5482 the car is 692 px and the pane 807 px. The car sits a few cm nearer the camera than the glass, so pane width = 1.15 to 1.3 car lengths = 8 to 9.5 cm.
  * Brass D-handle: 650 px tall in 5482 against the car's 692 px, so about 7 to 7.5 cm, a standard 3 inch handle. Consistent with the car anchor.
  * Cross-check with the wide photo: with W = 9 cm the camera is 79 cm from the glass and a 27 inch monitor lands about 58 cm from the camera, leaving about 20 cm between screen and glass for a 15 cm lamp head. Everything fits.
  * The macOS menu bar was not usable as a size anchor: it gives points, not millimetres (screen width / menu bar height = 3990 / 47 px = 85, i.e. a "looks like" width of about 1920 to 2048 pt).
* Image coordinates are full-resolution pixels. Wide photo: 5712 x 4284 (`ref_full_srgb.png`). DNG photos: upright 3024 x 4032 (`up_548x.png`, my sRGB conversions of `dng_548x.png` rotated 90 degrees clockwise). Linear decodes are at half that size.
* Leaf names used throughout, left to right as seen from the chair: **L1, L2** (the left French pair), then the mullion zone, then **R1** (the leaf with the brass handle, behind the lamp) and **R2** (far right).

---

## 1. Sources and capture metadata (VERIFIED, Spotlight EXIF)

| Photo | Local time (IST) | Lens (35 mm eq) | f / shutter / ISO | EV100 | As-shot WB (CIRAWFilter) | Compass heading | What it shows |
|---|---|---|---|---|---|---|---|
| IMG_5479.heic (`ref_1600`) | 26 Sep 2026 17:41:56 | 24 mm (6.765 mm real) | f/1.78, 1/198 s, ISO 80 | 9.6 | auto (not raw) | 8.3 deg | wide view from the chair |
| IMG_5480.DNG | 18:39:52 | 24 mm | f/1.78, 0.2 s, ISO 50 | 5.0 | 4238 K, tint +16 | 344.7 deg | whole desk, standing |
| IMG_5481.DNG | 18:39:57 | 50 mm (crop) | f/1.78, 1/4 s, ISO 64 | 4.3 | 4118 K | 357.6 deg | lower window, sill |
| IMG_5482.DNG | 18:40:02 | 66 mm (crop) | f/1.78, 1/15 s, ISO 1250 | 1.9 | 3543 K | 8.1 deg | lamp-lit stile, car |
| IMG_5483.DNG | 18:40:07 | 66 mm | f/1.78, 1/4 s, ISO 100 | 3.7 | 4169 K | 7.4 deg | same, car close |
| IMG_5484.DNG | 18:40:12 | 66 mm | f/1.78, 1/6 s, ISO 160 | 3.6 | 3285 K | 19.2 deg | lamp head, right section |

* GPS: 12.9077 N, 77.6665 E, altitude 884 m. South-east Bengaluru (the Haralur / Kasavanahalli area). VERIFIED.
* 5482 carries a ProRAW BaselineExposure of +1.83 EV (the others about +0.05), so its EXIF exposure is not comparable with the rest. VERIFIED.
* The five DNGs are Apple ProRAW (linear, scene-referred). I decoded them with CoreImage `CIRAWFilter` at a fixed 6500 K / tint 0, boost 0, local tone map 0, no gamut mapping, into extended-linear sRGB floats (`lin/lin_548x.bin`, 1512 x 2016). The HEIC was decoded twice: plain SDR and with its HDR gain map applied (`lin/wide_sdr.bin`, `lin/wide_hdr.bin`, 1428 x 1071).

## 2. Site, orientation, sun

* **The window faces about north.** VERIFIED heading of the wide shot 8.3 deg (camera axis) and the solve in section 3 puts the wall normal about 8 deg to the left of the camera axis, so the outward normal points at about 0 deg. INFERRED error bar +/- 15 to 20 deg: a phone compass beside iron bars and two monitors is not trustworthy.
* Sun (VERIFIED, NOAA solar algorithm at the GPS point):

| Moment | Sun elevation | Sun azimuth | Note |
|---|---|---|---|
| 26 Sep 17:41:56 (wide photo) | +6.7 deg | 267.0 deg | 32 min before sunset, due west. 87 deg to the left of the window normal: no direct sun through the glass, the outside is side-lit from the left. |
| 26 Sep 18:39:52 (dusk set) | -7.4 deg | 270.3 deg | after civil dusk (18:35), nautical twilight |
| 26 Sep sunset / sunrise | 18:13 at 268.8 deg / 06:09 at 91.0 deg | | noon sun 75.8 deg high in the SOUTH (behind the house) |
| 21 Jun | sunset 18:48 at 294.3 deg, sunrise 05:55 at 65.7 deg | | noon sun 79.5 deg high in the NORTH: May to July the sun is on the window side of the sky |
| 21 Dec | sunset 17:59 at 246.2 deg | | noon sun 53.7 deg in the south |

  Consequence for the simulation (INFERRED): a north window at 12.9 N never shows the sun disc in Sep to Mar; on May to July mornings and evenings a low sun can graze in from the far right (NE) or far left (NW).

## 3. Camera of the wide 17:41 photo (the hero framing)

* Field of view: 24 mm eq on 4:3 means focal length 3960 px on the 5712 px width; vertical FOV 56.8 deg, horizontal 71.6 deg, diagonal 84.0 deg. VERIFIED arithmetic. For a 16:9 page keeping the same horizontal FOV, three.js `PerspectiveCamera.fov` = 44.2 deg.
* Vanishing-point solve (VERIFIED, 11 vertical and 11 horizontal window edges fitted to sub-pixel, residual 0.2 to 1.8 px; overlay in `crops/w_vp_overlay.png`; assumes principal point at image centre):
  * pitch **+5.7 deg** (looking up), roll **-0.7 deg**.
  * The L pair's rails agree with the vertical direction to within 0.003 (dot product), a good check that the 24 mm FOV is right.
  * The camera is yawed **about 8 deg to the right** of the wall normal (L1 rails give 9.4 deg, L2 6.7 deg).
  * Horizon line in the image: y = 2537 px. It runs through the bottom row of panes, so the outside trees sit on the horizon.
* Position, in window coordinates (origin on the sill line under the L1/L2 meeting joint, x to the right along the wall, y up, z into the room), VERIFIED in W, cm INFERRED at W = 9 cm:
  * z (distance from the glass plane) = **8.8 W = 79 cm** (range 66 to 97 cm).
  * x = **-2.6 W = -23 cm** (the camera sits left of the L pair's centre line).
  * y = **+0.5 W = +4.5 cm**: the lens was only a few cm above the sill line. The sill ledge's front lip hides the bottom rail of the leaves from this viewpoint.
* INFERRED: if the phone was at seated eye height (1.15 to 1.2 m), the sill is at about 1.1 m above the floor and about 35 to 40 cm above the desk top. The main monitor's top edge projects 30 px below the sill line and is at nearly the same height as the sill.
* Depth of field (INFERRED, 6.765 mm at f/1.78, CoC 0.0085 mm, focus on the glass at about 0.8 m): near limit 0.63 m, far limit 1.09 m. This matches the photo: glass and frame sharp, the monitor (about 0.58 m) slightly soft, the brown outside grid a little soft, trees and clouds very soft.
* Key image positions in the wide photo (VERIFIED, full-res px, useful as overlay targets):

| Feature | x | y |
|---|---|---|
| L1 pane (row B, at y 1380) | 2878 to 3328 | |
| L1/L2 meeting joint (backlit hairline) | 3420 | full height |
| L2 pane (row B) | 3491 to 3869 | |
| Rails: row A bottom / row B top / row B bottom / row C top | | 717 / 892 / 1872 / 2040 (at x 3100) |
| Sill line (bottom of visible glass) | | 2762 |
| Upper grille tie bar (INFERRED) | 2860 to 3900 | 95 to 150 |
| L2 hinge stile (with keyhole slot at 4065,1810) | 3870 to 4230 | |
| Dark grooved band (mullion zone) | 4230 to 4410 | |
| R1 left stile (lamp glow, handle edge-on) | 4410 to 4550 | |
| R1 pane | 4470 to 4990 | |
| R2 grey stippled glass | 5270 to 5640 | 40 to 1850 |
| Lamp dome | 4640 to 5480 | 1950 to 2750 |
| Lamp socket cup | 4620 to 4900 | 2480 to 2740 |
| Hot Wheels car (silhouette) | 3880 to 4320 | 2600 to 2780 |
| Souvenir tile | 3285 to 3480 | 2730 to 2785 |
| Main monitor: top edge / menu bar / screen x | 1555 to 5545 | 2790 / 2848 to 2895 |
| Portrait monitor (off) top edge, right edge | 0 to 1230 | 2240 |
| Bead-chain cord | 1690 to 1860 | 0 to 2700 |

---

## 4. The window

### 4.1 Topology (what it is)

```
 cream   | casing |  L1   |  L2   | mullion |  R1 (handle) |  R2         | casing ...
 wall    | 0.8 W  | 1 col | 1 col |  zone   |  1 col       |  1 col      | (right edge not
         |        | 3 rows| 3 rows|         |  3 rows      |  grey glass | seen in full)
               black iron grille (square bars) sits in FRONT of all leaves, room side
               brown flat-bar grid with diagonals sits BEHIND the glass, outside
```

* **Four leaves in two pairs.** VERIFIED for the left pair: in 5481 (`crops/d81_meeting.png`) the two meeting stiles are separate pieces with a dark gap between them, and their rails do not line up exactly (L2's rail sits a hair lower). In the backlit wide photo the same gap shows as a 1 px bright line at x 3420 from sill to top (`crops/w_meeting.png`). So L1 + L2 is a true French pair.
* **Each leaf is one pane wide and three panes tall** (rows A top, B middle, C bottom). VERIFIED in 5480 (row A's top edge is visible just under the blind, so there is no fourth row) and in the wide photo.
* **Between L2 and R1** is a dark grooved band 0.44 W wide in the wide photo (4230 to 4410) but only 0.2 W of dark joint plus a grille bar in 5482. INFERRED: either a slim fixed mullion, or R1's edge seen obliquely because R1 is ajar (next point).
* **The right section is not coplanar with the left pair in the 17:41 photo.** VERIFIED: R1's rails slope the opposite way (-7.3 and -6.3 deg in the image against +3.5 and +3.2 deg for L1 and L2 at the same height). Solved in 3D, R1's plane recedes to the left, about 31 deg away from the L pair's plane. INFERRED reading: R1 stood ajar about 30 deg (opened outward, hinged on its right side), which also explains why its brass handle is on its LEFT stile: that is its free edge. The other reading, a right section built at an angle (bay), is less likely because the sill, grille and blind all run straight. Candidate question.
* **Opening direction: outward.** INFERRED from the grille sitting on the room side of the leaves: nothing could open inward. The D-handles on the room face are pull handles reached between the bars. No hinges are visible from inside (consistent with outward-opening leaves hinged on the outer face or in the rebate).
* **L1 appears 1.0 to 1.19x as wide as L2 depending on the photo** (5481: 610 vs 593 px; wide: 450 vs 378 px). Rectification does not remove the difference in the wide photo (1.14x). INFERRED: one of the L leaves is also slightly out of plane (a few degrees ajar or warped). Model them equal unless measured.

### 4.2 Proportions (VERIFIED in W from rectified wide photo and 5481 / 5480; cm at W = 9 cm INFERRED)

| Element | W | cm at W = 9 | Source |
|---|---|---|---|
| Pane clear glass width | 1.00 | 9 | definition |
| Row C (bottom) visible glass height, sill line to rail | 1.63 to 1.67 | 15 | wide, rectified |
| Rail between rows B and C | 0.39 (5481: 0.37) | 3.5 | wide, 5481 |
| Row B height | 2.33 (5481 raw: 2.07, foreshortened) | 21 | wide, rectified |
| Rail between rows A and B | 0.42 to 0.43 | 3.8 | wide |
| Row A height | about 2.15 (1.6 W visible below the tie bar in the wide) | 19 | 5480 ratio A/B = 0.92 |
| Leaf outer (hinge-side) stile | 0.55 to 0.58 | 5 | 5481 (L1 330 px, L2 340 px) |
| Meeting stiles, both, including gap | 0.32 to 0.36 total (L1 side 0.19, gap 0.03, L2 side 0.14) | 3 | 5481 |
| Fixed frame (casing) visible face | 0.81 | 7.3 | 5481 |
| Rebate shadow between casing and leaf | 0.13 | 1.2 | 5481 |
| One pair, stile to stile | about 3.45 | 31 | sum |
| Whole window frame, casing to casing | about 8.9 | 80 | INFERRED sum (right casing only partly seen) |
| Leaf height, sill line to top rail | about 7.4 to 7.8 | 67 to 70 | INFERRED sum |

INFERRED overall: a small, nearly square window, about 0.8 m wide by 0.75 to 0.8 m tall inside the casing, with a sill at about seated eye height. "French" here means the casement pairs, not a floor-length door.

### 4.3 Casing and moulding profile (VERIFIED, 5481 at y 1950, `crops/d81_leftcasing.png`; widths in W)

From the wall inward: the cream wall plaster meets the casing with a slightly ragged plaster edge (no separate architrave) -> flat band 0.21 W -> narrow V-groove / quirk with a hairline highlight 0.05 W -> flat 0.37 W -> rounded bead (two parallel highlights, reads as an astragal) 0.10 W -> step down into the rebate, dark shadow band 0.13 W -> leaf's outer stile, flat, 0.57 W -> a pale glazing-bead / putty line about 0.03 W at every pane edge -> glass.
Rails carry the same language: in `d81_meeting.png` each rail shows a chamfered upper edge and a quirk line. Pane corners show small mitres on the bead (5484, `d84_right_top.png`).

### 4.4 Paint (glossy dark brown enamel)

* As photographed, sRGB hex (VERIFIED medians):

| Condition | Hex | Photo |
|---|---|---|
| casing under the room ceiling light, dusk | `#513f3c` | 5480 |
| leaf stile under room light | `#4b3937` | 5480 |
| rail under room light | `#59403c` | 5481 |
| lamp-lit stile, mid glow | `#b07c3e` | 5482 |
| lamp-lit stile beside the handle | `#d38e41` | 5482 |
| lamp hotspot core (clips to near white) | `#fef3aa` | 5482 |
| same stile inside the shade's cut-off shadow | `#382919` | 5482 |
| backlit casing at golden hour | `#545553` | wide |
| L2 hinge stile at golden hour, no lamp | `#46413d` | wide |
| R1 stile, lamp glow at golden hour | `#63442a` (p90 `#e4ab65`) | wide |

* Albedo (INFERRED): about 9 % of the cream wall's reflectance in green; a mid dark "chocolate / walnut" brown. Two estimates bracket it: linear sRGB about (0.077, 0.059, 0.055) from the ambient-lit paint (desaturated by glossy reflection of the room), and about (0.088, 0.060, 0.031) from the lamp-lit diffuse paint. Start at linear (0.085, 0.058, 0.040), i.e. about `#524336`, and tune.
* Finish (VERIFIED visually): high gloss. The hotspot shows vertical brush-stroke ridges in the specular (5482, `crops/lin5482_stile_grid.png`), plus dust specks, small white chips, paint nibs, worn lighter edges on rails. INFERRED material: roughness 0.2 to 0.3 with a normal map of vertical brush streaks, a dust layer in the roughness/albedo.
* Blemishes to model (VERIFIED): on L2's hinge stile a keyhole-shaped torn slot (5481 at 2700 to 2750, 2400 to 2520) and a round screw hole 0.66 W below it (2745, 2855). Their spacing matches the brass handle's fixing spacing (520 vs 550 px in 5482). INFERRED: a D-handle used to sit here and was removed.

### 4.5 Brass D-handle (VERIFIED 5482, 5484)

One visible, on R1's left stile, vertical, spanning the height of the A/B rail. About 7 to 7.5 cm long (3 inch class), round bar bow with turned bolster ends and a screw at each end. Tarnished brass: median `#a77960`, lamp-lit highlight `#dbaf94`. In the wide photo it is edge-on and backlit, only two glints at (4405 to 4450, 1740 to 2100). No handle is visible on L1 or on the L pair's meeting stiles.

### 4.6 Sill ledge

VERIFIED: a narrow ledge whose top surface is grey and dusty in the close-ups (`crops/d83_car.png`), holding the car and the tile, directly behind the monitor's top edge in every photo. Its front lip hides the bottom rail of the leaves from the chair. INFERRED: it projects at least 10 cm in front of the glass (the car sits in front of the grille bars), material unknown (painted wood, cement or stone). Candidate for the tape-measure question.

### 4.7 Black iron grille (room side)

* VERIFIED: vertical bars in front of the leaves, glossy black enamel heavily speckled with grey dust (`#1b1714` under room light, `#52452a` in lamp light). Square section, not round: flat faces with crisp edge highlights in 5483 and 5484.
* Bar width about 0.09 to 0.10 W (8 to 9 mm at W = 9 cm; INFERRED 10 to 12 mm if W is larger). Pitch 0.93 W between bar centres (5481 at y 2000: 1305, 1845, 2425, 2970 px). About 4 bars across each pair, so about 8 to 9 across the window.
* Bar positions in 5481: 0.2 W into L1's pane, over the L1/L2 meeting stiles, 0.75 W into L2's pane, over L2's hinge-stile joint. Bars do NOT line up with the panes.
* Upper horizontal tie bar: flat black bar across row A (VERIFIED in 5480 and 5481, where row A continues above it), its left end fixed onto the casing face (5481 at x 310 to 350). In the wide photo it is the dark band at y 95 to 150 (INFERRED).
* Lower horizontal tie bar: VERIFIED in 5484 (y 3650 to 3720) across the right section, low in row C. INFERRED about 0.25 W above the sill; hidden by the ledge from the chair.
* Depth: INFERRED about 0.8 W (about 7 cm) in front of the glass, from parallax (bar 3 sits 0.75 W into L2's pane in 5481 but just past its right edge in the wide photo, which sees it about 20 deg off-normal).

### 4.8 The brown grid seen THROUGH the glass (outside)

* VERIFIED behind the glass, not muntins: its position inside each pane shifts between viewpoints (the vertical member sits 0.26 of the way across L2 in the wide photo, 0.33 in 5481), and at dusk it is lit orange by the room lamp shining out through the glass (5481, 5482), so it is close.
* Flat bars, one vertical per pane column and horizontals every 0.72 W (measured at the glass plane), bar about 0.1 W wide as seen. Plus straight diagonal members: in L1 row B (5481 from 1390,1560 to 1720,2030) and L2 row C (wide from 3620,2060 to 3900,2420). Seen against the bright sky it looks grey and speckled, because the dusty glass in front scatters light across it; at dusk it reads tan / rust brown.
* INFERRED: an exterior box grille of brown-painted flat bars with diagonal bracing, about 20 to 50 cm beyond the glass (softness is consistent with the DOF far limit of 1.09 m). Alternatives I cannot rule out: scaffolding, or outer mesh-shutter frames. Candidate question.

### 4.9 Glass

* VERIFIED: plain clear glass (not patterned) with a heavy dust film. Against the bright sky the dust makes a soft veil; against anything dark it turns into a bright grey stipple (compare `crops/w_L1_texture_1to1.png` with `crops/w_R2_texture_1to1.png`). A few larger spots and streaks.
* Faint arching thin strands at the right edge of L2's row A pane (`crops/w_L2_rowA_strands.png`). INFERRED: cobweb on the glass or a close plant tendril.
* **R2 column (far right): grey stipple instead of a view** in rows A and B (median `#888e8b`, a sliver of real view along its left edge). VERIFIED that the texture is dust scatter against something dark and flat directly behind the glass, not a glass pattern. What that object is (AC unit, wall, closed outer shutter) is not visible. Candidate question.
* At dusk the upper part of the panes reflects the lit room (5480: `#393731` above the tie bar against sky `#303645` below). VERIFIED reflection. INFERRED: with the ceiling light on, glass reflections dominate the upper panes at night.

---

## 5. The lamp

* **Type (VERIFIED, `crops/d84_lamp.png`, `d84_cup.png`):** black spring-balanced swing-arm desk lamp. Semi-matte black enamel dome shade, a bell with a rounded back, with scuffs and a few chips. A black cylindrical socket cup protrudes from the back of the dome, with a ring of round ventilation holes (about 6 to 8 mm) near its end. A cream/beige plastic swivel knuckle joins the cup to the arm. The arm is flat black steel with visible screws and a coil spring along the lower segment (5484 at x 1480 to 1560, y 2900 to 3300). The power cable runs along the arm. Clamp and base: not visible in any photo.
* **Size (INFERRED):** dome diameter 14 to 17 cm (840 px at about 72 cm in the wide photo = 15 cm; bounded by the handle and menu-bar anchors in 5484). Cup about 5.5 to 6 cm across, 6 to 7 cm long.
* **Position (VERIFIED in image, cm INFERRED):** head sits over the main monitor's top-right corner, 29 deg right of the wide camera's axis, about 72 cm from the camera, roughly 6 to 12 cm in front of the glass, centre about 8 cm above the sill. In the wide photo it covers R1's row C and part of R2.
* **Aim (VERIFIED):** the opening faces away from the viewer, into the window; the cup points back toward the viewer, left and slightly down. The shade axis looks about 30 to 40 deg off the line of sight from the chair (INFERRED from the cup-to-dome offset of 300, 260 px).
* **The lamp was re-aimed between the two sessions.** VERIFIED: at 17:41 L2's hinge stile shows no lamp light at all (as-rendered 5700 K, same as other unlit wood) and the warm glow is on R1's left stile and the rail above it; at 18:40 the brightest hotspot is on L2's hinge stile, just left of the grille bar, low in row C, with the glow running up the stile and onto R1's stile and handle.
* **Hotspot shape at 18:40 (VERIFIED, 5482):** small and hard, peak about 0.4 to 0.6 W above the sill; glossy brush-mark sheen inside it; a crisp diagonal cut-off at its lower left (the shade rim's shadow); soft falloff upward over 3 to 4 W. Peak to mid-glow luminance about 13.5 : 1; mid-glow to the shade-shadow wedge about 5.7 : 1.
* **What "37 degrees" could be (the photos cannot say which Agam meant):**
  1. tilt / aim of the shade: the photos show the axis about 30 to 40 deg off the chair's line of sight, pointing away and to the right;
  2. beam width: a 15 cm dome with a recessed bulb gives a cut-off half-angle around 35 to 50 deg, so 37 deg as half-angle is plausible;
  3. raking angle of the light across the frame: the glow runs along the stile like raking light.
  Candidate question.
* **Light colour: about 3000 K warm white, slightly yellow.** VERIFIED from the fixed-6500 K raw decode, on quasi-neutral things the lamp lights: dust speckles on the black bar 3020 to 3110 K, whitish glazing beads 2900 to 3320 K, cream plastic swivel 3200 K; duv about +0.003 (a hair above the Planckian locus, reads "yellow"). Specular-dominated paint pixels stop at 3600 K before clipping; a lit-versus-unlit paint ratio method gives 2200 to 2400 K but is biased warm by glossy room reflections in the ambient sample. Best value xy (0.4335, 0.4116): linear sRGB (1.00, 0.52, 0.15), hex `#ffbe6c`; range `#ffb465` (2900 K) to `#ffd180` (3600 K). Bulb type is not visible.

## 6. Monitors and desk

* **Main monitor (INFERRED 27 inch 16:9 class):** in 5480 its left-edge height is 1.36x the width of the portrait monitor standing next to it; with the portrait monitor at about 31 cm wide that gives about 42 cm, i.e. 27 inch nearer the camera. Thin top and side bezels, a thicker bottom chin (5480 at y 3640 to 3700), glossy screen (lamp streak reflections in 5482 and 5483). On a black pole-mounted arm; the pole and clamp are visible at the desk (5480 at x 1380 to 1520). In the wide photo the screen spans x 1555 to 5545 and shows the Claude app (dark) on the left and the portfolio's Scheduled Delivery page (white) on the right; at 18:39 it shows the Claude app full screen.
* **Portrait monitor (INFERRED 22 to 24 inch, 16:9 on its side):** 1010 x 1810 px in 5480 (aspect 1.79). Black glossy face, thin bezel, a silver/champagne edge frame (`#a6907d`) with a dotted perforated strip on its right side, a cable plugged into that side, standing on a white cloth strip. A black bracket with a small triangular warning label clips to its right edge (`crops/d80_arm_connector.png`), INFERRED part of an arm. Off (black) in all photos. Size bound VERIFIED: the charging dock overlaps it in front, so it is at least 27.8 cm wide at the AirPods-case scale.
* **Desk:** dark brown wood or wood-look top, `#21150a` to `#221a18`. Only the back strip is visible.
* **Borosil bottle:** brushed stainless steel, "BOROSIL" printed vertically in grey, dark cap, far left foreground in 5480.
* **Charging dock:** grey aluminium 3-in-1 stand: white round MagSafe-style pad on the angled top face, a round watch recess below, an AirPods Pro case (white) at its foot. Between the two monitors in front.
* Loose items: black cables, a small white cable clip or block at the right (5480 at x 2080 to 2200, y 3900+).

## 7. Wall, blind, cord

* **Cream wall:** warm off-white emulsion on slightly rough plaster, `#c0b9af` to `#e1d8c8` under the dusk room light, near black (`#1d1d1b`) in the 17:41 photo. At least 0.6 m of plain wall to the left of the casing; no corner visible on the left. Right-hand wall never visible.
* **Blind (VERIFIED, `crops/d80_blind.png`):** fabric Roman blind, raised into soft cascading folds that sag lower on the left, sitting at the head of the window and hiding the top rail. Woven stripe / check: broad taupe, beige and charcoal vertical bands with a fine horizontal weave line, overall `#585042`. It extends about 0.8 W past the casing on the left.
* **Bead-chain cord:** ball chain, two strands (one ivory `#e1d6c6`, one dark brown), hanging from the blind's left end down to about sill level, in front of the wall. Visible in the wide photo as a faint double line.

## 8. Objects on the sill

* **Hot Wheels car (VERIFIED livery, `crops/d83_car.png`):** a 1940s-style woodie wagon casting with a chrome supercharger through the hood and a blue surfboard on the roof rack; silver-grey body, blue wave graphics, the Hot Wheels logo on the side, an orange cartoon fish character on the door, gold-chrome front grille, black wheels with orange-bronze rims. INFERRED casting: "Surf Crate". About 7 cm long. Faces right, sits in front of the L2 hinge stile / mullion zone, in front of the grille bar.
* **Souvenir tile (VERIFIED, `crops/d83_tile.png`):** flat rectangular slab about 3.5 to 4 cm long and a few mm thick, printed face: blue sky, green and brown trees, an airplane silhouette, lettering at the right end. INFERRED fridge magnet. Sits under the L1/L2 meeting stiles.

## 9. Outside

**17:41, golden hour (wide photo), per region:**

| Where | What | As photographed |
|---|---|---|
| Rows A and upper B, L pair | clear sky, pale blue, veiled by glass dust | `#bad9eb` |
| Row B, both L panes | cumulus clouds lit gold by the low western sun | `#f4e6c2` |
| Row C, both L panes | dense bright yellow-green foliage at and just above the horizon, small leaves in soft clumps (not fronds, not large paddle leaves) | `#a9be90` |
| R1 rows A to B | soft grey-green crown filling most of the pane (the "tree on the right"), pale sky between clumps, thin dark branch lines | |
| R1 row B lower half | cream / pale yellow building face lit by the sun | as-rendered 5120 K |
| R1 row B centre | a vertical red-orange patch, about 0.25 x 0.6 W as seen: flowers, a painted surface or a sign | |
| R2 | grey dust stipple (something dark right behind the glass) | `#888e8b` |

* Sky seen through the window spans about 5 deg to 35 deg elevation (VERIFIED from the horizon line at y 2537 and pitch 5.7 deg).
* No wires, no other building tops, no birds visible. The diagonals are part of the brown outside grid (same texture), not cables (INFERRED).
* **18:39, dusk:** slate-blue sky through the dusty glass, `#303645` to `#343a48`; the outside grid glows tan in the room light; row C shows dark foliage silhouettes (`#3e3936`).
* **Tree identification (the voice note said "ballot tree"):** the pixels do not settle the species. What they support: a small-leaved, soft, clumpy crown close to the right-hand panes (argues against bottle palm and banana, medium confidence), a red-orange patch in the same panes (fits bottlebrush flower spikes, a gulmohar, or a painted wall; low confidence), fine drooping strands at the right edge of L2's top pane (fits weeping bottlebrush twigs or a cobweb; low confidence). "Ballot tree" / "biometry's" is closest in sound to "bottle(brush) tree's"; "bael" is the other close sound. Candidate question.

## 10. Photometry

**17:41 golden hour** (HEIC with its HDR gain map applied, linear; relative to the monitor's white browser page = 1.00; VERIFIED ratios of the rendered photo, NOT of the physical scene):

| Region | Relative luminance | As-rendered colour temperature |
|---|---|---|
| golden cloud | 2.8 to 3.8 | 4800 to 5000 K |
| blue sky | 1.7 | 9100 K (blue) |
| sunlit building (R1) | 1.15 | 5100 K |
| monitor white page | 1.00 | 6200 K |
| foliage, row C | 0.7 to 0.9 | 5600 to 5800 K, green |
| R2 dust stipple | 0.38 | |
| backlit casing | 0.10 | |
| lamp glow on R1 stile | 0.09 | 3050 K |
| unlit stile | 0.07 | |
| lamp dome back | 0.015 | |
| wall | 0.012 | |
| monitor dark sidebar | 0.009 | |
| portrait monitor (off) | 0.003 | |

INFERRED physical reality: the iPhone compressed this scene hard. A real sky at sun elevation 7 deg is 1000 to 5000 cd/m2 and a monitor white 150 to 300 cd/m2, so the true sky to screen ratio is 5 to 30x, not 1.7x. Match the photo's rendered ratios if the goal is "looks like the photo".

**18:39 to 18:40 dusk** (ProRAW linear, same photo only):

| 5482 region | Y | | 5480 region | Y |
|---|---|---|---|---|
| lamp hotspot core | 3.97 | | monitor white text (p99.5) | 0.458 |
| monitor white text (p99) | 2.67 | | cream wall, ceiling light | 0.152 |
| monitor menu bar strip | 0.43 | | casing paint | 0.021 |
| R1 stile near handle (lamp) | 0.42 | | dusk sky through glass | 0.016 |
| lamp-lit stile mid | 0.29 | | desk top | 0.008 |
| dusk sky through upper panes | 0.06 to 0.09 | | monitor dark UI | 0.0065 |
| shade-shadow wedge | 0.052 | | | |
| monitor dark UI background | 0.035 | | | |
| unlit L1 stile (room light) | 0.018 | | | |

Read-outs: the lamp hotspot is 1.5x the monitor's white text; the lamp-lit wood is 4x the dusk sky; the dusk sky is only about as bright as the dark brown paint under the room light and 1/28 of the monitor's white text. Between 17:41 and 18:39 the sky fell by roughly 5.6 stops relative to the monitor (INFERRED, monitor brightness assumed constant).

---

## 11. Not visible or not settled

| Item | Status | Matters for the build? |
|---|---|---|
| Tree species on the right | not settled | yes, question |
| What sits behind the R2 glass | not visible | yes, question |
| R1 ajar vs angled section; which leaves are open | geometry shows 31 deg out of plane, cause not visible | yes, question |
| Meaning of "37 degrees", which of the two lamp aims | not settled | yes, question |
| Bulb colour intent (photo measures 3000 K) | measured, intent unknown | yes, question |
| Room lighting after dark (ceiling light was on at 18:39) | both states photographed | yes, question |
| Absolute scale (pane width), sill depth and material | estimated 9 cm, +/- 20 % | yes, tape-measure question |
| Brown outside grid: what it is | not settled | yes, question |
| Window compass direction | about north, compass unreliable | yes, question |
| Portrait monitor state | off in both sessions | small, question |
| Lamp clamp and base | not visible | no: hidden behind the monitor in every framing |
| Hinges, outside face of the frame, chajja | not visible | no: never seen from the chair |
| Ceiling, floor, right wall | not visible | no for the hero framing; only if the camera leaves the desk |
| Below the sill behind the desk | hidden by monitors | no |
| Bottom rail of the leaves | hidden by the sill lip | no (hidden in the hero view too) |

## 12. Crops I relied on

All in `/private/tmp/claude-501/-Users-agamagarwal-My-Drive-Active---Portfolio/f6eb71b2-3a66-4ec7-b85d-ffd026e2b335/scratchpad/crops/`.

| Crop | Source, region | Used for |
|---|---|---|
| `w_full_grid.png`, `w_full_boost5.png` | wide, full frame | layout, image coordinates |
| `w_leftleaf_top.png`, `w_leftleaf_bot.png` | wide 2700 to 4300 | L pair rows, grid behind glass, tie bar |
| `w_meeting.png` | wide 3250 to 3550, 1850 to 2150 | backlit meeting gap |
| `w_right_top.png`, `w_right_mid.png`, `w_rightsec_boost6.png` | wide 3800 to 5712 | R section, grey stipple, lamp glow |
| `w_handle_zone_boost8.png` | wide 3850 to 4750, 1300 to 2850, gain 8 | keyhole slot, mullion band, R1 stile, handle |
| `w_vp_overlay.png` | wide | camera solve check |
| `w_mon_topleft.png`, `w_mon_topright.png` | wide monitor corners | menu bar, screen edges |
| `w_R2_texture_1to1.png`, `w_L1_texture_1to1.png` | wide 1:1 | dust stipple test |
| `w_out_R1_stretch.png`, `w_R1_rowB_1to1.png`, `w_R1_rowA_branches.png`, `w_out_rowC_stretch.png`, `w_foliage_L2C_2x.png`, `w_L2_rowA_1to1.png`, `w_L2_rowA_strands.png` | wide, contrast-stretched | outside inventory, tree evidence |
| `d80_window.png`, `d80_win_top.png`, `d80_win_bot.png`, `d80_toprow_boost3.png` | 5480 window | rows, tie bar, casing, dusk reflection |
| `d80_blind.png`, `d80_chain.png` | 5480 top | blind, bead chain |
| `d80_desk.png`, `d80_portrait_mon.png`, `d80_arm_connector.png`, `d80_mon_tl.png`, `d80_mon_bl.png` | 5480 lower | desk objects, monitors |
| `d81_full_grid.png`, `d81_mid_grid.png`, `d81_meeting.png`, `d81_rightstile.png`, `d81_leftcasing.png`, `d81_sill.png` | 5481 | proportions, meeting stiles, keyhole slot, moulding |
| `d82_full_grid.png`, `d82_rightedge.png`, `d82_cup.png`, `lin5482_stile_grid.png` | 5482 | hotspot, handle, cup holes, colour sampling |
| `d83_car.png`, `d83_tile.png` | 5483 | car livery, tile |
| `d84_full_grid.png`, `d84_lamp.png`, `d84_cup.png`, `d84_right_top.png`, `d84_right_bot.png` | 5484 | lamp anatomy, right section, lower tie bar |
| `lin_preview_5480.png`, `lin_preview_5482.png` | linear decodes | orientation check of the raw pipeline |

## 13. Method notes

* Edge fits: `edges.py` (gradient maxima per scan line, parabolic sub-pixel, robust line fit). Vanishing points by SVD on normalised lines with K from the 35 mm-equivalent focal length.
* Colour temperature: `linlib.py` (linear sRGB to XYZ to xy, nearest point on the Planckian locus in CIE 1960 uv, reported with duv).
* Raw decode: `rawlin.swift` (CIRAWFilter, fixed 6500 K). HDR decode of the HEIC: `heiclin.swift` (`CIImageOption.expandToHDR`).
* Sun: NOAA solar position equations at the photo GPS point and IST.
