// name: The Snap
// group: Away
// param float u_sharpness "Sharpness" 0.0 1.0 0.7
// param float u_cadence "Cadence" 0.0 1.0 0.35
// param float u_hue "Hue" 0.0 1.0 0.55
//
// The concierge deciding. A soft low-contrast fog holds, then SNAPS: over a
// beat the medium sheds its noise and condenses into one coherent lens of
// certainty, then relaxes back to fog. A booking-commit flourish. Own POV:
// a temporal EVENT with an asymmetric envelope (sharp attack, slow release)
// that crossfades a turbulent fog into a smooth radial lens and spikes a key
// light. ACES. No steady field anywhere.
precision highp float;

uniform float u_time;
uniform float u_dark;
uniform float u_sharpness;
uniform float u_cadence;
uniform float u_hue;
uniform vec2  u_resolution;
varying vec2  v_uv;

float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1, 0)), f.x),
             mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { s += a * vn(p); p = p * 2.1 + vec2(3.7, 1.9); a *= 0.5; }
  return s;
}
vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

void main() {
  vec2 uv = v_uv;
  vec2 p = uv - 0.5;
  p.x *= u_resolution.x / max(u_resolution.y, 1.0);

  // beat: hold, sharp attack, slow release, loop
  float period = mix(7.0, 1.8, clamp(u_cadence, 0.0, 1.0));
  float ph = fract(u_time / period);
  float att = smoothstep(0.05, 0.11, ph);
  float rel = 1.0 - smoothstep(0.11, 0.55, ph);
  float clarity = att * rel;                          // 0 fog, ~1 at the snap

  // fog: turbulent, drifting, fades a touch at the snap
  float fog = smoothstep(0.42, 0.9, fbm(p * 3.2 + u_time * 0.06));
  fog *= 1.0 - 0.5 * clarity;

  // lens: a smooth coherent core that condenses in
  float r = length(p);
  float tight = mix(5.0, 16.0, u_sharpness);
  float lens = exp(-r * r * tight) * clarity;

  float medium = mix(fog, max(fog * 0.3, lens), clarity);

  // key light spikes at the snap
  float key = 1.0 + clarity * mix(1.5, 4.0, u_sharpness);

  // colour: cool fog -> crystallised certainty (hue: cool insight to warm commit)
  vec3 cool = mix(vec3(0.30, 0.45, 0.66), vec3(0.16, 0.28, 0.5), u_dark);
  vec3 warm = mix(vec3(1.0, 0.86, 0.55), vec3(1.0, 0.78, 0.42), u_dark);
  vec3 core = mix(vec3(0.55, 0.75, 1.0), warm, u_hue);
  vec3 tint = mix(cool, core, clarity);
  vec3 bg = mix(vec3(0.88, 0.90, 0.94), vec3(0.02, 0.03, 0.06), u_dark);

  vec3 col = mix(bg, tint * key, medium);
  col += core * lens * key * 0.6;                     // the bright bead of certainty

  col = aces(col);
  float vig = smoothstep(1.3, 0.2, r * 1.7);
  col *= mix(1.0, vig, 0.55);
  col += (h(uv * u_resolution + ph) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
