// name: Peacock Mandala
// group: Pattern
// Look & feel inspired by Sarvam's branding: clean off-white, fine ink line-work,
// soft pastel blue<->pink gradient washes, airy negative space.
precision highp float;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_dark;
varying vec2 v_uv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
#define PI 3.14159265

void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv = (v_uv * 2.0 - 1.0); uv.x *= aspect;
    float t = u_time;

    // Sarvam palette
    vec3 paper = mix(vec3(0.910, 0.852, 0.972), vec3(0.07, 0.05, 0.12), u_dark); // lavender banner
    vec3 ink   = mix(vec3(0.34, 0.26, 0.48),    vec3(0.90, 0.90, 0.97), u_dark); // soft plum ink
    vec3 pblue = mix(vec3(0.840, 0.900, 0.965), vec3(0.10, 0.16, 0.30), u_dark);
    vec3 ppink = mix(vec3(0.975, 0.885, 0.930), vec3(0.30, 0.12, 0.22), u_dark);
    vec3 accent = vec3(0.976, 0.063, 0.369); // Zepto magenta #f9105e, used as a whisper

    // soft pastel gradient wash, kept lavender-dominant
    float wsh = smoothstep(-1.3, 1.3, uv.x * 0.7 + uv.y * 0.5 + 0.3 * sin(t * 0.08));
    vec3 bg = mix(paper, mix(pblue, ppink, wsh), 0.32);
    bg += (1.0 - u_dark) * vec3(0.02) * exp(-length(uv) * 1.4); // gentle centre light

    // ---- mandala geometry: two crossing spiral families ----
    vec2 c = uv - (u_mouse - 0.5) * 0.3;
    float r = length(c) + 1e-4;
    float ang = atan(c.y, c.x) + t * 0.04;     // calm rotation
    float rad = log(r);
    float n = 18.0, k = 5.0;
    float u1 = ang * n / (2.0 * PI) + rad * k - t * 0.06;
    float u2 = ang * n / (2.0 * PI) - rad * k + t * 0.06;
    vec2 f = fract(vec2(u1, u2)) - 0.5;
    float e = length(f);
    float bd = 0.5 - max(abs(f.x), abs(f.y));  // distance to the cell border

    vec3 col = bg;

    // delicate pastel petal tint (alternating blue / pink per cell)
    float cellH = hash(floor(vec2(u1, u2)) + 0.5);
    vec3 tint = mix(pblue, ppink, cellH);
    col = mix(col, tint, smoothstep(0.46, 0.28, e) * 0.32);

    // fine ink line-work along the petal net (low-contrast, premium)
    float line = smoothstep(0.035, 0.0, bd);
    col = mix(col, ink, line * 0.45);

    // small "eye" at each node: soft pastel halo + a whisper of brand magenta
    col = mix(col, mix(tint * 0.6, ink, 0.5), smoothstep(0.16, 0.10, e) * 0.28);
    float eyeDot = smoothstep(0.075, 0.045, e);
    col = mix(col, ink, eyeDot * 0.5);
    col = mix(col, accent, eyeDot * smoothstep(0.6, 1.0, cellH) * 0.18);

    // frame in clean negative space (centre hole + outer fade)
    float fade = clamp(smoothstep(0.14, 0.05, r) + smoothstep(0.82, 1.18, r), 0.0, 1.0);
    col = mix(col, bg, fade);

    // very subtle grain
    float g = hash(gl_FragCoord.xy + t);
    col += (g - 0.5) * 0.015;

    gl_FragColor = vec4(col, 1.0);
}
