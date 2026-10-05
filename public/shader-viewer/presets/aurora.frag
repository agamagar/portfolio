// name: Aurora
// group: Sky
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
    vec2 p = vec2(uv.x * aspect, uv.y);

    // deep night gradient
    vec3 col = mix(mix(vec3(0.03, 0.08, 0.14), vec3(0.01, 0.03, 0.07), u_dark),
                   mix(vec3(0.00, 0.01, 0.03), vec3(0.00, 0.00, 0.01), u_dark), uv.y);

    // faint milky-way nebulosity high in the sky
    float mw = fbm(vec2(uv.x * aspect * 2.0 + 1.0, uv.y * 5.0)) * smoothstep(0.4, 0.95, uv.y);
    col += vec3(0.05, 0.06, 0.10) * mw * 0.6;

    // stars: varied brightness + twinkle, denser up high
    float sh = hash(floor(p * 340.0));
    col += vec3(smoothstep(0.9965, 1.0, sh) * (0.4 + 0.6 * sin(t * 3.0 + sh * 60.0)))
              * smoothstep(0.15, 1.0, uv.y);

    // five folding aurora curtains
    float aur = 0.0;
    vec3 aurC = vec3(0.0);
    for (int i = 0; i < 5; i++) {
        float fi = float(i);
        float seed = fi * 1.37;
        float baseX = 0.15 + 0.18 * fi;
        float fold = fbm(vec2(uv.y * 2.2 + t * (0.08 + 0.02 * fi) + seed * 4.0, seed)) - 0.5;
        fold += (fbm(vec2(uv.y * 5.0 - t * 0.05, seed * 2.0)) - 0.5) * 0.4;
        float x = uv.x + fold * 0.5;
        float w = 0.035 + 0.02 * hash(vec2(fi, 3.0));
        float bx = (x - baseX) / w;
        float band = exp(-bx * bx);
        float vfall = smoothstep(0.05, 0.45, uv.y) * smoothstep(1.05, 0.5, uv.y);
        float streak = 0.55 + 0.45 * noise(vec2(x * 60.0, uv.y * 7.0 - t * 0.4));
        float a = band * vfall * streak;
        vec3 c = mix(vec3(0.1, 1.0, 0.45), vec3(0.5, 0.2, 1.0), smoothstep(0.35, 0.85, uv.y));
        c = mix(c, vec3(0.2, 0.9, 0.8), 0.3 * (sin(fi + t * 0.3) * 0.5 + 0.5));
        aur += a;
        aurC += c * a;
    }
    aurC /= max(aur, 0.001);
    aurC = mix(aurC, aurC * vec3(0.5, 0.7, 0.65), u_dark);
    col += aurC * aur * mix(0.95, 0.6, u_dark);

    col = min(col, vec3(1.0));
    col += (hash(gl_FragCoord.xy) - 0.5) / 200.0;
    gl_FragColor = vec4(col, 1.0);
}
