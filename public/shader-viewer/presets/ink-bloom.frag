// name: Ink Bloom
// group: Volumetric
// param float u_spread "Spread" 0.3 1.6 0.90
// param float u_detail "Detail" 0.0 1.0 0.60
// param float u_flow   "Flow"   0.0 1.0 0.40
//
// Ink diffusing in water: a domain-warped fbm plume blooming from the centre, torn
// into tendrils, with a soft key light falling through the dye. medium+light
// (continuous medium, no drawn shapes); ACES + vignette + dither, highp. Indigo ink
// on pale water by day, luminous dye on dark water by night.
precision highp float;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_dark;
uniform float u_spread;
uniform float u_detail;
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
    vec2 uv = v_uv; vec2 p = (uv - 0.5); p.x *= aspect;
    float t = u_time * 0.1 * u_flow + 4.0;

    // domain warp -> writhing ink tendrils
    vec2 w = vec2(fbm(p * 3.0 + vec2(0.0, t)), fbm(p * 3.0 + vec2(5.2, -t))) - 0.5;
    vec2 q = p + w * (0.6 * u_detail + 0.2);
    float r = length(q) / u_spread;

    // ink concentration: dense core blooming outward, torn by fbm
    float ink = smoothstep(1.0, 0.1, r) * (0.5 + fbm(q * 4.0 + w));
    ink = clamp(ink, 0.0, 1.0); ink = ink * ink * (3.0 - 2.0 * ink);

    vec3 water = mix(vec3(0.93, 0.95, 0.98), vec3(0.02, 0.03, 0.06), u_dark);
    vec3 inkCol = mix(vec3(0.12, 0.10, 0.32), vec3(0.35, 0.55, 1.00), u_dark);   // indigo / luminous
    inkCol += mix(vec3(0.20, 0.05, 0.25), vec3(0.60, 0.15, 0.50), u_dark) * smoothstep(0.5, 1.0, ink);

    vec3 col = mix(water, inkCol, ink);
    // soft key light gradient across the plume
    float key = 0.5 + 0.5 * dot(normalize(vec2(-0.5, 0.7)), q / max(length(q), 0.001));
    col *= mix(0.9, 1.15, key);

    col = aces(col * 1.05);
    vec2 vg = uv * 2.0 - 1.0; col *= 1.0 - 0.16 * dot(vg, vg);
    col += (hash(gl_FragCoord.xy + u_time) - 0.5) / 255.0;
    gl_FragColor = vec4(col, 1.0);
}
