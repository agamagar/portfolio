// ---------------------------------------------------------------------------
// Hover tessellation: the same five layouts from the bonds view, rendered
// stroke-only (no fill, no lights, no color) on a black ground. Every grid
// holds still — only the single brick under the cursor lifts ~3% of its own
// length, eased back down the instant it isn't hovered. No drag, no orbit:
// hover is the only interaction.
// ---------------------------------------------------------------------------

function makeHoverTessellation(containerId, canvasW, canvasH, genFn, opts = {}) {
  const camRX = (opts.baseRotX ?? -16) * (Math.PI / 180);
  const camRY = (opts.baseRotY ?? 8) * (Math.PI / 180);

  return new p5((p) => {
    let instances = [];
    let lift = [];

    // Manual projection matching p.rotateX(camRX); p.rotateY(camRY); under an
    // orthographic camera — used for hit-testing since the camera never moves
    // (no drag/orbit in this view), so there's no need for a p5 projection call.
    function project(x, y, z) {
      const y1 = y * Math.cos(camRX) - z * Math.sin(camRX);
      const z1 = y * Math.sin(camRX) + z * Math.cos(camRX);
      const x2 = x * Math.cos(camRY) + z1 * Math.sin(camRY);
      return { sx: canvasW / 2 + x2, sy: canvasH / 2 + y1 };
    }

    p.setup = () => {
      const c = p.createCanvas(canvasW, canvasH, p.WEBGL);
      c.parent(containerId);
      instances = genFn(canvasW, canvasH);
      lift = new Array(instances.length).fill(0);
    };

    p.draw = () => {
      p.background(0);
      p.ortho(-canvasW / 2, canvasW / 2, -canvasH / 2, canvasH / 2, -2000, 2000);
      p.push();
      p.rotateX(camRX);
      p.rotateY(camRY);

      // pick the hovered brick via the same fixed-camera projection above.
      let hoveredIdx = -1;
      let bestD = 22;
      const mouseInside = p.mouseX >= 0 && p.mouseX <= canvasW && p.mouseY >= 0 && p.mouseY <= canvasH;
      if (mouseInside) {
        for (let k = 0; k < instances.length; k++) {
          const b = instances[k];
          const { sx, sy } = project(b.x, b.y, b.z || 0);
          const d = p.dist(p.mouseX, p.mouseY, sx, sy);
          if (d < bestD) { bestD = d; hoveredIdx = k; }
        }
      }

      p.noFill();
      p.stroke(255);
      p.strokeWeight(1);

      for (let k = 0; k < instances.length; k++) {
        const b = instances[k];
        const target = k === hoveredIdx ? 1 : 0;
        lift[k] += (target - lift[k]) * 0.2;
        const pop = lift[k] * (b.dims[0] * 0.03); // "moves about 3% of its own length"
        p.push();
        p.translate(b.x, b.y, (b.z || 0) + pop);
        if (b.rz) p.rotateZ(b.rz * (Math.PI / 180));
        if (b.rx) p.rotateX(b.rx * (Math.PI / 180));
        if (b.ry) p.rotateY(b.ry * (Math.PI / 180));
        p.box(b.dims[0], b.dims[1], b.dims[2]);
        p.pop();
      }
      p.pop();
    };
  });
}

// Auto-run removed — see the builder functions at the bottom of
// brick-relief.js. makeHoverTessellation stays a global factory used there.
