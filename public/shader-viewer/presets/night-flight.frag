// name: Night Flight
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

    // twilight wash
    vec3 col = mix(mix(vec3(0.34, 0.16, 0.30), vec3(0.05, 0.07, 0.22), uv.y),
                   mix(vec3(0.05, 0.03, 0.08), vec3(0.0, 0.0, 0.03), uv.y), u_dark);

    // turbulent nebula transported by the curl flow (billows like real high cloud)
    vec2 fp = p * 1.8;
    for (int i = 0; i < 3; i++) { fp += curl(fp * 0.7 - vec2(t * 0.04, 0.0)) * 0.10; }
    float neb = fbm(fp + t * 0.01);
    float fine = fbm(fp * 2.3 - t * 0.02);

    col += mix(vec3(0.5, 0.35, 0.5), vec3(0.18, 0.20, 0.42), u_dark) * smoothstep(0.40, 0.88, neb) * 0.6;
    col += mix(vec3(0.8, 0.8, 0.95), vec3(0.3, 0.35, 0.6), u_dark) * smoothstep(0.62, 0.95, fine) * 0.25;

    // iridescent thread woven through the densest billows
    vec3 spec = 0.5 + 0.5 * cos(6.2831 * (neb + vec3(0.0, 0.33, 0.67)));
    float band = smoothstep(0.6, 0.92, neb);
    col += spec * band * band * 0.16;

    float g = hash(gl_FragCoord.xy + t);
    col *= 0.92 + 0.12 * g;
    col += (g - 0.5) * 0.04;
    col *= mix(1.0, 0.8, u_dark);
    gl_FragColor = vec4(min(col, vec3(1.2)), 1.0);
}
