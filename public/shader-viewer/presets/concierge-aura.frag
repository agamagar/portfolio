// name: Concierge Aura
// group: Away
// param float u_energy "Energy" 0.0 1.0 0.55
// param float u_warmth "Warmth" 0.0 1.0 0.5
// param float u_grain "Grain" 0.0 1.0 0.35
//
// Away's personality dial as a moving image: Energy dials the aura from calm
// (slow, cool, minimal - "your money is moving") to lively (fast, warm,
// blooming - "winning against the airline"). Volumetric medium + soft light +
// ACES/dither, per the house standard. No discrete geometry.
precision highp float;

uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_dark;
uniform float u_energy;
uniform float u_warmth;
uniform float u_grain;
varying vec2 v_uv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

const mat2 R = mat2(0.80, -0.60, 0.60, 0.80);

float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 6; i++) {
    s += a * vnoise(p);
    p = R * p * 2.0 + 11.3;
    a *= 0.5;
  }
  return s;
}

// ACES filmic tonemap (Narkowicz fit)
vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

void main() {
  vec2 uv = v_uv;
  vec2 p = uv - 0.5;
  p.x *= u_resolution.x / max(u_resolution.y, 1.0);

  float energy = clamp(u_energy, 0.0, 1.0);
  float t = u_time * mix(0.05, 0.34, energy);

  // domain-warped flow (calm = gentle, lively = turbulent)
  vec2 q = vec2(fbm(p * 1.6 + vec2(0.0, t)),
                fbm(p * 1.6 + vec2(5.2, -t)));
  vec2 r = vec2(fbm(p * 1.6 + 3.0 * q + vec2(1.7, 9.2) + t * 0.5),
                fbm(p * 1.6 + 3.0 * q + vec2(8.3, 2.8) - t * 0.5));
  float d = fbm(p * 1.6 + mix(1.5, 4.0, energy) * r);

  // soft light toward the pointer (falls back to center)
  vec2 lp = (u_mouse - 0.5);
  lp.x *= u_resolution.x / max(u_resolution.y, 1.0);
  float rad = length(p - lp * 0.6);
  float glow = exp(-rad * rad * mix(3.5, 1.6, energy));

  // density comes from the medium (keeps dark negative space); glow only lights it
  float dens = smoothstep(0.30, 0.88, d);

  // palette: calm cool -> lively warm, biased by Warmth
  float warm = clamp(u_warmth * 0.6 + energy * 0.5, 0.0, 1.0);
  vec3 cool1 = vec3(0.06, 0.10, 0.20);
  vec3 cool2 = vec3(0.20, 0.45, 0.72);
  vec3 warm1 = vec3(0.14, 0.05, 0.12);
  vec3 warm2 = vec3(0.98, 0.42, 0.55);
  vec3 warm3 = vec3(1.00, 0.78, 0.42);
  vec3 lo = mix(cool1, warm1, warm);
  vec3 hi = mix(cool2, mix(warm2, warm3, 0.40), warm);

  // light the medium toward the highlight, but only where medium actually is
  vec3 col = mix(lo, hi, dens);
  col = mix(col, hi, clamp(glow * mix(0.20, 0.50, energy) * dens, 0.0, 1.0));
  float rim = dens * dens * dens;                       // safe pow (dens >= 0)
  col += warm3 * rim * warm * energy * 0.22;            // subtle warm rim when lively

  // gaps in the medium reveal the background floor (dark variant deepens it)
  vec3 bg = mix(vec3(0.90, 0.91, 0.95), vec3(0.015, 0.02, 0.04), u_dark);
  col = mix(bg, col, dens);
  col *= mix(1.0, 0.94, u_dark);

  // grade
  col = aces(col);
  float vig = smoothstep(1.25, 0.20, length(uv - 0.5) * 1.6);
  col *= mix(1.0, vig, 0.60);
  float dz = (hash(uv * u_resolution + t) - 0.5) / 255.0;
  col += dz * (1.0 + u_grain * 6.0);

  gl_FragColor = vec4(col, 1.0);
}
