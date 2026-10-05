# 3D icons - ball-and-stick wire treatment - research dossier
_Researched 2026-09-20. Sources listed at the bottom, numbered; cite by number inline. UNVERIFIED = not on any fetched page. Inference is marked as inference. Pages that would not load (m3.material.io, the Indigo Instruments part pages, a GameDev.net thread) are not listed and nothing is taken from them._

## What the medium actually is

Three real media overlap in this look, and each one owns part of the vocabulary.

**1. The chemistry ball-and-stick model.** Wikipedia defines it as "a molecular model of a chemical substance which displays both the three-dimensional position of the atoms and the bonds between them" [10]. The proportion rule is stated against rod LENGTH, not rod diameter: "the radius of the spheres is usually much smaller than the rod lengths, in order to provide a clearer view" [10]. Physical kits are "plastic or wood sticks, and a number of plastic balls with pre-drilled holes" [10]; Molymod's open ("Ball & Stick") style uses atom parts "from 17 mm to 23 mm diameter" and single bonds as "medium links (19 mm)", at "2.5 cm per Angstrom" [18]. So in the real kit the ball and the stick are about the same length, and the ball is clearly fatter than the stick. Ball colour carries meaning ("The chemical element of each atom is often indicated by the sphere's color") [10]; the sticks are plain.

**2. The engineering space frame.** "A space frame or space structure (3D truss) is a rigid, lightweight, truss-like structure constructed from interlocking struts in a geometric pattern" [11]. The standard connector is the MERO ball: "individual tubular members connected at node joints (ball shaped)" [11]. Mero's own page: "Spaceframes are filigree systems out of nodes and members" [17]; "The nodes are balls" with "diameters from 49.5mm to 350mm" while members are "round hollow sections" of "30 to 355mm" diameter, and "To connect several members to a relatively small node, the members will have to be conical at the ends" [17]. Important for us: in engineering the node is NOT much bigger than the strut. The "tiny bead on a thin wire" look is the chemistry convention, not the truss convention.

**3. The CG wireframe with vertex spheres.** Every major 3D package has a one-node version of the look, and each one names the parts the same way: edges become cylinders/tubes, points become spheres.
- Cinema 4D Atom Array: "All object edges are replaced with cylinders and all points are replaced with spheres", with a **Cylinder Radius** and a **Sphere Radius** [14].
- Houdini Wireframe SOP: "converts edges to tubes and points to spheres, creating the look of a wire frame structure in rendering"; **Wire Radius**, **Round Corners** ("Places spheres at locations of points"), **End-Caps**, **Remove Polygons** [15].
- Blender: the Wireframe modifier "transforms a mesh into a wireframe by iterating over its faces, collecting all edges and turning those edges into four-sided polygons" [1] (no spheres; square-section struts). The sphere-on-vertex version is built in Geometry Nodes: Mesh to Curve then Curve to Mesh with a circle profile for the rods, Icosphere plus Instance on Points for the balls [19][2][6]. Instance on Points "adds a reference to a geometry to each of the points present in the input geometry" and "works on any geometry type with a Point domain, including meshes" [2].
- KeyShot Wireframe material: "exposes the lines and vertices of each polygon of a surface", with a **Wire Color** separate from a **Base Color** [16].

The word "wire-frame" itself "comes from designers using metal wire to represent the three-dimensional shape of solid objects", and a wire-frame model is made "by connecting an object's constituent vertices using (straight) lines or curves" [12].

**What the icon look is, precisely (inference from the above):** a chemistry-proportioned ball-and-stick (fat bead, thin rod) applied to the construction edges of an icon, rendered like a product shot. It is not a Midjourney "wireframe drawing", which that library describes as fine-line, "predominantly black and white", "often featuring human faces" [24]; the word "wireframe" alone pulls that.

## Vocabulary worth putting in prompts

