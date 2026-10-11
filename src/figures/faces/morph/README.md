# Mascot morph: the line drawing becomes the 3D head (2026-10-10)

New files only; nothing here edits FaceSV.jsx, faceSkins.js or public/faces (it reads them).

- drawing.js: the landing-page drawing's paths (IllustratedMascot / faceRig.js), as parts.
- faceRig3D.js: the fitted clay head (face.glb + fit.json) with FaceSV's own "fit" materials,
  but no clock: the caller poses it and asks for a frame (scrubbable, recordable). Also an ids
  pass (part codes; the near ear split off from the skin).
- morphRenderer.js: one WebGL canvas at the reference size (802 x 862). Draws the head in INK
  live from the mesh (hair as a solid mass, a band inside the silhouette and along the ear's
  join, the ear rim and fold, the nose's right-hand contour, eyes, brows, mouth), constant
  pixel widths via jump flooding; plus flat colours and the clay; plus the morph field.
- morphField.js: thin-plate-spline warps (drawing -> ink and back) on a grid, signed distance
  fields of the drawing and of the 3D ink, the textures.
- mascotMorph.js: the timeline (t 0..1, every frame a pure function of t) and the builder.
- handoff.json: the hand-off pose and the landmark pairs (tools/face3d/morph/landmarks.py).
- MorphPage.jsx: the test page (canvas, scrubber, play). fitPose.js: the pose fit.

Timeline: draw 0-0.06; morph 0.06-0.40 (the drawing slides onto the 3D ink drawn at the
drawing's own pose: one smooth warp carries every stroke, a distance blend closes the last
pixels); at 0.40 the field equals the live ink render (measured: mean 0.10/255, edge pixels
only); turn 0.40-0.62 (the ink head turns from the drawing's pose, yaw -12.4 deg, to the
fitted one); develop 0.58-0.93 (colour washes in from deep inside out, ink leaves along a
crisp front so the outline goes last, lines thin away); settle to 1.

Why the turn happens in ink: the clay textures are projected from the fitted camera, so a
turned clay head shows smeared texture on the far ear; the ink look has no textures.

To wire into the site: render <MorphPage/> or call createMascotMorph(canvas) and drive
render(t). It needs WebGL2 (float render targets). If face.glb or fit.json change, re-run
tools/face3d/morph (the pose fit and landmarks.py) to refresh handoff.json.
