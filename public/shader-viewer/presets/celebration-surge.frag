// name: Celebration Surge
// group: Away
// param float u_surge "Surge" 0.0 1.0 0.0
// param float u_buoyancy "Buoyancy" 0.0 1.0 0.5
// param float u_heat "Heat" 0.0 1.0 0.65
// param float u_settle "Settle" 0.0 1.0 0.5
//
// The win, as a transition. Surge is a 0..1 master: a cool low-energy plasma-
// fog swells into a warm buoyant bloom that rises from below, flares, then
// lands as a steady contented glow. The loud end of the personality dial,
// usable as a calm -> celebration page transition. Own POV: a rise-peak-settle
// gain curve over an upward-advected medium; emission self-shadows downward.
precision highp float;

uniform float u_time;
uniform float u_dark;
uniform float u_surge;
uniform float u_buoyancy;
uniform float u_heat;
uniform float u_settle;
uniform vec2  u_resolution;
varying vec2  v_uv;

float h(vec2 p) { return fract(sin(dot(p, vec2(269.5, 183.3))) * 43758.5453); }
float vn(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1, 0)), f.x),
             mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) {
  float s = 0.0, a = 0.55;
  for (int i = 0; i < 5; i++) { s += a * vn(p); p = p * 2.05 + vec2(1.3, 6.6); a *= 0.5; }
  return s;
}
vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

void main() {
  vec2 uv = v_uv;
  vec2 p = uv - 0.5;
  p.x *= u_resolution.x / max(u_resolution.y, 1.0);

  float s = clamp(u_surge, 0.0, 1.0);
  float bump = sin(s * 3.14159265);                 // rise, peak mid, fall
  float floorGlow = s * u_settle;
  float gain = bump * (1.0 - 0.45 * u_settle) + floorGlow * 0.9;

  // buoyant upward advection; faster as energy climbs
  float rise = u_time * mix(0.06, 0.24, u_buoyancy) * (0.4 + 0.9 * s);
  vec2 q = p + vec2(0.0, rise);
  vec2 w = vec2(fbm(q * 2.0), fbm(q * 2.0 + vec2(4.1, 1.7)));
  float d = fbm(q * 2.2 + (0.8 + 1.6 * s) * (w - 0.5));
  float dens = smoothstep(0.34, 0.92, d);

  // more medium is lofted from below during the surge
  float lift = smoothstep(-0.1, 0.6, uv.y);         // fades toward the top
  dens *= mix(1.0, 1.0 - 0.4 * lift + 0.5 * (1.0 - lift) * s, 0.8);

  // downward self-shadow so the bloom stays volumetric
  float tau = 0.0; vec2 mp = q;
  for (int i = 0; i < 5; i++) { mp.y -= 0.1; tau += smoothstep(0.4, 0.95, fbm(mp * 2.2)); }
  float shade = exp(-tau * 0.1 * 2.0);

  // colour: cool violet base -> warm gold as heat/energy climbs
  vec3 coolBase = mix(vec3(0.24, 0.20, 0.34), vec3(0.10, 0.08, 0.20), u_dark);
  vec3 warm  = mix(vec3(1.0, 0.72, 0.34), vec3(1.0, 0.62, 0.26), u_dark);
  vec3 gold  = mix(vec3(1.0, 0.90, 0.62), vec3(1.0, 0.82, 0.5), u_dark);
  vec3 emit  = mix(warm, gold, u_heat);
  vec3 tint  = mix(coolBase, emit, clamp(gain + 0.15 * s, 0.0, 1.0));
  vec3 bg    = mix(vec3(0.9, 0.9, 0.94), vec3(0.02, 0.02, 0.05), u_dark);

  vec3 col = mix(bg, tint * (0.5 + shade), dens);
  col += emit * dens * gain * 0.8;                  // the flare
  col = aces(col * (1.0 + 0.5 * gain));

  float vig = smoothstep(1.4, 0.15, length(p) * 1.5);
  col *= mix(1.0, vig, 0.5 - 0.3 * gain);           // vignette breathes open at peak
  col += (h(uv * u_resolution + rise) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
