// Section-background wash shaders for the Away case study. Vendored verbatim
// from the personal shader-viewer presets (golden-hour.frag, iridescent-wisp.frag).
// Both share the site's uniform convention (u_time, u_mouse, u_resolution, v_uv)
// plus u_dark (0 = light theme, 1 = dark) which ShaderCanvas drives from the
// <html>.dark class.

export const GOLDEN_HOUR = `// name: Golden Hour
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
    for (int i = 0; i < 6; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
    return v;
}

void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv = v_uv;
    float t = u_time;
    vec2 p = vec2(uv.x * aspect, uv.y);

    vec2 sun = vec2(0.5 * aspect, 0.15);
    float sd = length(p - sun);

    // atmospheric sky: warm scatter banked toward the horizon and the sun
    float horizonGrad = pow(clamp(1.0 - uv.y, 0.0, 1.0), 1.5);
    vec3 zenith = mix(vec3(0.16, 0.34, 0.66), vec3(0.02, 0.03, 0.09), u_dark);
    vec3 midSky = mix(vec3(0.62, 0.52, 0.70), vec3(0.10, 0.07, 0.14), u_dark);
    vec3 horiz  = mix(vec3(1.00, 0.55, 0.28), vec3(0.30, 0.10, 0.08), u_dark);
    vec3 sky = mix(zenith, midSky, smoothstep(0.95, 0.25, uv.y));
    sky = mix(sky, horiz, horizonGrad * horizonGrad);
    vec3 sunTint = mix(vec3(1.0, 0.7, 0.35), vec3(0.7, 0.25, 0.12), u_dark);
    sky += sunTint * exp(-sd * 2.0) * mix(0.55, 0.3, u_dark); // Mie-ish halo

    // sun disk + bloom
    sky = mix(sky, vec3(1.0, 0.93, 0.78), smoothstep(0.085, 0.07, sd) * (1.0 - u_dark * 0.45));
    sky += vec3(1.0, 0.8, 0.5) * exp(-sd * 9.0) * mix(0.6, 0.3, u_dark);

    // crepuscular god rays radiating from the sun
    float ang = atan(p.y - sun.y, p.x - sun.x);
    float rays = (fbm(vec2(ang * 6.0, t * 0.05)) * 0.5 + 0.5) * smoothstep(1.2, 0.1, sd);
    sky += sunTint * rays * 0.12 * (1.0 - u_dark * 0.5);

    // two domain-warped, back-lit cloud layers (near + far)
    vec3 col = sky;
    for (int L = 0; L < 2; L++) {
        float fl = float(L);
        vec2 cp = p * (2.0 + fl * 2.2) + vec2(t * (0.015 + fl * 0.02), 0.0) + fl * 7.0;
        vec2 q = vec2(fbm(cp), fbm(cp + vec2(3.1, 1.7)));
        float cl = fbm(cp + q * 0.7);
        float cov = mix(0.52, 0.60, u_dark) + fl * 0.04;
        float c = smoothstep(cov, cov + 0.28, cl);
        float lit = clamp((cl - fbm(cp + normalize(sun - p) * 0.12)) * 4.0 + 0.45, 0.0, 1.0);
        vec3 cloudHi = mix(vec3(1.0, 0.85, 0.62), vec3(0.5, 0.28, 0.22), u_dark);
        vec3 cloudLo = mix(vec3(0.55, 0.32, 0.42), vec3(0.06, 0.05, 0.09), u_dark);
        vec3 cc = mix(mix(cloudLo, cloudHi, lit), sky, fl * 0.25); // far layer hazier
        col = mix(col, cc, c * (1.0 - fl * 0.15));
    }

    vec2 vg = uv * 2.0 - 1.0;
    col *= 1.0 - 0.16 * dot(vg, vg);
    col += (hash(gl_FragCoord.xy) - 0.5) / 200.0; // dither out banding
    gl_FragColor = vec4(col, 1.0);
}
`;

export const IRIDESCENT_WISP = `// name: Iridescent Wisp
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
`;