| TERM | meaning | why a model responds | source # |
|---|---|---|---|
| ball-and-stick | spheres at atoms, rods for bonds; sphere radius "much smaller than the rod lengths" | the single most loaded term for bead-on-rod proportion; it also carries "open, see-through" | 10, 18 |
| node / ball node | the sphere at a junction; in space frames "the nodes are balls" | "node" is what every tool and the truss trade call the junction sphere | 11, 15, 17 |
| strut / member | the straight rod between nodes; "interlocking struts", "nodes and members" | "strut" implies straight, rigid, uniform; "member" is the engineering word | 11, 17 |
| stick / rod / link | the chemistry words for the same rod; Molymod calls them "links" | "stick" keeps it thin; "rod" keeps it round and straight | 10, 18 |
| vertex sphere / sphere on every vertex | the CG phrasing: "all points are replaced with spheres" | names the placement rule: one sphere per vertex, nowhere else | 14, 15 |
| edges replaced with cylinders / tubes | the CG phrasing for the rods | "cylinder" fixes the cross-section as round and constant | 14, 15 |
| sphere radius vs cylinder radius | two separate dials in Atom Array; C4D tip: equal radii gives a plain wireframe look | says the ball is a different size from the rod; equal sizes is the generic look | 14 |
| end caps / capped ends | "Places endcaps on tube geometry"; Curve to Mesh "Fill Caps" fills ends "with n-gons" | gives the rod a hard, flat end where it meets the bead | 15, 6 |
| space frame / truss / tetrahedral truss | "rigid, lightweight, truss-like structure constructed from interlocking struts" | pulls straight members, triangulated bracing, engineering feel | 11 |
| filigree | Mero's own adjective: "filigree systems out of nodes and members" | says thin and airy without saying "delicate/organic" | 17 |
| wireframe overlay / edges on top of shading | Blender overlay: "displays edges on top of existing shading" | the correct name for the overlay variant | 4 |
| replace original vs on top | Wireframe modifier: replaced, or "the wireframe is generated on top of it" | the two variants of our look, in the tool's own words | 1 |
| Fresnel / edge highlight | "a reflective object's edge is highlighted"; reflection stronger at grazing angles | why a tiny sphere reads as glossy: the rim catches light | 21 |
| specular highlight, roughness | "the specular value will change the fresnel intensity and the roughness value will change the falloff" | low roughness = small hard highlight on the bead | 21 |
| hard surface / CAD-like | "precise edges, clean panel work, and CAD-like accuracy" | keeps the struts engineered, not sculpted | 22 |
| silhouette / crease / border / edge mark | Freestyle edge types: crease = "edges whose adjacent faces form an angle sharper than" a threshold | the vocabulary for a SPARSE line set (only the edges that matter) | 8 |
| complementary | "two colors that combine to form gray, i.e. they are on opposite sides of the color wheel" | the one-word rule for a contrasting overlay hue | 13 |
| on-colour / contrasting accent | Material: "Use on-primary on top of primary ... to provide accessible contrast"; tertiary = "contrasting accents" | the design-system phrasing for "a colour that reads on top of this colour" | 25 |

## What separates a convincing result from a generic one

**Proportion is the whole game, and it has two ratios.** Ratio one: ball diameter to rod LENGTH. Chemistry keeps it small so the model stays open [10]; Molymod's real numbers (17 to 23 mm balls on 19 mm links) put ball and link at about one to one [18], which is already fatter than we want. Ratio two: ball diameter to rod diameter. Cinema 4D's own tip is that setting "Cylinder Radius and Sphere Radius to the same value" gives a plain wireframe look [14], so the bead-and-wire look is defined by the sphere being larger than the cylinder. The Blendkit recipe uses a rod profile circle of radius 0.001 against a vertex icosphere of radius 0.2 [19], a 200:1 ratio (units are Blender scene units; the absolute size is scene-dependent, the ratio is what matters). Space frames are the other extreme: node balls 49.5 to 350 mm against members 30 to 355 mm [17], so "truss" alone will not keep the beads small. **Phrasing that keeps the spheres tiny but visible (inference from the two ratios):** name both relations, "a very small sphere at every vertex, a few times the wire's diameter and a small fraction of the strut's length". Never say "large nodes", never say "truss joints".

**Where the spheres go.** Every tool places a sphere at every point and a cylinder on every edge [14][15]; Houdini even calls the sphere option "Round Corners" [15], i.e. the sphere exists to hide the joint where cylinders meet. A render where some corners have no bead reads as broken because the cylinder ends would show. So: "a sphere at every vertex where struts meet, none anywhere else".

**Sparse, not dense.** The generic wireframe render is a dense triangle net because the tools draw every polygon edge: the Blender Wireframe shader node warns "topology will always appear triangulated" [9], KeyShot exposes "each polygon" [16], and the Wireframe modifier iterates over every face [1]. The convincing skeleton is a line SET, in Freestyle's sense: silhouette, crease (edges sharper than a crease angle), border, and hand-marked edges [8]. In Blender terms the mesh has been simplified first, "dissolving vertices and edges in flattish areas" (Limited Dissolve) [7], and the overlay slider offers the same idea: "lower values hide edges on surfaces that are almost flat" [4]. Prompt words that carry it: "only the silhouette and the main construction edges", "no triangulation", "no surface mesh", "low edge count".

