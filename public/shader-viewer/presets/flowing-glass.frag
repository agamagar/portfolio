// name: Flowing Glass
// group: Glass
precision highp float;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_dark;
uniform sampler2D u_image;
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
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
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

void main() {
    vec2 uv = v_uv;
    float t = u_time;

    // organic flowing displacement: the whole frame melts and drifts like thick glass
    vec2 fl = vec2(fbm(uv * 3.0 + vec2(t * 0.10, 0.0)),
                   fbm(uv * 3.0 + vec2(0.0, -t * 0.12) + 7.0));
    fl += 0.5 * vec2(fbm(uv * 6.0 - t * 0.08), fbm(uv * 6.0 + t * 0.06 + 3.0));
    vec2 off = (fl - 0.75) * 0.14;
    vec2 ruv = uv + off;
    vec2 dir = normalize(off + vec2(1e-5));
    float disp = 0.012;
    vec3 col = vec3(srcColor(ruv + dir * disp).r, srcColor(ruv).g, srcColor(ruv - dir * disp).b);

    // glass sheen: specular from the flow's surface normal
    float h  = fbm(uv * 3.0 + vec2(t * 0.10, 0.0));
    float hx = fbm(uv * 3.0 + vec2(0.01, 0.0) + vec2(t * 0.10, 0.0));
    float hy = fbm(uv * 3.0 + vec2(0.0, 0.01) + vec2(t * 0.10, 0.0));
    vec3 n = normalize(vec3(-(hx - h) / 0.01, -(hy - h) / 0.01, 6.0));
    float spec = pow(max(0.0, dot(n, normalize(vec3(0.4, 0.6, 0.7)))), 16.0);
    col += mix(vec3(1.0), vec3(0.6, 0.8, 1.0), u_dark) * spec * 0.5;

    col *= mix(1.0, 0.7, u_dark);
    col += (hash(gl_FragCoord.xy) - 0.5) / 220.0;
    gl_FragColor = vec4(col, 1.0);
}
