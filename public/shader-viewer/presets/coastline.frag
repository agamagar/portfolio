// name: Coastline
// group: Landscape
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
    vec2 p = vec2(uv.x * aspect, uv.y) * 1.7;

    // water surface transported by the curl flow (turbulent, no readable direction)
    vec2 fp = p;
    for (int i = 0; i < 3; i++) { fp += curl(fp * 0.9 + vec2(t * 0.05, t * 0.02)) * 0.08; }
    float v = fbm(fp);

    // caustic web: higher-frequency ridged detail advected by the same flow
    float cw = fbm(fp * 2.6 + t * 0.03);
    float caust = pow(clamp(1.0 - abs(cw * 2.0 - 1.0), 0.0, 1.0), 3.0);

    vec3 deep = mix(vec3(0.01, 0.10, 0.22), vec3(0.0, 0.03, 0.08), u_dark);
    vec3 midC = mix(vec3(0.03, 0.45, 0.55), vec3(0.01, 0.12, 0.18), u_dark);
    vec3 aqua = mix(vec3(0.50, 0.85, 0.85), vec3(0.08, 0.25, 0.30), u_dark);
    vec3 col = mix(deep, midC, smoothstep(0.30, 0.60, v));
    col = mix(col, aqua, smoothstep(0.60, 0.85, v));

    col += vec3(0.7, 0.95, 1.0) * caust * smoothstep(0.35, 0.7, v) * 0.35 * (1.0 - 0.4 * u_dark);
    float crest = smoothstep(0.80, 0.93, v);
    vec3 spec = 0.5 + 0.5 * cos(6.2831 * (v * 1.5 + vec3(0.0, 0.33, 0.67)));
    col += spec * crest * crest * 0.20;

    vec2 vg = uv * 2.0 - 1.0;
    col *= 1.0 - 0.14 * dot(vg, vg);
    float g = hash(gl_FragCoord.xy + t);
    col *= 0.93 + 0.1 * g;
    col += (g - 0.5) * 0.04;
    gl_FragColor = vec4(col, 1.0);
}
