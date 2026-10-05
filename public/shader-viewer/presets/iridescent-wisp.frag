// name: Iridescent Wisp
// group: Glow
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

void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv = v_uv;
    float t = u_time;
    vec2 q = (uv - vec2(0.5, 0.46)); q.x *= aspect;

    // domain-warp the form so it flutters and morphs like a flame/butterfly
    float n = fbm(q * 3.5 + vec2(0.0, -t * 0.35));
    vec2 warp = vec2(fbm(q * 2.0 + t * 0.1), fbm(q * 2.0 - t * 0.12 + 4.0)) - 0.5;
    vec2 qd = q + warp * 0.25;
    float d = length(qd * vec2(1.25, 0.95));

    float core = exp(-d * 9.0);
    float body = exp(-d * 3.2);
    float wisp = exp(-d * 1.8) * smoothstep(0.55, 1.0, n);   // feathery plumes

    // spectral dispersion as soap-film rings across the radius
    vec3 spec = 0.5 + 0.5 * cos(6.2831 * (d * 3.0 - t * 0.1 + vec3(0.0, 0.33, 0.67)));

    vec3 col = vec3(0.0);
    col += mix(vec3(0.25, 0.45, 1.0), vec3(0.15, 0.30, 0.8), u_dark) * body * 0.8; // blue glow
    col += spec * wisp * 0.8;                                                       // iridescent feathers
    col += vec3(1.0) * core * 1.3;                                                  // white-hot core

    float g = hash(gl_FragCoord.xy + t);
    col *= 0.9 + 0.15 * g;
    col += (g - 0.5) * 0.04;

    gl_FragColor = vec4(min(col, vec3(1.3)), 1.0);
}