**Straight, uniform, hard-ended struts.** The documented route to a true cylinder is a curve extruded along a circular profile: Curve to Mesh extrudes the profile "along all splines" and "Fill Caps" closes the ends with flat n-gons [6]; Houdini adds "End-Caps" [15]. The Wireframe modifier is the documented source of blobs: "Wireframe thickness is an approximation ... skinny faces can cause ugly spikes" [1]. The hard-surface vocabulary ("precise edges, clean panel work, and CAD-like accuracy" [22]) is what keeps a model from sculpting the rods. Wire-frame lines are "(straight) lines or curves" [12]; say straight.

**Shine on the bead only.** A small sphere reads as glossy through its rim: Fresnel makes "the edges of objects and surfaces facing perpendicular to the view to reflect brighter", and roughness sets the highlight falloff [21]. Rods should not compete: the Blendkit recipe assigns three separate materials, "one for each part of the mesh: surface, edges, and vertices", and notes "Simple colors usually work best" [19]; KeyShot separates Wire Color from Base Color [16]. Glossy-node-plus-matte-rod as a named convention: nothing solid found; it is an inference from "separate materials per part" plus the chemistry kit, where the coloured balls carry the information and the links are plain grey [10][18].

**A colour that sits ON the body, not in it.** For the overlay variant the wire hue must contrast with the body. The colour-theory word is complementary ("opposite sides of the color wheel"; "Fully saturated complementary colors maximize color contrast") [13]. The design-system word is the on-colour: "Use on-primary on top of primary ... to provide accessible contrast", and tertiary exists "to derive the roles of contrasting accents" [25]. Light-metal-on-dark and dark-on-light as a named practice: nothing solid found beyond the on-colour principle; treat as inference.

**The overlay must float, not sink.** Two documented mechanisms. (a) Geometry: the Wireframe modifier's Offset, "(-1 to 1) to change whether the wireframes are generated inside or outside of the original mesh", zero centres them on the edges [1]; so an overlay wire is pushed OUTSIDE the surface. (b) Rendering: NVIDIA's whitepaper describes line-over-fill z-fighting ("The lines z-fight with triangles rendered using the same vertex positions") and the classic fix, a "depth bias offset" so the fill "is behind the depth of the fragment drawn by the wireframe" [20]; Blender's overlay draws "edges on top of existing shading" [4]. Prompt words: "wire sits proud of the surface", "floating a hair above the body", "never sinking into it". Spline's Outline layer has the same inside/outside idea for its contour ("only inside or both inside or outside") [23].

## Proposed clause upgrades

Each is a concrete phrase, with the reason and the source.

1. **Name the medium by its two real referents, not by "wireframe".**
   "a ball-and-stick skeleton of the icon: thin straight struts between very small spheres, like a chemistry model kit or a space-frame truss" - "ball-and-stick" fixes bead-on-rod proportion [10][18]; "strut" and "node" are the truss words [11][17]; "wireframe" alone pulls black-and-white fine-line drawings [24].

2. **State both proportion relations.**
   "every sphere is a few times the strut's diameter and a small fraction of the strut's length; struts are much longer than any sphere is wide" - Wikipedia's rule is sphere radius vs rod length [10]; C4D's equal-radius tip shows why sphere must exceed cylinder [14]; the 200:1 rod-to-sphere ratio in the Blendkit recipe is the practitioner setting [19].

3. **Placement rule, stated as a rule.**
   "one sphere at every vertex where struts meet, and nowhere else; no sphere is missing from any corner" - all three tool nodes put a sphere at every point [14][15][2]; Houdini's "Round Corners" name says the sphere hides the joint [15].

4. **Sparse line set.**
   "only the silhouette and the main construction edges; no triangulated surface mesh, no filler edges on flat regions" - triangulation is the documented default failure [9][16][1]; Freestyle's silhouette/crease/border/edge-mark set and Limited Dissolve's "flattish areas" are the sparse vocabulary [8][7][4].

5. **Strut geometry.**
   "struts are straight cylinders of one constant diameter with flat capped ends, hard-surface, CAD-clean; no taper, no sag, no blobs at the joints" - Curve to Mesh with a circle profile and Fill Caps / End-Caps is the documented true-cylinder route [6][15]; the Wireframe modifier's spikes are the documented blob source [1]; "CAD-like accuracy" is the hard-surface definition [22]; wire-frame lines are "(straight)" [12].

6. **Bead material.**
   "spheres are glossy with a tight specular highlight and a bright Fresnel rim; struts are satin, no highlight competes with the beads" - Fresnel rim and roughness-controlled highlight [21]; separate materials per part is the practice [19][16]. Mark the glossy/matte split itself as inference.

