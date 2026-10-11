// The three.js face as a single still, for the 3D favicon's last stop (12 Oct 2026, Agam: "the final
// image added to the morph is the 3js face"). It is the same fitted clay head the hero shows
// (faceRig3D.js: face.glb + fit.json, FaceSV's own "fit" materials), posed at the fitted rest
// pose and rendered ONCE into a square canvas with a clear ground. The favicon uploads that as a
// texture; nothing here runs per frame, and the WebGL context is released straight after.
//
// Imported dynamically (favicon3d.js startNow) so three, the GLB loader and the rig stay out of
// the first load. Resolves to null if anything fails: the favicon keeps its clay blob.
import * as THREE from "three";
import { createFaceRig } from "../figures/faces/morph/faceRig3D";

// the reference frame the camera fit was made in (morphRenderer FW x FH)
const FW = 802, FH = 862;

export async function renderFaceStill(size = 128, { fill = 0.94 } = {}) {
  const k = 0.4; // render at 40% of the reference: sharp enough to downscale into 128 px
  const W = Math.round(FW * k), H = Math.round(FH * k);
  const renderer = new THREE.WebGLRenderer({ alpha: true, premultipliedAlpha: true, antialias: true, preserveDrawingBuffer: true });
  try {
    renderer.setPixelRatio(1);
    renderer.setSize(W, H, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const rig = createFaceRig({ W, H });
    await rig.ready;
    rig.pose({ yaw: 0, pitch: 0, keys: {} });
    // as the morph does: an sRGB multisampled target, then to the canvas
    const rt = new THREE.WebGLRenderTarget(W, H, { samples: 4, colorSpace: THREE.SRGBColorSpace });
    rig.shaded(renderer, rt);
    // the target to the canvas through a quad
    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: rt.texture, transparent: true, premultipliedAlpha: true, depthTest: false })));
    renderer.setRenderTarget(null);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.render(scene, cam);
    // the head, centred in a square, with its crown and chin inside the frame
    const out = document.createElement("canvas");
    out.width = out.height = size;
    const g = out.getContext("2d");
    g.imageSmoothingQuality = "high";
    const scale = (size * fill) / H;
    const w = W * scale, h = H * scale;
    g.drawImage(renderer.domElement, (size - w) / 2, (size - h) / 2, w, h);
    rt.dispose();
    return out;
  } catch (err) {
    console.warn("faceStill: failed", err);
    return null;
  } finally {
    renderer.dispose();
    renderer.forceContextLoss?.();
  }
}
