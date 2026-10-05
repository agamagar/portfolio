// name: Halo Silhouette
// group: Glow
precision highp float;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_dark;
uniform sampler2D u_image;   // figure is read from the base image's brightness
uniform float u_hasImage;
uniform vec2 u_imageRes;
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
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 1.9; a *= 0.5; }
    return v;
}
vec2 coverUV(vec2 uv) {
    float ca = u_resolution.x / u_resolution.y, ia = u_imageRes.x / u_imageRes.y;
    vec2 s = uv;
    if (ca > ia) s.y = (uv.y - 0.5) * (ia / ca) + 0.5;
    else         s.x = (uv.x - 0.5) * (ca / ia) + 0.5;
    return s;
}
vec3 srcColor(vec2 uv) {
    if (u_hasImage < 0.5) return vec3(0.0);
    vec2 s = coverUV(uv);
    if (s.x < 0.0 || s.x > 1.0 || s.y < 0.0 || s.y > 1.0) return vec3(0.0);
    return texture2D(u_image, s).rgb;
}
float mask(vec2 uv) {
    vec3 c = srcColor(uv);
    return smoothstep(0.40, 0.62, dot(c, vec3(0.299, 0.587, 0.114)));
}

void main() {
    vec2 uv = v_uv;
    float t = u_time;

    // gentle flowing wobble of the sampling — dreamy, unstable
    vec2 w = vec2(fbm(uv * 3.0 + t * 0.10), fbm(uv * 3.0 - t * 0.10 + 5.0)) - 0.5;
    vec2 suv = uv + w * 0.02;

    float m = mask(suv);

    // soft halo: ring of taps around each pixel (the glow that traces the figure)
    float blur = 0.0;
    const int K = 16;
    for (int i = 0; i < K; i++) {
        float a = 6.2831 * float(i) / float(K);
        vec2 dir = vec2(cos(a), sin(a));
        blur += mask(suv + dir * 0.018) * 0.6 + mask(suv + dir * 0.04) * 0.4;
    }
    blur /= float(K);
    float halo = clamp(blur - m, 0.0, 1.0);

    // base: a faint, darkened version of the scene behind
    vec3 col = srcColor(suv) * 0.12 + vec3(0.02, 0.025, 0.02);
    // dark silhouette body
    col = mix(col, vec3(0.03, 0.04, 0.035), m * 0.85);

    // glowing halo with a faint spectral fringe
    vec3 spectral = 0.5 + 0.5 * cos(6.2831 * (halo + vec3(0.0, 0.33, 0.67)));
    col += vec3(1.0, 0.98, 0.92) * halo * 1.5;
    col += spectral * halo * halo * 0.25;
    // bloom the bright inner figure (the "lit" person)
    col += vec3(0.9, 0.95, 1.0) * smoothstep(0.55, 1.0, blur) * 0.4;

    // warm sepia (full) <-> cool blue (dark)
    col *= mix(vec3(1.06, 1.02, 0.85), vec3(0.80, 0.90, 1.12), u_dark);

    // film grain
    float g = hash(gl_FragCoord.xy + t);
    col *= 0.88 + 0.18 * g;
    col += (g - 0.5) * 0.05;

    gl_FragColor = vec4(col, 1.0);
}
