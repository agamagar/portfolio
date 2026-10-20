# Face system (features/)

A face is JSON: `{ "hair": {...}, "eyes": {...}, "nose": {...}, ... }`. `core.js` resolves it through the
modules in `modules/` into shape keys (the resting face), soft-warp handles (head shape), a palette, hair
params and a material, and `morph/faceRig3D.js` (`rig.setFace`) wears the result on the shared head.

- Add a feature: a file in `modules/` (`{ id, label, order, params, apply(values, acc) }`).
- Add a preset: a JSON file in `presets/`. Add a hair style: a file in `hairStyles/`.
- The Features panel in /face-lab is generated from the modules' `params`.
- Layering: head shape (handles) < resting face (keys) < emote keys (an emote replaces the resting
  weights of its group: eye*, brow*, mouth/jaw/cheek*, and they return when it ends).
- Works on the drawn (procedural) rig only: the fitted clay and noir rigs carry projected photo
  textures that a warp would tear.
- Preset `agam-clay` is tuned from ~/portfolio-inbox/face-refs/clay-ref.webp.
