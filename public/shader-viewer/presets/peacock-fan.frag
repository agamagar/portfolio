// name: Peacock Fan
// group: Pattern
// A peacock tail that unfurls in a ~195° arc, opening ring-by-ring on a looping
// timeline eased with Material 3 motion curves (expressive overshoot opening,
// standard closing), with organic sway + shimmer. Single peacock palette.
precision highp float;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
varying vec2 v_uv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}

// cubic-bezier easing y(x) with implicit (0,0),(1,1) — Newton solve for t, then y(t)
float bez(float x, float x1, float y1, float x2, float y2) {
    x = clamp(x, 0.0, 1.0);
    float t = x;
    for (int i = 0; i < 5; i++) {
        float ct = 1.0 - t;
        float xt = 3.0 * ct * ct * t * x1 + 3.0 * ct * t * t * x2 + t * t * t;
        float dx = 3.0 * ct * ct * x1 + 6.0 * ct * t * (x2 - x1) + 3.0 * t * t * (1.0 - x2);
        t -= (xt - x) / max(dx, 1e-4);
        t = clamp(t, 0.0, 1.0);
    }
    float ct = 1.0 - t;
    return 3.0 * ct * ct * t * y1 + 3.0 * ct * t * t * y2 + t * t * t;
}

#define PI 3.14159265

void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv = (v_uv * 2.0 - 1.0); uv.x *= aspect;
    float t = u_time;

    // ---- looping open/close timeline (11s) eased with M3 motion tokens ----
    float L = 11.0;
    float ph = mod(t, L) / L;
    float openAmt;
    if (ph < 0.40)      openAmt = bez(ph / 0.40, 0.38, 1.21, 0.22, 1.0);            // expressive open (overshoot)
    else if (ph < 0.72) openAmt = 1.0 + 0.012 * sin(t * 1.4);                        // hold + breathe
    else if (ph < 0.95) openAmt = 1.0 - bez((ph - 0.72) / 0.23, 0.27, 1.06, 0.18, 1.0); // standard close
    else                openAmt = 0.0;                                              // closed pause
    float openG = clamp(openAmt, 0.0, 1.06);

    // fan origin sits below the frame; whole fan sways gently (alive)
    vec2 c = uv - vec2(0.0, -0.72);
    float sway = sin(t * 0.3) * 0.04 * openG;
    float r = length(c);
    float a = atan(c.x, c.y) + sway;          // 0 = straight up

    float spread = mix(0.05, 1.70, openG);    // half-angle → ~195° fully open (grows from a bud)
    float maxR   = mix(0.05, 1.25, openG);

    float an = a / spread;                     // -1..1 across the fan
    float rn = r / maxR;                       // 0..1 along a feather

    // organic, wavy fan boundary (no straight edges)
    float fanA = abs(an) + (noise(vec2(rn * 4.0, an * 3.0 + t * 0.1)) - 0.5) * 0.14;
    float fanR = rn + (noise(vec2(an * 4.0, rn * 3.0 - t * 0.1)) - 0.5) * 0.12;
    float inFan = (1.0 - smoothstep(0.93, 1.05, fanA)) * (1.0 - smoothstep(0.95, 1.05, fanR));

    // ---- gap-free petal tessellation (Voronoi over a half-offset polar lattice) ----
    float Nf = 13.0, Nr = 5.0;
    vec2 P = vec2(an * Nf, pow(max(rn, 0.0), 0.9) * Nr);
    // domain warp so every cell boundary curves — purely organic, no straight lines
    P += (vec2(noise(P * 0.5 + t * 0.05), noise(P * 0.5 + 9.0 - t * 0.04)) - 0.5) * 0.7;

    float best = 1e9, second = 1e9;
    vec2 bSite = vec2(0.0);
    for (int dj = -1; dj <= 1; dj++) {
        float j = floor(P.y) + float(dj);
        float off = 0.5 * mod(j, 2.0);
        for (int di = -1; di <= 1; di++) {
            float i = floor(P.x - off) + float(di);
            vec2 s = vec2(i + off, j);
            s.x += 0.12 * sin(t * 0.8 + hash(vec2(i, j)) * 6.2831); // gentle organic wobble
            float d = length((P - s) * vec2(1.0, 1.25));
            if (d < best) { second = best; best = d; bSite = vec2(i, j); }
            else if (d < second) { second = d; }
        }
    }

    // growth front: cells fill from the base (centre) outward to the tips
    float siteRn = clamp(bSite.y / Nr, 0.0, 1.0);
    float appear = smoothstep(siteRn, siteRn + 0.18, openG);
    float petalA = inFan * appear;

    float er = clamp(best / 0.60, 0.0, 1.0);     // 0 = ocellus centre, 1 = cell edge
    float seed = hash(bSite + 3.0);

    // deep teal ground
    vec3 col = mix(vec3(0.03, 0.10, 0.11), vec3(0.008, 0.04, 0.05), smoothstep(0.0, 1.3, r));

    // peacock ocellus filling the whole Voronoi cell → neighbours touch, no gaps
    vec3 eye = mix(vec3(0.10, 0.45, 0.95), vec3(0.90, 0.62, 0.16), smoothstep(0.12, 0.62, er));
    eye += vec3(0.45, 0.78, 1.0) * smoothstep(0.20, 0.0, er) * 0.6;
    eye = mix(eye, vec3(0.13, 0.55, 0.42), smoothstep(0.62, 0.98, er) * 0.5);
    eye *= 0.9 + 0.1 * sin(t * 2.0 + seed * 6.2831);
    col = mix(col, eye, petalA);

    // thin connecting seam between petals (organic join, never a gap)
    float seam = smoothstep(0.05, 0.0, second - best);
    col = mix(col, vec3(0.06, 0.03, 0.02), seam * petalA * 0.6);

    // glowing body at the base of the fan
    float body = smoothstep(0.13, 0.0, r);
    col = mix(col, vec3(1.0, 0.82, 0.35), body);
    col += vec3(1.0, 0.75, 0.30) * exp(-r * 5.0) * 0.30 * openG;

    // vignette + fine grain
    col *= 1.0 - 0.28 * smoothstep(0.5, 1.5, length(uv));
    float g = hash(gl_FragCoord.xy + t);
    col *= 0.95 + 0.07 * g;
    col += (g - 0.5) * 0.025;

    gl_FragColor = vec4(col, 1.0);
}
