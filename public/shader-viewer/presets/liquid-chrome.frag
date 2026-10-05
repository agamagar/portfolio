// name: Liquid Chrome
// group: Metal
// param float u_flow  "Flow"  0.0 0.5 0.15
// param float u_sheen "Sheen" 0.0 1.0 0.50
//
// Twice-warped fbm read as a molten metal surface: dark valleys, bright ridges,
// hot speculars, and a thin-film iridescent tint keyed to the warp. Continuous
// medium + light, no drawn geometry. Moody chrome in dark, liquid silver in light.
// highp, dithered, safe pow (smoothstep base).
precision highp float;

uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_dark;
uniform float u_flow;
uniform float u_sheen;
varying vec2 v_uv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 6; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
    return v;
}

void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = vec2(v_uv.x * aspect, v_uv.y) * 2.2;
    float t = u_time * u_flow;

    // domain-warp twice -> flowing molten surface
    vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, -t)));
    vec2 r = vec2(fbm(p + 2.5 * q + vec2(1.7, t * 0.8)), fbm(p + 2.5 * q + vec2(8.3, -t * 0.6)));
    float f = fbm(p + 3.0 * r);

    float m = smoothstep(0.20, 0.90, f);
    vec3 col = mix(vec3(0.06, 0.07, 0.10), vec3(0.85, 0.88, 0.95), m);      // steel ramp
    col = mix(col, vec3(1.0), pow(smoothstep(0.70, 0.95, f), 3.0));         // specular hits
    vec3 film = 0.5 + 0.5 * cos(6.2831 * (r.x + r.y + vec3(0.0, 0.33, 0.67)));
    col = mix(col, col * (0.7 + 0.6 * film), 0.35 * u_sheen * 2.0);         // thin-film tint

    col = mix(col * 1.15 + 0.05, col, u_dark); // light theme = brighter liquid silver

    col += (hash(gl_FragCoord.xy + t) - 0.5) * 0.015;
    gl_FragColor = vec4(col, 1.0);
}
