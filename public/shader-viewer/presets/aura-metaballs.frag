// name: Aura Metaballs
// group: Glow
precision highp float;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_dark;
varying vec2 v_uv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv = v_uv;
    float t = u_time;
    vec2 p = vec2(uv.x * aspect, uv.y);

    // drifting blobs whose glow fields merge and split (the "connections combining")
    float field = 0.0;
    vec2 grad = vec2(0.0);
    for (int i = 0; i < 5; i++) {
        float fi = float(i);
        vec2 c = vec2(0.5 * aspect, 0.5)
               + vec2(0.30 * aspect * sin(t * (0.17 + fi * 0.03) + fi * 1.7),
                      0.30 * cos(t * (0.13 + fi * 0.04) + fi * 2.3));
        vec2 d = p - c;
        float k = 36.0;
        float wgt = exp(-dot(d, d) * k);
        field += wgt;
        grad += -2.0 * k * wgt * d;
    }

    float core = smoothstep(0.85, 1.5, field);
    float iso = field - 0.55;
    float rim = exp(-iso * iso * 36.0);              // iridescent edge near the iso-surface

    // spectral colour from field + gradient direction
    float ga = atan(grad.y, grad.x);
    vec3 spec = 0.5 + 0.5 * cos(6.2831 * (field * 0.5 + ga * 0.15 + vec3(0.0, 0.33, 0.67)));

    vec3 col = vec3(0.0);
    col += spec * rim * 0.9;                          // iridescent merging rims
    col += mix(vec3(0.45, 0.6, 1.0), vec3(0.3, 0.4, 0.8), u_dark) * field * 0.22; // soft aura
    col += vec3(1.0) * core;                          // white core

    float g = hash(gl_FragCoord.xy + t);
    col *= 0.9 + 0.15 * g;
    col += (g - 0.5) * 0.04;
    col *= mix(1.0, 0.8, u_dark);

    gl_FragColor = vec4(min(col, vec3(1.2)), 1.0);
}
