// name: Spectral Arcs
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

    // faint nebular background
    vec3 col = mix(vec3(0.02, 0.02, 0.04), vec3(0.0, 0.0, 0.01), u_dark);
    col += vec3(0.10, 0.07, 0.12) * exp(-length(uv - 0.5) * 2.5) * 0.5;

    // four drifting rainbow arcs (chromatic lensing halos)
    for (int i = 0; i < 4; i++) {
        float fi = float(i);
        vec2 c = vec2(0.5 + 0.20 * sin(t * 0.15 + fi),
                      0.5 + 0.20 * cos(t * 0.13 + fi * 2.0));
        vec2 d = uv - c; d.x *= aspect;
        float r = length(d);
        float a = atan(d.y, d.x);
        float rr = 0.14 + 0.11 * fi + 0.02 * sin(t * 0.3 + fi);
        float br = (r - rr) / 0.03;
        float band = exp(-br * br);
        float seg = smoothstep(0.25, 1.0, 0.5 + 0.5 * sin(a + t * 0.2 + fi * 2.0)); // arc, not full ring
        vec3 spec = 0.5 + 0.5 * cos(6.2831 * ((r - rr) * 8.0 + fi * 0.2 + vec3(0.0, 0.33, 0.67)));
        col += spec * band * seg * 0.9;
    }

    // bright soft core where arcs converge
    col += vec3(1.0, 0.95, 0.9) * exp(-length((uv - 0.5) * vec2(aspect, 1.0)) * 7.0) * 0.5;

    float g = hash(gl_FragCoord.xy + t);
    col *= 0.9 + 0.15 * g;
    col += (g - 0.5) * 0.04;
    col *= mix(1.0, 0.82, u_dark);

    gl_FragColor = vec4(min(col, vec3(1.2)), 1.0);
}
