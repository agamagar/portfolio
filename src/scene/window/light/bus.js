// The light bus: per-scene state shared by the light rig (lights.js) and the post
// pipeline (post.js). The engine calls lights.update() before post.update() every
// frame, so what the rig writes here (the exposure, the flash, the rectangles the
// key is estimated from, the volume's uniforms) is current when the post reads it.
// It lives on scene.userData, so a rebuilt rig and a long-lived pipeline share it
// without either holding the other.
//
// window.__windowLight mirrors the last frame's numbers for tools (read only).

export const VOLUME_LAYER = 11; // the layer the air (VolumeNodeMaterial) and its lights share

export function lightBus(scene) {
  if (!scene.userData.__windowLight) {
    scene.userData.__windowLight = {
      exposure: 1, // scene-linear multiplier the post applies before tone mapping
      flare: 0, // veiling glare, scene units added everywhere
      flash: 0, // lightning 0..1 this frame
      key: 0.4, // the estimated key luminance (scene units)
      rects: null, // { opening: [4 x Vector3], screen: [4 x Vector3] } world corners
      lum: { sky: 0, window: 0, screen: 0.5, room: 0.02 }, // scene luminances used by the key
      sunAlt: 10,
      golden: 0, // 0..1 how golden the hour is (the sky grade)
      sunColor: [1, 1, 1], // linear, normalised to max 1
      volume: null, // the air's uniforms, set by post.js (lights.js drives some)
      debug: {},
    };
  }
  return scene.userData.__windowLight;
}

export function publishDebug(bus) {
  if (typeof window === "undefined") return;
  window.__windowLight = {
    // the camera (light/exposure.js "the two exposures"): ev100, exposure (E_true,
    // what the physical light gets), exposureRender (the image's), lightGain
    ...(bus.camera || {}),
    exposure: bus.exposure,
    exposureTrue: bus.camera?.exposure ?? bus.exposure,
    flare: bus.flare,
    flash: bus.flash,
    key: bus.key,
    lum: { ...bus.lum },
    sunAlt: bus.sunAlt,
    golden: bus.golden,
    sunColor: bus.sunColor.slice(),
    ...bus.debug,
  };
}
