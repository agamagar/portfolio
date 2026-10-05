// name: Locked-In Calm
// group: Away
// param float u_lock "Lock" 0.0 1.0 0.3
// param float u_volatility "Volatility" 0.0 1.0 0.55
// param float u_shield "Shield Glow" 0.0 1.0 0.5
//
// Away rate-lock confirmation. The subject is TIME, not space: a live rate
// jitters on fast stepped noise; as Lock rises the flicker damps into a slow,
// even, shielded breath and the colour steadies to a trusted blue-green.
// Own POV: brightness/density are modulated by a stepped time-hash whose
// amplitude is (1-lock); a broad ambient "shield" term rises with lock.
// Extended-Reinhard grade. The quiet-cool end of the personality dial.
precision highp float;

uniform float u_time;
uniform float u_dark;
uniform float u_lock;
uniform float u_volatility;
uniform float u_shield;
uniform vec2  u_resolution;
varying vec2  v_uv;

float h1(float x) { return fract(sin(x * 91.3458) * 47453.19); }
float h2(vec2 p)  { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

// cubic value noise (different smoothing from the other presets)
float vn(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h2(i), h2(i + vec2(1, 0)), f.x),
             mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 4.7; a *= 0.5; }
  return s;
}

void main() {
  vec2 uv = v_uv;
  vec2 p = uv;
  p.x *= u_resolution.x / max(u_resolution.y, 1.0);

  float lock = clamp(u_lock, 0.0, 1.0);

  // stepped flicker: value held for short frames, amplitude falls as it locks
  float rate = mix(6.0, 22.0, u_volatility);
  float step = floor(u_time * rate);
  float jitter = (h1(step) - 0.5) + 0.5 * (h1(step + 0.5) - 0.5);
  jitter *= (1.0 - lock) * u_volatility;

  // slow protective breath takes over as it locks
  float breath = sin(u_time * 0.6) * 0.5 + 0.5;
  float calm = mix(0.5, breath, lock);

  // the medium itself (gentle, near-still)
  float d = fbm(p * 2.2 + vec2(0.0, u_time * 0.03));
  float dens = smoothstep(0.25, 0.85, d);
  dens *= 1.0 + jitter * 0.9;                     // density flickers when unlocked

  // even shielded ambient luminance rises with lock
  float shield = u_shield * lock * (0.6 + 0.4 * breath);
  float lum = mix(0.35, 0.7, calm) * dens + shield * (0.4 + 0.6 * dens);
  lum *= 1.0 + jitter * 1.2;                       // brightness flickers when unlocked

  // colour steadies from anxious teal-grey to a trusted blue-green
  vec3 nervous = mix(vec3(0.42, 0.46, 0.48), vec3(0.10, 0.14, 0.17), u_dark);
  vec3 trusted = mix(vec3(0.30, 0.66, 0.60), vec3(0.10, 0.42, 0.42), u_dark);
  vec3 tint = mix(nervous, trusted, lock);
  vec3 bg = mix(vec3(0.90, 0.92, 0.93), vec3(0.02, 0.035, 0.045), u_dark);

  vec3 col = bg + tint * lum;
  col += trusted * shield * 0.5;                   // the even protective glow

  col = col / (1.0 + col);                         // extended Reinhard
  col = pow(col, vec3(0.4545));                    // gamma (col >= 0, safe)

  float vig = smoothstep(1.35, 0.3, length(uv - 0.5) * 1.5);
  col *= mix(1.0, vig, 0.4);
  col += (h2(uv * u_resolution + step) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
