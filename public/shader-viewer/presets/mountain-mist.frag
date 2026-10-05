// name: Mountain Mist
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

const int N = 7;

void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv = v_uv;
    float t = u_time;
    float mx = (u_mouse.x - 0.5);

    // sky with a soft hazy sun
    vec3 skyTop = mix(vec3(0.52, 0.64, 0.84), vec3(0.02, 0.04, 0.10), u_dark);
    vec3 skyHor = mix(vec3(0.98, 0.82, 0.74), vec3(0.10, 0.09, 0.16), u_dark);
    vec3 col = mix(skyHor, skyTop, pow(clamp(uv.y, 0.0, 1.0), 0.7));
    vec2 sun = vec2(0.62 * aspect, 0.80);
    float sd = length(vec2(uv.x * aspect, uv.y) - sun);
    col += mix(vec3(1.0, 0.85, 0.6), vec3(0.3, 0.2, 0.3), u_dark) * exp(-sd * 3.0) * mix(0.4, 0.2, u_dark);

    // layered ridges with texture + atmospheric perspective + slope shading
    for (int i = 0; i < N; i++) {
        float fi = float(i);
        float depth = fi / float(N - 1);
        float base = 0.66 - depth * 0.5;
        float amp = 0.04 + depth * 0.12;
        float scroll = t * 0.008 * (0.2 + depth) + mx * depth * 0.6;
        float x = (uv.x * aspect) * (1.2 + depth * 2.2) + scroll * 3.0 + fi * 12.0;
        float r = fbm(vec2(x, fi * 3.0)) * 0.7 + fbm(vec2(x * 2.3, fi * 3.0)) * 0.3;
        float h = base + (r - 0.5) * amp * 2.0;
        float m = smoothstep(h + 0.003, h - 0.003, uv.y);
        vec3 ridgeNear = mix(vec3(0.18, 0.26, 0.40), vec3(0.00, 0.01, 0.03), u_dark);
        vec3 ridgeFar  = mix(vec3(0.66, 0.74, 0.88), vec3(0.10, 0.13, 0.22), u_dark);
        vec3 rc = mix(ridgeFar, ridgeNear, depth);
        float r2 = fbm(vec2(x + 0.05, fi * 3.0)) * 0.7 + fbm(vec2((x + 0.05) * 2.3, fi * 3.0)) * 0.3;
        rc *= 1.0 + (r2 - r) * 1.5 * (1.0 - depth * 0.5); // slope shading
        col = mix(col, rc, m);
    }

    // volumetric drifting mist pooling between ridges
    float mist = fbm(vec2(uv.x * aspect * 1.5 - t * 0.03, uv.y * 3.0 + t * 0.01));
    float mistBand = smoothstep(0.10, 0.45, uv.y) * smoothstep(0.70, 0.40, uv.y) * smoothstep(0.45, 0.65, mist);
    col = mix(col, mix(vec3(0.90, 0.92, 0.96), vec3(0.20, 0.22, 0.30), u_dark), mistBand * 0.4);

    vec2 vg = uv * 2.0 - 1.0;
    col *= 1.0 - 0.14 * dot(vg, vg);
    col += (hash(gl_FragCoord.xy) - 0.5) / 200.0;
    gl_FragColor = vec4(col, 1.0);
}
