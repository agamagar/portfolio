// name: Petal Bloom
// group: Pattern
// Lotus Bloom rebuilt with ONE unit shape — the supplied petal/leaf silhouette
// (rounded shoulders, concave taper to a point) — radiating and unfurling from a
// glowing core, veiled under a drifting gradient. New-standard grade: ACES + dither.
precision highp float;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_dark;
varying vec2 v_uv;

#define PI 3.14159265

float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise2(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash2(i), hash2(i + vec2(1, 0)), u.x),
               mix(hash2(i + vec2(0, 1)), hash2(i + vec2(1, 1)), u.x), u.y);
}
float fbm2(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++) { v += a * noise2(p); p = m * p; a *= 0.5; }
    return v;
}
float bez(float x, float x1, float y1, float x2, float y2) {
    x = clamp(x, 0.0, 1.0);
    float t = x;
    for (int i = 0; i < 5; i++) {
        float ct = 1.0 - t;
        float xt = 3.0 * ct * ct * t * x1 + 3.0 * ct * t * t * x2 + t * t * t;
        float dx = 3.0 * ct * ct * x1 + 6.0 * ct * t * (x2 - x1) + 3.0 * t * t * (1.0 - x2);
        t -= (xt - x) / max(dx, 1e-4); t = clamp(t, 0.0, 1.0);
    }
    float ct = 1.0 - t;
    return 3.0 * ct * ct * t * y1 + 3.0 * ct * t * t * y2 + t * t * t;
}
vec3 aces(vec3 x) {
    return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

// exact silhouette of the supplied SVG petal, fitted from its beziers:
// half-width peaks at the vertical middle; top half ~(2y)^0.7 (rounded shoulders),
// bottom half ~(2(1-y))^1.3 (sharp concave tip). width:height = 0.686.
// d.y: +1 = outward sharp tip, -1 = rounded base.
float petal(vec2 d, out float er) {
    float yn = clamp((d.y + 1.0) * 0.5, 0.0, 1.0);        // 0 = rounded base, 1 = sharp tip
    float prof = (yn <= 0.5) ? pow(2.0 * yn, 0.7) : pow(2.0 * (1.0 - yn), 1.3);
    float halfW = prof * 0.686;                           // SVG width:height ratio
    er = clamp(length(vec2(d.x / max(halfW, 1e-3), d.y)), 0.0, 1.0);
    return smoothstep(0.0, 0.035, halfW - abs(d.x)) * smoothstep(1.02, 0.98, abs(d.y));
}

void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv = (v_uv * 2.0 - 1.0); uv.x *= aspect;
    float t = u_time;

    // unfurl timeline (M3-eased, 11s loop)
    float ph = mod(t, 11.0) / 11.0;
    float openG;
    if (ph < 0.42)      openG = bez(ph / 0.42, 0.38, 1.21, 0.22, 1.0);
    else if (ph < 0.74) openG = 1.0 + 0.01 * sin(t * 1.2);
    else if (ph < 0.96) openG = 1.0 - bez((ph - 0.74) / 0.22, 0.27, 1.06, 0.18, 1.0);
    else                openG = 0.0;
    float og = clamp(openG, 0.0, 1.05);

    vec2 c = uv - vec2(0.0, -0.02);
    float r = length(c);
    float a = atan(c.x, c.y);

    float Nring = 8.0, Nang = 22.0;
    float maxR = mix(0.06, 1.7, og);
    float rc = (r / maxR) * Nring;
    float ac = (a / (2.0 * PI)) * Nang;

    vec3 col = mix(vec3(0.03, 0.10, 0.12), vec3(0.01, 0.04, 0.05), smoothstep(0.0, 1.4, r));
    col = mix(col, col * 0.4, u_dark);

    // place one petal per lattice cell; outer rings overlap inner ones
    float found = -1.0;
    vec2 bestId = vec2(0.0);
    float bestEr = 1.0, bestCov = 0.0, bestAppear = 0.0;
    for (int dy = 1; dy >= -1; dy--) {
        if (found > 0.0) continue;
        float ry = floor(rc) + float(dy);
        if (ry < 0.0) continue;
        float off = 0.5 * mod(ry, 2.0);
        float ax = floor(ac - off + 0.5);
        vec2 center = vec2(ax + off, ry);
        vec2 dd = vec2(ac - center.x, rc - center.y);
        float er;
        float cov = petal(vec2(dd.x, dd.y) / 0.73, er);  // 0.73 keeps SVG aspect; petals just touch
        float appear = smoothstep(ry / Nring, ry / Nring + 0.22, og);
        if (cov > 0.25 && appear > 0.3) { found = 1.0; bestId = center; bestEr = er; bestCov = cov; bestAppear = appear; }
    }

    if (found > 0.0) {
        float seed = hash2(bestId + 1.7);
        float ringFrac = bestId.y / Nring;
        vec3 sc = mix(vec3(0.10, 0.45, 0.52), vec3(0.30, 0.56, 0.27),
                      0.5 + 0.5 * sin(bestId.x * 1.3 + bestId.y));
        sc = mix(vec3(0.95, 0.78, 0.30), sc, smoothstep(0.04, 0.30, ringFrac)); // gold near core
        float shade = smoothstep(1.0, 0.0, bestEr);
        sc *= 0.66 + 0.55 * shade;                          // bright centre, dark rim
        sc *= 0.92 + 0.08 * sin(t * 1.6 + seed * 6.2831);   // shimmer
        col = mix(col, sc, bestCov * bestAppear);
    }

    // glowing core + droplet glints rising above
    col = mix(col, vec3(1.0, 0.85, 0.28), smoothstep(0.10, 0.0, r));
    col += vec3(1.0, 0.82, 0.32) * exp(-r * 4.5) * (0.45 + 0.15 * sin(t * 1.5)) * og;
    for (int i = -1; i <= 1; i++) {
        float fi = float(i);
        vec2 dp = c - vec2(fi * 0.16, 0.46 + 0.05 * sin(t * 1.0 + fi));
        col += vec3(0.55, 0.85, 0.7) * exp(-dot(dp, dp) * 120.0) * 0.6 * og;
    }

    // dreamy gradient veil so the shape never fully resolves
    float vn = fbm2(uv * 1.4 + vec2(t * 0.05, -t * 0.03));
    vec3 veilCol = mix(vec3(0.10, 0.50, 0.55), vec3(0.65, 0.88, 0.72), vn);
    col = mix(col, veilCol, (0.22 + 0.30 * fbm2(uv * 0.8 - t * 0.04)) * 0.55);
    col += vec3(0.5, 0.8, 0.7) * exp(-r * 1.6) * 0.12 * og;

    // new-standard grade
    col = aces(col * 1.12);
    col *= 1.0 - 0.26 * dot(uv, uv) * 0.4;
    col += (hash2(gl_FragCoord.xy + t) - 0.5) / 255.0;

    gl_FragColor = vec4(col, 1.0);
}
