// name: Flight Paths
// group: Flight
precision highp float;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_dark;
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
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
    return v;
}
// divergence-free flow (curl of a scalar potential) → real fluid motion
vec2 curl(vec2 p) {
    float e = 0.015;
    float a = fbm(p + vec2(0.0, e)), b = fbm(p - vec2(0.0, e));
    float c = fbm(p + vec2(e, 0.0)), d = fbm(p - vec2(e, 0.0));
    return vec2(a - b, d - c) / (2.0 * e);
}

void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv = v_uv;
    float t = u_time;
    vec2 p = vec2(uv.x * aspect, uv.y);

    // advect the sampling point along the curl field → filaments stretch & fold
    vec2 fp = p * 1.6;
    for (int i = 0; i < 3; i++) { fp += curl(fp * 0.9 + vec2(0.0, t * 0.05)) * 0.085; }

    float dye = fbm(fp * 1.1 + t * 0.015);
    float veins = 1.0 - abs(dye * 2.0 - 1.0);                 // ridged → bright threads
    veins = pow(clamp(smoothstep(0.45, 1.0, veins), 0.0, 1.0), 1.6);
    float glow = smoothstep(0.40, 0.85, dye);

    vec3 base = mix(mix(vec3(0.02, 0.04, 0.10), vec3(0.02, 0.09, 0.15), uv.y),
                    mix(vec3(0.0, 0.01, 0.03), vec3(0.0, 0.02, 0.05), uv.y), u_dark);
    vec3 spec = 0.5 + 0.5 * cos(6.2831 * (dye * 1.3 + length(fp - p * 1.6) * 0.6 + vec3(0.0, 0.33, 0.67)));

    vec3 col = base;
    col += mix(vec3(0.45, 0.75, 1.0), spec, 0.5) * veins * 0.9;
    col += vec3(0.25, 0.45, 0.85) * glow * 0.18;

    float g = hash(gl_FragCoord.xy + t);
    col *= 0.92 + 0.12 * g;
    col += (g - 0.5) * 0.04;
    col *= mix(1.0, 0.82, u_dark);
    gl_FragColor = vec4(min(col, vec3(1.2)), 1.0);
}
