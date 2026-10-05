// name: Oil on Water
// group: Glow
// param float u_flow  "Flow"  0.0 1.0 0.35
// param float u_bands "Bands" 1.0 8.0 4.00
// param float u_sheen "Sheen" 0.0 1.5 0.80
//
// Thin-film interference on a flowing fluid (petrol / soap-film sheen): a twice-warped
// fbm sets film thickness, mapped to a spectral cos-palette, with a fresnel-ish rim
// sheen where the film thins. The natural evolution of Iridescent Wisp. medium+light;
// ACES + dither, highp, safe pow.
precision highp float;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_dark;
uniform float u_flow;
uniform float u_bands;
uniform float u_sheen;
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
    vec2 p = vec2(v_uv.x * aspect, v_uv.y) * 2.2;
    float t = u_time * 0.12 * u_flow;

    // twice-warp the fluid so the film flows and swirls
    vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(4.3, -t)));
    vec2 r = vec2(fbm(p + 2.2 * q + vec2(1.7, t)), fbm(p + 2.2 * q + vec2(9.1, -t)));
    float thick = fbm(p + 2.6 * r); // film thickness field, 0..1

    // thin-film interference: thickness -> phase -> spectral colour
    vec3 film = 0.5 + 0.5 * cos(thick * u_bands * 6.2831 + vec3(0.0, 2.094, 4.188));

    // gradient of thickness -> fresnel-ish rim sheen where the film thins
    float e = 0.01;
    float gx = fbm(p + 2.6 * r + vec2(e, 0.0)) - fbm(p + 2.6 * r - vec2(e, 0.0));
    float gy = fbm(p + 2.6 * r + vec2(0.0, e)) - fbm(p + 2.6 * r - vec2(0.0, e));
    float sheen = pow(clamp(1.0 - length(vec2(gx, gy)) * 6.0, 0.0, 1.0), 2.0); // base clamped >= 0

    vec3 water = mix(vec3(0.10, 0.11, 0.14), vec3(0.01, 0.015, 0.03), u_dark);
    vec3 col = water + film * mix(0.5, 0.8, u_dark) + sheen * u_sheen * mix(0.4, 0.6, u_dark);
    col *= 0.6 + 0.6 * thick; // darker in the thin gaps

    col = aces(col * 1.1);
    col += (hash(gl_FragCoord.xy + u_time) - 0.5) / 255.0;
    gl_FragColor = vec4(col, 1.0);
}
