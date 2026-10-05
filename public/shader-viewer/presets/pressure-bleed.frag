// name: Pressure Bleed
// group: Away
// param float u_release "Release" 0.0 1.0 0.15
// param float u_pressure "Pressure" 0.0 1.0 0.65
// param float u_flood "Warmth Flood" 0.0 1.0 0.6
//
// Away price-drop alert. The medium is jammed hard against the top of frame,
// high-frequency and tight; as Release rises it DECOMPRESSES downward, the
// spatial frequency relaxes, and warmth floods up from below. The value beat
// rendered as the medium's own frequency easing. Own POV: a vertical
// compression field drives octave spacing; a downward transmittance march
// lets an up-light through as the squeeze eases. Filmic grade, not ACES.
precision highp float;

uniform float u_time;
uniform float u_dark;
uniform float u_release;
uniform float u_pressure;
uniform float u_flood;
uniform vec2  u_resolution;
varying vec2  v_uv;

float h(vec2 p) { return fract(sin(dot(p, vec2(41.27, 289.13))) * 43758.5453); }

// quintic value noise
float vn(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(h(i), h(i + vec2(1, 0)), f.x),
             mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y);
}

// fbm whose octave lacunarity tightens with the compression factor k
float fbmC(vec2 p, float k) {
  float s = 0.0, a = 0.6, f = 1.0;
  for (int i = 0; i < 5; i++) {
    s += a * vn(p * f);
    f *= mix(2.0, 2.75, k);
    a *= 0.5;
    p += vec2(6.4, 2.1);
  }
  return s;
}

// Jim Hejl filmic (includes gamma)
vec3 filmic(vec3 x) {
  vec3 X = max(vec3(0.0), x - 0.004);
  return (X * (6.2 * X + 0.5)) / (X * (6.2 * X + 1.7) + 0.06);
}

void main() {
  vec2 uv = v_uv;
  vec2 p = uv;
  p.x *= u_resolution.x / max(u_resolution.y, 1.0);

  float rel = clamp(u_release, 0.0, 1.0);
  // squeeze is strongest at the top, released globally as rel rises
  float squeeze = clamp(u_pressure * (1.0 - rel) * smoothstep(0.05, 1.0, uv.y), 0.0, 1.0);

  float drift = u_time * 0.04;
  float scale = mix(1.7, 0.95, rel);                 // whole field loosens on release
  vec2 sp = (p + vec2(0.0, rel * 0.55)) * scale;     // decompression pushes it down
  float d = fbmC(sp + vec2(0.0, drift), squeeze);
  float dens = smoothstep(mix(0.34, 0.5, rel), 0.96, d) * mix(1.0, 0.82, rel);

  // downward transmittance march toward an up-light; extinction eases with rel
  float ext = mix(4.2, 1.2, rel);
  float tau = 0.0;
  vec2 mp = sp;
  for (int i = 0; i < 6; i++) {
    mp.y += 0.09;
    tau += smoothstep(0.4, 0.96, fbmC(mp + vec2(0.0, drift), squeeze));
  }
  float light = exp(-tau * 0.09 * ext);

  // vertical warm flood rising from the bottom as the pressure releases
  float flood = rel * u_flood * smoothstep(0.85, 0.0, uv.y);

  vec3 coolLo = mix(vec3(0.78, 0.82, 0.88), vec3(0.05, 0.07, 0.12), u_dark);
  vec3 coolHi = mix(vec3(0.55, 0.63, 0.74), vec3(0.28, 0.40, 0.55), u_dark);
  vec3 warm   = mix(vec3(1.00, 0.72, 0.46), vec3(1.00, 0.55, 0.28), u_dark);

  vec3 medium = mix(coolLo, coolHi, light);          // lit medium, cool while tense
  medium = mix(medium, warm, flood * (0.5 + 0.5 * light));
  vec3 bg = mix(vec3(0.86, 0.88, 0.93), vec3(0.02, 0.03, 0.05), u_dark);

  vec3 col = mix(bg, medium, dens);
  col += warm * flood * dens * 0.5;                  // warmth glows through the medium
  col = filmic(col * mix(0.9, 1.15, rel));           // exposure lifts as it breathes open

  float vig = smoothstep(1.3, 0.25, length(uv - 0.5) * 1.5);
  col *= mix(1.0, vig, 0.5);
  col += (h(uv * u_resolution + drift) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
