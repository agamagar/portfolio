// name: Molten
// group: Volumetric
// param float u_crust "Crust" 0.0 1.0 0.50
// param float u_heat  "Heat"  0.0 1.0 0.60
// param float u_flow  "Flow"  0.0 1.0 0.30
//
// Molten rock: a dark charcoal crust broken by slow-flowing glowing lava, hottest in
// the pools and along the ridged seams, pulsing as it cools and reheats. medium+light
// (continuous domain-warped medium, no drawn cells); ACES + vignette + dither, highp,
// safe pow. Crust dials the solid/molten balance; Heat dials the glow.
precision highp float;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_dark;
uniform float u_crust;
uniform float u_heat;
uniform float u_flow;
varying vec2 v_uv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float v = 0.0, a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 6; i++) { v += a * noise(p); p = m * p; a *= 0.5; } return v; }
vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }

void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = vec2(v_uv.x * aspect, v_uv.y) * 3.0;
    float t = u_time * 0.08 * u_flow;

    // slow domain-warped flow
    vec2 w = vec2(fbm(p * 1.2 + vec2(0.0, t)), fbm(p * 1.2 + vec2(4.1, -t))) - 0.5;
    vec2 q = p + w * 0.5;
    float d = fbm(q * 2.2 + t * 0.5);
    float pulse = 0.7 + 0.3 * sin(t * 2.0 + d * 6.0);

    // hot pools (thresholded by Crust) + glowing ridged seams
    float thr = mix(0.44, 0.70, u_crust);
    float glow = smoothstep(thr, thr + 0.20, d);
    float seam = pow(clamp(1.0 - abs(fbm(q * 5.0) - 0.5) * 3.5, 0.0, 1.0), 2.0); // base clamped
    float hot = clamp((glow + seam * 0.40) * pulse, 0.0, 1.0);

    vec3 crust = mix(vec3(0.05, 0.045, 0.05), vec3(0.13, 0.09, 0.08), fbm(q * 3.0));
    vec3 lava = (vec3(0.70, 0.08, 0.00)
              + vec3(0.50, 0.30, 0.00) * smoothstep(0.30, 0.85, hot)
              + vec3(0.60, 0.60, 0.20) * smoothstep(0.75, 1.00, hot)) * mix(0.9, 1.7, u_heat);
    vec3 col = mix(crust, lava, smoothstep(0.06, 0.50, hot));

    col = mix(col * 1.12, col, u_dark);              // dark theme = slightly dimmer crust
    vec2 vg = (v_uv - 0.5) * 2.0; col *= 1.0 - 0.18 * dot(vg, vg);

    col = aces(col * 1.15);
    col += (hash(gl_FragCoord.xy + t) - 0.5) / 255.0;
    gl_FragColor = vec4(col, 1.0);
}