// Day/night cloud sky — the Away hero shader, shared here so the case-study
// phone mocks can run the same live sky as a "morning" time-of-day backdrop.
export const CLOUDS = `precision highp float;
#define GLSLIFY 1
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_dark; // 0 = day sky, 1 = moonlit night sky
varying vec2 v_uv;

// --- smooth value noise ---
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i + vec2(0.0, 0.0));
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// fbm with a rotation per octave — breaks the grid-aligned "smoke" look
float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.55;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 7; i++) {
        value += amplitude * noise(p);
        p = m * p;
        amplitude *= 0.5;
    }
    return value;
}

// cloud density field — gentle billowing warp instead of heavy smearing
float cloudDensity(vec2 p, float t) {
    p += vec2(t * 0.025, 0.0);              // slow horizontal drift
    float warp = fbm(p * 1.2);              // mild domain warp = rounded billows
    return fbm(p * 1.8 + warp * 0.5);
}

void main() {
    vec2 uv = v_uv;
    uv.x *= u_resolution.x / u_resolution.y;

    float t = u_time;
    vec2 mouse = (u_mouse - 0.5) * 0.6;

    // cloud-space coordinates; mouse pans the sky
    vec2 p = uv * 3.0 + mouse;

    float density = cloudDensity(p, t);

    // coverage threshold -> distinct clouds with clear blue gaps
    float coverage = 0.52;
    float c = smoothstep(coverage, coverage + 0.30, density);
    c = pow(c, 1.3); // firm up the edges so puffs read as solid

    // --- fake volumetric lighting: sample density toward the sun ---
    vec2 sunDir = normalize(vec2(0.45, 0.55));
    float dHere = density;
    float dSun  = cloudDensity(p + sunDir * 0.10, t);
    float light = clamp((dHere - dSun) * 3.5 + 0.55, 0.0, 1.0);

    // sky gradient: day = deep blue zenith over a pale horizon; night = deep
    // indigo zenith over a dusky horizon
    vec3 skyTop    = mix(vec3(0.20, 0.46, 0.82), vec3(0.03, 0.05, 0.13), u_dark);
    vec3 skyHoriz  = mix(vec3(0.66, 0.80, 0.93), vec3(0.10, 0.13, 0.24), u_dark);
    vec3 sky = mix(skyHoriz, skyTop, clamp(v_uv.y, 0.0, 1.0));

    // cloud shading: day = grey-blue shadow -> bright white tops; night = dark
    // shadow -> soft moonlit grey tops
    vec3 cloudShadow = mix(vec3(0.55, 0.60, 0.70), vec3(0.05, 0.07, 0.13), u_dark);
    vec3 cloudLit    = mix(vec3(1.00, 0.99, 0.97), vec3(0.42, 0.46, 0.58), u_dark);
    vec3 cloudCol = mix(cloudShadow, cloudLit, light);

    vec3 color = mix(sky, cloudCol, c);

    // bright rim where thin cloud edges catch the light (silver lining)
    float rim = smoothstep(coverage - 0.05, coverage + 0.10, density)
              * (1.0 - c) * light;
    color += mix(vec3(1.0, 0.97, 0.9), vec3(0.55, 0.62, 0.85), u_dark) * rim * mix(0.6, 0.4, u_dark);

    // broad atmospheric glow behind the clouds: warm sun by day, cool moon by night
    vec2 sunPos = vec2(0.7, 0.8);
    sunPos.x *= u_resolution.x / u_resolution.y;
    float glow = 1.0 - smoothstep(0.0, 1.2, length(uv - sunPos));
    color += mix(vec3(1.0, 0.85, 0.6), vec3(0.5, 0.6, 0.85), u_dark) * glow * mix(0.15, 0.1, u_dark) * (1.0 - c);

    gl_FragColor = vec4(color, 1.0);
}
`;

export const WASHES = { clouds: CLOUDS, golden: GOLDEN_HOUR, iridescent: IRIDESCENT_WISP };