7. **Contrast colour, two variants.**
   Overlay: "the skeleton in one complementary colour to the body, read as an on-colour sitting on top of it" [13][25]. Standalone: "the skeleton in one colour that contrasts with the background; simple flat colours" - "Simple colors usually work best" [19].

8. **Overlay depth.**
   "traced over a soft matte body, the wire floating a hair above the surface, never sinking into it or z-fighting" - Offset outside [1], depth bias [20], "edges on top of existing shading" [4].

9. **Negative list, all sourced failure modes.**
   "not a dense triangle wireframe [9][16], not equal-size spheres and rods [14], not a truss with fat joints [17], not a monochrome line drawing [24], no spiky or blobby wire [1]".

## Sources

1. Blender 5.2 Manual, Wireframe Modifier - https://docs.blender.org/manual/en/latest/modeling/modifiers/generate/wireframe.html
2. Blender 5.2 Manual, Instance on Points Node - https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/instances/instance_on_points.html
3. Blender 5.2 Manual, Skin Modifier - https://docs.blender.org/manual/en/latest/modeling/modifiers/generate/skin.html (fetched; "per-vertex radius", branch points = "a vertex with three or more connected edges"; makes organic skinned tubes, so it is the wrong tool for this look and is not cited above)
4. Blender 5.2 Manual, Viewport Overlays (Geometry: Wireframe, Opacity) - https://docs.blender.org/manual/en/latest/editors/3dview/display/overlays.html
5. Blender 5.2 Manual, Mesh to Points Node (Vertices mode: "Points are generated for each vertex") - https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/mesh/operations/mesh_to_points.html
6. Blender 5.2 Manual, Curve to Mesh Node - https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/curve/operations/curve_to_mesh.html
7. Blender 5.2 Manual, Delete and Dissolve (Limited Dissolve) - https://docs.blender.org/manual/en/latest/modeling/meshes/editing/mesh/delete.html
8. Blender 5.2 Manual, Freestyle Line Set, Edge Types - https://docs.blender.org/manual/en/latest/render/freestyle/view_layer/line_set.html
9. Blender 5.2 Manual, Wireframe shader node - https://docs.blender.org/manual/en/latest/render/shader_nodes/input/wireframe.html
10. Wikipedia, Ball-and-stick model - https://en.wikipedia.org/wiki/Ball-and-stick_model
11. Wikipedia, Space frame - https://en.wikipedia.org/wiki/Space_frame
12. Wikipedia, Wire-frame model - https://en.wikipedia.org/wiki/Wire-frame_model
13. Wikipedia, Color scheme - https://en.wikipedia.org/wiki/Color_scheme
14. Maxon Cinema 4D S22 help, Atom Array - https://help.maxon.net/c4d/s22/us/html/OATOMARRAY.html
15. SideFX Houdini docs, Wireframe geometry node - https://www.sidefx.com/docs/houdini/nodes/sop/wire.html
16. KeyShot Manual, Wireframe material - https://manual.keyshot.com/manual/materials/material-types/special-material/wireframe/
17. Mero, Spaceframe System - https://www.mero.com.sg/fa%C3%A7ade-system/spaceframe-system/
18. Molymod, The Molymod System - https://molymod.com/molymod-system/
19. Blendkit, Tutorial: Render subdivision modifier wireframe in Blender with Geometry Nodes - https://www.blendkit.com/blender-tutorials/tutorial-render-subdivision-modifier-wireframe-in-blender-with-geometry-nodes/
20. NVIDIA, Solid Wireframe white paper (WP-03014-001_v01, February 2007) - https://developer.download.nvidia.com/whitepapers/2007/SDK10/SolidWireframe.pdf
21. Artisticrender, What is fresnel in Blender and how do we use it - https://artisticrender.com/what-is-fresnel-in-blender-and-how-do-we-use-it/
22. N-hance School glossary, Hard Surface - https://nhance-school.com/tools/glossary/hard-surface
23. Spline docs, Outline Layer - https://docs.spline.design/materials-shading/outline-layer
24. Midlibrary, Wireframe drawing (Midjourney style) - https://midlibrary.io/styles/wireframe-drawing
25. Android Developers, Material Design 3 in Compose (color roles) - https://developer.android.com/develop/ui/compose/designsystems/material3

Not obtained, so not cited: a maker-published rod DIAMETER for chemistry kits (Molymod gives ball diameters and link lengths only); a numbered node-to-member ratio for space frames beyond Mero's ranges; any published statement that glossy nodes plus matte rods is a named convention; Material 3's own site (JavaScript-rendered, would not fetch).
