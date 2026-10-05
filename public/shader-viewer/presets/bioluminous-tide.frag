// name: Bioluminous Tide
// group: Water
// param float u_bloom "Bloom Density" 0.0 1.0 0.5
// param float u_swell "Swell Motion" 0.0 1.0 0.45
// param float u_depth "Water Depth" 0.0 1.0 0.5
// param float u_wake "Wake Sharpness" 0.0 1.0 0.55
//
// A dark sea from just above: cold cyan-green light wells UP through the water
// only where turbulence stirs it, brightest along drifting shear-lines of wake
// and swell. Own POV: emission is driven by the GRADIENT MAGNITUDE (shear
// energy) of a swell-warped turbulence field, so light lives on moving fronts,
// not shapes; a broad plankton wash reads as glow diffused by the water above.
// Exponential-exposure grade.
precision highp float;

uniform float u_time;
uniform float u_dark;
uniform float u_bloom;
uniform float u_swell;
uniform float u_depth;
uniform float u_wake;
uniform vec2  u_resolution;
varying vec2  v_uv;

float h(vec2 p) { return fract(sin(dot(p, vec2(23.14, 71.9))) * 43758.5453); }
float vn(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1, 0)), f.x),
             mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y);
}
float fbm2(vec2 p) { return 0.6 * vn(p) + 0.4 * vn(p * 2.1 + 5.0); }
float fbm4(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.07 + vec2(2.3, 4.9); a *= 0.5; }
  return s;
}

float turb(vec2 p) {
  float sp = mix(0.02, 0.10, u_swell);
  vec2 w = vec2(fbm2(p * 0.9 + vec2(u_time * sp, 0.0)),
                fbm2(p * 0.9 + vec2(0.0, -u_time * sp) + 3.0));
  return fbm4(p * 2.6 + (w - 0.5) * 1.6 + vec2(0.0, u_time * sp * 1.4));
}

void main() {
  vec2 uv = v_uv;
  vec2 p = uv;
  p.x *= u_resolution.x / max(u_resolution.y, 1.0);

  float e = 0.011;
  float c = turb(p);
  float gx = turb(p + vec2(e, 0.0)) - c;
  float gy = turb(p + vec2(0.0, e)) - c;
  float shear = length(vec2(gx, gy)) / e;              // wake / front energy

  float wake = smoothstep(0.15, 0.6, shear * mix(0.7, 1.8, u_wake));   // crisp filaments
  float wash = smoothstep(0.5, 0.95, c);               // broad plankton bloom

  float buried = mix(1.0, 0.55, u_depth);              // deeper = more diffused/dim
  float emit = (wake * mix(0.5, 1.0, u_wake) + wash * 0.35 * (1.0 - 0.4 * u_wake));
  emit *= u_bloom * buried * 1.6;

  // cyan-green bioluminescence over inky (dark) or teal-slate (light) water
  vec3 sea   = mix(vec3(0.16, 0.32, 0.38), vec3(0.005, 0.02, 0.035), u_dark);
  vec3 glow  = mix(vec3(0.55, 1.0, 0.85), vec3(0.15, 1.0, 0.7), u_dark);
  sea *= mix(1.0, 0.5, u_depth);                       // depth darkens the base

  vec3 col = sea + glow * emit;
  col += glow * wake * wake * 0.4 * u_wake;            // hot core on the sharpest fronts

  col = vec3(1.0) - exp(-col * 1.7);                   // exponential exposure
  float vig = smoothstep(1.4, 0.25, length(uv - 0.5) * 1.5);
  col *= mix(1.0, vig, 0.45);
  col += (h(uv * u_resolution + u_time) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
