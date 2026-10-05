// name: Crowd
// group: People
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

// density transported by the flow → masses drift and roll like fog / a murmuration
float density(vec2 q, float t) {
    vec2 fp = q;
    for (int i = 0; i < 3; i++) { fp += curl(fp * 0.8 + vec2(t * 0.05, 0.0)) * 0.09; }
    return fbm(fp);
}

void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv = v_uv;
    float t = u_time;
    vec2 q = vec2(uv.x * aspect, uv.y) * vec2(2.6, 1.9);

    vec3 col = mix(vec3(0.012, 0.012, 0.018), vec3(0.0), u_dark);

    float dens = density(q, t);
    float e = 0.02;
    float dx = density(q + vec2(e, 0.0), t) - dens;
    float dy = density(q + vec2(0.0, e), t) - dens;
    float edge = length(vec2(dx, dy)) / e;

    float rim = smoothstep(0.3, 1.4, edge) * smoothstep(0.70, 0.46, dens);
    vec3 rimCol = mix(vec3(0.95, 0.96, 1.0), vec3(0.42, 0.52, 0.68), u_dark);
    col += rimCol * rim * 0.95;
    col += mix(vec3(0.05, 0.07, 0.12), vec3(0.02, 0.03, 0.06), u_dark) * smoothstep(0.4, 0.7, dens);
    col = mix(col, vec3(0.0), smoothstep(0.64, 0.84, dens) * 0.6);

    float g = hash(gl_FragCoord.xy + t);
    col *= 0.9 + 0.15 * g;
    col += (g - 0.5) * 0.045;
    gl_FragColor = vec4(min(col, vec3(1.2)), 1.0);
}
