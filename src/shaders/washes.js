// The site's shader library: living section-background washes rendered by
// ShaderCanvas / HeroShader. Every preset shares the site's uniform convention
// (u_time, u_mouse, u_resolution, v_uv) plus u_dark (0 = light theme, 1 = dark)
// which ShaderCanvas drives from the <html>.dark class, so each shader reads in
// both themes. First two were vendored from the personal shader-viewer
// (golden-hour.frag, iridescent-wisp.frag); the rest are authored here.
// Preview every preset live at /shaders (ShaderGallery). Each frag opens with
// `// name:` / `// group:` header comments, mirrored in SHADER_LIST at the foot.

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

// Day/night cloud sky: the Away hero shader, shared here so the case-study
// phone mocks can run the same live sky as a "morning" time-of-day backdrop.
export const CLOUDS = `// name: Cloud Sky
// group: Sky
precision highp float;
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

// fbm with a rotation per octave, breaks the grid-aligned "smoke" look
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

// cloud density field: gentle billowing warp instead of heavy smearing
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

// Aurora: waving vertical curtains of light over a night sky (stars in the
// dark theme); on the light theme the curtains soften to a faint pastel silk.
export const AURORA = `// name: Aurora
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
    vec2 uv = v_uv;
    float t = u_time;
    float aspect = u_resolution.x / u_resolution.y;

    // sky gradient: deep night vs soft dawn
    vec3 top = mix(vec3(0.55, 0.72, 0.86), vec3(0.02, 0.03, 0.10), u_dark);
    vec3 bot = mix(vec3(0.88, 0.83, 0.90), vec3(0.05, 0.02, 0.12), u_dark);
    vec3 col = mix(bot, top, uv.y);

    // faint stars (dark theme only), twinkling
    vec2 sg = floor(vec2(uv.x * aspect, uv.y) * 240.0);
    float star = step(0.992, hash(sg)) * (0.5 + 0.5 * sin(t * 3.0 + hash(sg) * 30.0));
    col += vec3(star) * u_dark * 0.7;

    // three curtains, each a soft height-band waving in x with vertical streaking
    vec3 aur = vec3(0.0);
    for (int i = 0; i < 3; i++) {
        float fi = float(i);
        float x = uv.x * 2.2 + fi * 3.7;
        float base = 0.34 + fi * 0.15 + fbm(vec2(x, t * 0.12 + fi)) * 0.34;
        float band = exp(-pow((uv.y - base) * 3.0, 2.0));
        float streak = 0.55 + 0.45 * fbm(vec2(uv.x * 42.0, uv.y * 6.0 - t * 0.5));
        float a = band * streak;
        vec3 c = mix(vec3(0.15, 0.95, 0.55), vec3(0.30, 0.55, 1.0), fi * 0.5); // green -> teal
        c = mix(c, vec3(0.88, 0.32, 0.82), smoothstep(base, base + 0.30, uv.y)); // magenta tips
        aur += c * a;
    }
    col += aur * mix(0.22, 1.0, u_dark); // glows on night sky, whispers on day

    vec2 vg = uv * 2.0 - 1.0;
    col *= 1.0 - 0.12 * dot(vg, vg);
    col += (hash(gl_FragCoord.xy + t) - 0.5) / 220.0;
    gl_FragColor = vec4(col, 1.0);
}
`;

// Mesh Gradient: four drifting colour sources blended by inverse-distance, the
// soft animated-gradient look. Premium powder/cream/sage by day, deep jewel by
// night. The most surface-agnostic wash; light-mode friendly.
export const MESH_GRADIENT = `// name: Mesh Gradient
// group: Gradient
precision highp float;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_dark;
varying vec2 v_uv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = vec2(v_uv.x * aspect, v_uv.y);
    float t = u_time * 0.25;

    // four colour sources on slow lissajous paths
    vec2 s0 = vec2(0.35 * aspect + 0.25 * aspect * sin(t * 0.70),       0.35 + 0.22 * cos(t * 0.90));
    vec2 s1 = vec2(0.70 * aspect + 0.20 * aspect * sin(t * 0.90 + 2.0), 0.65 + 0.20 * cos(t * 0.60 + 1.0));
    vec2 s2 = vec2(0.50 * aspect + 0.28 * aspect * cos(t * 0.50 + 1.5), 0.55 + 0.25 * sin(t * 0.80 + 3.0));
    vec2 s3 = vec2(0.55 * aspect + 0.24 * aspect * cos(t * 1.10),       0.30 + 0.20 * sin(t * 0.70 + 0.5));

    vec3 cA = mix(vec3(0.66, 0.80, 0.90), vec3(0.10, 0.16, 0.42), u_dark); // powder / indigo
    vec3 cB = mix(vec3(0.95, 0.88, 0.70), vec3(0.42, 0.12, 0.30), u_dark); // cream  / plum
    vec3 cC = mix(vec3(0.60, 0.78, 0.62), vec3(0.10, 0.34, 0.36), u_dark); // sage   / teal
    vec3 cD = mix(vec3(0.90, 0.72, 0.66), vec3(0.30, 0.20, 0.50), u_dark); // blush  / violet

    float w0 = 1.0 / (0.02 + dot(p - s0, p - s0));
    float w1 = 1.0 / (0.02 + dot(p - s1, p - s1));
    float w2 = 1.0 / (0.02 + dot(p - s2, p - s2));
    float w3 = 1.0 / (0.02 + dot(p - s3, p - s3));
    vec3 col = (cA * w0 + cB * w1 + cC * w2 + cD * w3) / (w0 + w1 + w2 + w3);

    col += (hash(gl_FragCoord.xy + t) - 0.5) * 0.02; // grain to kill banding
    gl_FragColor = vec4(col, 1.0);
}
`;

// Liquid Chrome: twice-warped fbm read as a molten metal surface, dark valleys,
// bright ridges, hot speculars, and a thin-film iridescent tint keyed to the warp.
export const LIQUID_CHROME = `// name: Liquid Chrome
// group: Metal
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
    vec2 p = vec2(v_uv.x * aspect, v_uv.y) * 2.2;
    float t = u_time * 0.15;

    // domain-warp twice -> flowing molten surface
    vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, -t)));
    vec2 r = vec2(fbm(p + 2.5 * q + vec2(1.7, t * 0.8)), fbm(p + 2.5 * q + vec2(8.3, -t * 0.6)));
    float f = fbm(p + 3.0 * r);

    float m = smoothstep(0.20, 0.90, f);
    vec3 col = mix(vec3(0.06, 0.07, 0.10), vec3(0.85, 0.88, 0.95), m);       // steel ramp
    col = mix(col, vec3(1.0), pow(smoothstep(0.70, 0.95, f), 3.0));          // specular hits
    vec3 film = 0.5 + 0.5 * cos(6.2831 * (r.x + r.y + vec3(0.0, 0.33, 0.67)));// thin-film tint
    col = mix(col, col * (0.7 + 0.6 * film), 0.35);

    col = mix(col * 1.15 + 0.05, col, u_dark); // light theme = brighter liquid silver

    col += (hash(gl_FragCoord.xy + t) - 0.5) * 0.015;
    gl_FragColor = vec4(col, 1.0);
}
`;

// Caustics: animated warped interference read as the bright web of light on a
// pool floor: thin veins over a blue-green body, deeper and cooler at night.
export const CAUSTICS = `// name: Caustics
// group: Water
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

void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv = vec2(v_uv.x * aspect, v_uv.y);
    float t = u_time * 0.4;

    // three layers of warped sin interference, ridged so peaks read as veins
    vec2 p = uv * 7.0;
    float c = 0.0;
    for (int i = 0; i < 3; i++) {
        vec2 q = p + float(i) * 1.7;
        q += 0.6 * vec2(noise(q + t * 0.5), noise(q.yx - t * 0.4));
        c += 1.0 - abs(sin(q.x + t) * sin(q.y - t * 0.9));
        p *= 1.4;
    }
    c = pow(clamp(c / 3.0, 0.0, 1.0), 3.5);

    vec3 deep    = mix(vec3(0.10, 0.42, 0.55), vec3(0.02, 0.10, 0.18), u_dark);
    vec3 shallow = mix(vec3(0.35, 0.72, 0.78), vec3(0.06, 0.28, 0.36), u_dark);
    vec3 col = mix(deep, shallow, v_uv.y);
    col += mix(vec3(0.90, 1.0, 0.95), vec3(0.55, 0.85, 0.95), u_dark) * c * 1.2;

    vec2 vg = v_uv * 2.0 - 1.0;
    col *= 1.0 - 0.14 * dot(vg, vg);
    col += (hash(gl_FragCoord.xy + t) - 0.5) / 220.0;
    gl_FragColor = vec4(col, 1.0);
}
`;

// Quilt: a grid of soft embossed rounded tiles in a running-bond offset, lit by a
// slowly rotating raking light so only the rounded rims shade while the centres
// stay flat. High-key near-white by day (matches the reference), charcoal quilt by
// night. Height field -> normal-from-gradient -> directional light (the brick-jali
// "pattern carried by depth + raking light" idea, made into a soft surface).
export const QUILT = `// name: Quilt
// group: Surface
precision highp float;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_dark;
varying vec2 v_uv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

// signed distance to a rounded box centred at the origin
float sdRoundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

const float GRID = 8.0; // tiles across one unit of height

// height of the quilted surface at aspect-corrected point p (in tile units)
float quilt(vec2 p) {
    p.x += 0.5 * mod(floor(p.y), 2.0);          // running-bond: offset alt rows
    vec2 id = floor(p);
    vec2 g = fract(p) - 0.5;
    float rnd = hash(id);
    float rad = 0.26 + 0.08 * rnd;              // slight per-tile corner variation
    float d = sdRoundBox(g, vec2(0.44), rad);
    float h = 1.0 - smoothstep(-0.22, 0.04, d); // wide bevel -> puffy dome
    return h * h * (3.0 - 2.0 * h);             // smooth the shoulders
}

void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = vec2(v_uv.x * aspect, v_uv.y) * GRID;

    // surface normal from central differences of the height field
    float e = 0.05;
    float hx = quilt(p + vec2(e, 0.0)) - quilt(p - vec2(e, 0.0));
    float hy = quilt(p + vec2(0.0, e)) - quilt(p - vec2(0.0, e));
    float h = quilt(p);
    vec3 n = normalize(vec3(-hx, -hy, 1.2));

    // slowly rotating raking light + a soft specular sheen
    float a = u_time * 0.25;
    vec3 L = normalize(vec3(cos(a) * 0.85, sin(a) * 0.85, 0.6));
    vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
    float diff = clamp(dot(n, L), 0.0, 1.0);
    float spec = pow(clamp(dot(n, H), 0.0, 1.0), 22.0);
    float ao = mix(mix(0.90, 0.70, u_dark), 1.0, h); // grooves between tiles sit in shadow

    // high-key near-white by day, charcoal quilt by night
    vec3 base = mix(vec3(0.965, 0.965, 0.97), vec3(0.115, 0.12, 0.135), u_dark);
    float shade = mix(0.12, 0.55, u_dark);           // shading depth per theme
    vec3 col = base * (1.0 - shade + shade * diff) * ao;
    col += spec * mix(0.10, 0.35, u_dark);

    col += (hash(gl_FragCoord.xy) - 0.5) * 0.010;    // dither out banding
    gl_FragColor = vec4(col, 1.0);
}
`;

// The registry ShaderCanvas resolves `preset` against, plus a display list the
// /shaders gallery maps over (label + group mirror each frag's header comments).
// Vendored VERBATIM from the source-of-truth viewer at
// public/shader-viewer/presets/living-sky.frag. Do not edit it here: edit the
// preset, re-run build-presets.mjs, and re-vendor. This copy exists only so the
// site can compile it without fetching a file at runtime.
//
// It declares SIXTEEN uniforms beyond the canvas defaults. Unset uniforms read as
// 0 in WebGL, and 0 means midnight, no cloud cover and ZERO EXPOSURE — a black
// rectangle. ShaderCanvas must be given `uniforms` for this preset or it renders
// nothing at all. LIVING_SKY_DEFAULTS below is that set.
export const LIVING_SKY = `// name: Living Sky
// group: Sky
// param float u_tod      "Time of day"    0.0 1.0 0.35
// param float u_cycle    "Day speed"      0.0 1.0 0.00
// param float u_season   "Season"         0.0 1.0 0.50
// param float u_latitude "Latitude"       0.0 1.0 0.50
// param float u_cover    "Cloud cover"    0.30 0.85 0.52
// param float u_softness "Cloud softness" 0.0 1.0 0.40
// param float u_wind     "Wind"           0.0 1.0 0.40
// param float u_haze     "Haze"           0.0 1.0 0.35
// param float u_stars    "Stars"          0.0 1.0 0.80
// param float u_aurora   "Aurora"         0.0 1.0 0.00
// param float u_precip   "Precipitation"  0.0 1.0 0.00
// param float u_kind     "Rain..snow"     0.0 1.0 0.00
// param float u_fog      "Fog"            0.0 1.0 0.00
// param float u_storm    "Storm"          0.0 1.0 0.00
// param float u_scale    "Cloud scale"    1.0 7.0 3.00
// param float u_persp    "Perspective"    0.0 1.0 1.00
// param float u_cirrus   "High cloud"     0.0 2.0 1.00
// param float u_gust     "Gustiness"      0.0 0.6 0.30
// param float u_evolve   "Cloud evolution" 0.0 4.0 1.00
// param float u_glare    "Sun glare"      0.0 2.0 1.00
// param float u_moonph   "Moon phase"     0.0 1.0 0.50
// param float u_sat      "Saturation"     0.0 1.6 1.00
// param float u_exposure "Exposure"       0.5 1.6 1.00
// param color u_tint     "Tint"           #ffffff
//
// The 24-hour, four-season, ALL-WEATHER living sky. Time of day (u_tod: 0 midnight,
// .25 dawn, .5 noon, .75 dusk) drives the sun; Season (0/1 winter, .5 summer) +
// Latitude reshape the sun's arc, day length, palette warmth, golden-hour width and
// star clarity. Weather rides on top: cloud cover/softness/wind, atmospheric haze,
// precipitation (u_precip intensity, u_kind 0 rain .5 sleet 1 snow), ground fog and
// storm (gloom + lightning). Every WMO condition maps onto that set - see
// src/lib/weather.js on the site. No SUN disc (you cannot look at the sun - it is a
// region of glow, and the halo draws that); there IS a moon disc, because you can
// look at the moon and it is the brightest object in a night frame.
// Clock-ready via u_tod = (h*3600+m*60+s)/86400. u_dark unused.
//
// THE WINDOW BUILD. Compiled with "#define SKY_WINDOW" in front of it (which
// src/scene/window/skyPlate.js does), this becomes the view out of one real
// window: a true bearing and field of view, the real wind's direction, city
// skyglow, a moon the page places, and lightning the page times so the room can
// flash with it. EVERY line of that sits inside #ifdef SKY_WINDOW, so every other
// page (the home band, /sky, /shaders, this viewer) compiles exactly the program
// it compiled before the window existed. Not merely "the same at default values":
// the same program, which is the only way to be pixel identical on every GPU. The
// first attempt used plain uniforms defaulting to 0, and a top-level branch on one
// was enough to move the Metal compiler's scheduling of the shared math and flip
// about one pixel in ten thousand by 1/255. (Proven both ways in the window-light
// session: float render targets, old source against new.)
precision highp float;
uniform float u_time;
uniform vec2  u_mouse;
uniform vec2  u_resolution;
uniform float u_dark;
uniform float u_tod;
uniform float u_cycle;
uniform float u_season;
uniform float u_latitude;
uniform float u_cover;
uniform float u_softness;
uniform float u_wind;
uniform float u_haze;
uniform float u_stars;
uniform float u_aurora;
uniform float u_precip;
uniform float u_kind;
uniform float u_fog;
uniform float u_storm;
uniform float u_scale;     // deck sampling scale: bigger number, smaller clouds
uniform float u_persp;     // 0 flat noise field .. 1 full perspective deck
uniform float u_cirrus;    // high-cloud amount, on top of what cover implies
uniform float u_gust;      // wind gust amplitude as a fraction of mean speed
uniform float u_evolve;    // how fast cloud shapes form and dissipate
uniform float u_glare;     // aureole strength around the sun
uniform float u_moonph;    // 0 new .. 0.5 full .. 1 new again
uniform float u_sat;       // final grade
uniform float u_exposure;
// Real solar geometry, supplied by the page when it knows where the viewer is
// (see src/lib/weather.js). u_sunReal 0 = use the internal time-of-day model, which
// is what the lab and every older caller do; 1 = use the two values below, which
// are computed from latitude, longitude and the actual date with the standard
// declination + hour-angle solution. The model is a good sine; the real sun is not
// a sine, and the difference is up to about 40 minutes at the solstices.
uniform float u_sunReal;
uniform float u_sunElev;   // -1 .. 1, sin of the true solar elevation
uniform float u_sunAz;     //  0 .. 1 across the frame, 0.5 = due south at noon
uniform vec3  u_tint;
#ifdef SKY_WINDOW
// The classic frame is a view toward the equator 180 degrees wide: the sun rises
// at its left edge and sets at its right, every day. A real window faces ONE
// bearing and sees a slice of that. With u_fovH > 0 the plate is that slice, an
// equirectangular patch of sky:
//   bearing   = u_viewAz + (v_uv.x - 0.5) * u_fovH       (degrees, 0 N, 90 E)
//   elevation = v_uv.y * u_fovH / aspect                  (degrees, 0 = horizon)
// so a pixel spans the same angle across as up, and the sun's glare, the gold of
// sunset and the Belt of Venus sit where they really are relative to the window
// (for a north-facing one: always off to the side).
uniform float u_fovH;      // plate width in degrees of bearing; 0 = the classic frame
uniform float u_viewAz;    // bearing of the plate's centre, degrees
uniform float u_sunAzDeg;  // the sun's compass azimuth, degrees (read with u_sunReal)
// Wind: the deck's drift turned by this many radians, counterclockwise in the
// deck plane (x right, y away from the viewer). 0 = the classic drift, which
// carries cloud from right to LEFT across the frame (measured). The page works
// the angle out from the real wind: see src/scene/window/skyPlate.js.
uniform float u_windDir;
// Lightning the page decided, so the room flashes on the same frame.
uniform float u_flash;     // 0..1 brightness now
uniform float u_flashX;    // 0..1 across the frame, where it lit
// City skyglow: ground light scattered back by the air and, far more strongly,
// by the underside of low cloud. Night only.
uniform float u_skyglow;   // 0..1
uniform vec3  u_skyglowColor;
// 1 = this plate is the backdrop of a 3D scene that draws its own rain and fog in
// front of its trees and times its own lightning: the plate draws sky and cloud
// only (precipitation still darkens and flattens the deck, as it should).
uniform float u_plateOnly;
// A moon the page places instead of the modelled one: how visible (u_moonReal,
// 0..1; 0 = the model), where on the plate (0..1 each), which way its lit limb
// faces (radians on screen, from +x, counterclockwise) and a size multiplier
// (0 reads as 1).
uniform float u_moonReal;
uniform float u_moonX;
uniform float u_moonY;
uniform float u_moonLimb;
uniform float u_moonScale;
// THE WINDOW'S AFTERNOON CUMULUS. Seen from the ground a field of fair-weather
// cumulus stacks up toward the horizon (a low line of sight crosses many cells, a
// high one few), and Bangalore's afternoon towers stand on the horizon with clear
// sky above them (the 17:41 photo: gold cumulus in the lower half of the middle
// panes, pale blue above). u_cuBand shapes the deck by elevation in degrees: x
// where the cover starts to thin upward, y where the sky above is clear of the
// low deck, z how far the cover threshold rises above y, w how far it falls below
// x (more cloud low down). All 0 = the deck as it was.
uniform vec4  u_cuBand;
// Finer structure for a deck seen up close through a window pane: another octave
// set in the density (the cauliflower lobes of a cumulus top) and erosion of its
// edges (torn shreds). 0 = none.
uniform float u_cuDetail;
// The shaded underside of the window's cumulus: rgb a colour (only its hue and
// chroma are used), w how much of it. In the golden hour a cumulus base is lit by
// the sky, not by the sun, and reads grey-lilac under the gold tops.
uniform vec4  u_cuBase;
// ONE CUMULUS MASS where the window's middle row looks (the 17:41 photo: a single
// soft cream-gold cumulus fills the lower two thirds of row B, pale blue above it,
// not a field of cloudlets): a smooth bump added to the deck's DENSITY only, so the
// samples that shade it (toward the sun, and below for the base) stay the field's
// own and the mass is lit like any cloud. x its bearing, y its elevation (deg), z
// its half-width in bearing (deg; half of that in elevation), w how much (0 =
// none). Its base is flat: below the centre it falls off 2.2x faster.
uniform vec4  u_cuMass;
// How fast the window's deck drifts, times the classic drift. The home band's
// drift is a time-lapse; seen through a window the cumulus are kilometres away
// and cross a degree in tens of seconds.
uniform float u_advect;
// How much of a placed moon's glow into the air to hold back (0 = all of it
// shows), outside the disc itself: in the blue hour the glow washed the deep blue
// to a milky grey-blue (the disc, drawn crisp by the page, is left alone).
uniform float u_moonGlowCut;
#endif
varying vec2 v_uv;

// Sin-free hash (Hoskins). The old sin(dot(...)) form costs a transcendental per
// call and this shader makes ~140 of them per pixel; this is the single biggest
// win in the file and it distributes better besides. The pattern it generates is
// DIFFERENT from the old one - same statistics, different clouds - so anything
// judged against a screenshot of the old hash has to be re-judged.
float hash(vec2 p) {
    vec3 q = fract(vec3(p.xyx) * 0.1031);
    q += dot(q, q.yzx + 33.33);
    return fract((q.x + q.y) * q.z);
}
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i + vec2(0.0, 0.0)), b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
// Octave count is a COST decision, not a quality one past a point: octave 6 adds
// amplitude 0.017 and octave 7 adds 0.009, both of which disappear under the
// coverage smoothstep. The cloud path uses fbm5 for the field and fbm3 for the
// domain warp (a warp is low-frequency by definition - high octaves in it are
// paid for and then thrown away). fbm7 stays for the aurora, which is seen
// against a black sky where fine structure does show.
float fbm7(vec2 p) {
    float value = 0.0, amplitude = 0.55;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 7; i++) { value += amplitude * noise(p); p = m * p; amplitude *= 0.5; }
    return value;
}
float fbm(vec2 p) {   // 5 octaves - the working default
    float value = 0.0, amplitude = 0.55;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++) { value += amplitude * noise(p); p = m * p; amplitude *= 0.5; }
    return value;
}
float fbm3(vec2 p) {
    float value = 0.0, amplitude = 0.55;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 3; i++) { value += amplitude * noise(p); p = m * p; amplitude *= 0.5; }
    return value;
}
#ifdef SKY_WINDOW
// a unit vector for a compass bearing and an elevation, both in degrees (only
// angles between two of these are ever taken, so any fixed frame will do)
vec3 skyDir(float azDeg, float elDeg) {
    float a = radians(azDeg), e = radians(elDeg);
    return vec3(cos(e) * sin(a), sin(e), cos(e) * cos(a));
}
#endif
float cloudDensity(vec2 p) {
    float warp = fbm(p * 1.2);
    return fbm(p * 1.8 + warp * 0.5);
}
// realistic star field: round sub-pixel points, power-law brightness, colour + twinkle
vec3 starLayer(vec2 uv, float dens, float expo, float rad, float t) {
    vec2 g = uv * dens;
    vec2 id = floor(g);
    vec2 f = fract(g) - 0.5;
    vec2 pos = (vec2(hash(id + 1.3), hash(id + 2.7)) - 0.5) * 0.7;
    float d = length(f - pos);
    float bright = pow(hash(id + 4.1), expo);
    float pt = bright * (1.0 - smoothstep(0.0, rad, d));
    // Scintillation is an AIR MASS effect: a star overhead is seen through the least
    // atmosphere and sits nearly steady, while one near the horizon is seen through
    // many times as much and flickers hard. A field that twinkles uniformly is the
    // giveaway of a star shader; this costs one extra multiply.
    float scint = 0.10 + 0.55 * (1.0 - clamp(v_uv.y, 0.0, 1.0));
    pt *= (1.0 - scint) + scint * sin(t * (1.2 + hash(id) * 2.5) + hash(id) * 100.0);
    vec3 tint = mix(vec3(0.75, 0.82, 1.0), vec3(1.0, 0.9, 0.78), hash(id + 5.0));
    return tint * max(pt, 0.0);
}
// One sheet of rain: a slanted grid of SQUARE screen-space cells, each carrying at
// most one short dash. Three things matter and the first version got all three
// wrong, which is why it read as scratches on a lens rather than as rain:
//   1. the cells are square (the first pass stretched them 3x tall, so one drop
//      filled a whole cell and every column became one unbroken floor-to-ceiling
//      line);
//   2. the dash is SHORT relative to its cell (len), so a column is drops with air
//      between them;
//   3. the dash's position is jittered on BOTH axes, so nothing lines up into the
//      rows and columns the grid is really made of.
// fill is the fraction of cells carrying a drop, so intensity thins the sheet out
// rather than only fading it - light drizzle is FEWER drops, not dimmer ones.
// lenPx / widPx are in PIXELS, converted to cell units here. A drop is about a
// pixel and a half wide whatever it is drawn into, which is the only way the same
// shader can run in a 460px header band and a full screen and be rain in both -
// in cell units the header's rain came out three times fatter than the lab's.
float rainSheet(vec2 uv, float dens, float speed, float slant, float fill, float lenPx, float widPx, float t) {
    vec2 q = uv;
    q.x += q.y * slant;                    // wind shear, applied before the grid
    q *= dens;
    // v_uv.y points UP in GL, so the grid has to be scrolled UP for the drops to
    // fall DOWN. Subtracting here (the obvious-looking form) makes it rain
    // upwards - which is exactly what it did until Agam caught it.
    q.y += t * speed;                      // speed is in cells/sec
    vec2 id = floor(q);
    vec2 f = fract(q);
    if (hash(id + 6.2) > fill) return 0.0;
    float k = dens / max(u_resolution.y, 1.0);       // pixels -> cell units
    float len = lenPx * k, wid = widPx * k;
    float x = 0.12 + 0.76 * hash(id + 3.1);          // where across the cell
    float y = 0.5 + (hash(id + 9.4) - 0.5) * 0.55;   // and how far down it
    float body = smoothstep(wid, wid * 0.2, abs(f.x - x));
    body *= smoothstep(len, len * 0.25, abs(f.y - y));
    // the head of a falling drop is brighter than its tail
    body *= 0.65 + 0.35 * smoothstep(len, -len, f.y - y);
    return body;
}
// One sheet of snow: round flakes on a drifting grid, size varied per cell.
float snowSheet(vec2 uv, float dens, float speed, float fill, float t) {
    vec2 q = uv * dens;
    q.y += t * speed;                       // + = downward, see rainSheet
    q.x += sin(t * 0.5 + q.y * 1.3) * 0.4;  // lateral sway, the tell of snow
    vec2 id = floor(q);
    vec2 f = fract(q) - 0.5;
    if (hash(id + 2.2) > fill) return 0.0;
    vec2 pos = (vec2(hash(id + 1.7), hash(id + 4.3)) - 0.5) * 0.6;
    float r = 0.10 + 0.14 * hash(id + 8.2);
    return smoothstep(r, 0.0, length(f - pos));
}

void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv = v_uv; uv.x *= aspect;
    float t = u_time;

    // --- clock + season ---
    float tod = fract(u_tod + u_time * u_cycle * 0.02);         // 0..1 over 24h
    float summer = 0.5 - 0.5 * cos(u_season * 6.2831853);       // 0 winter .. 1 summer
    float ang = (tod - 0.25) * 6.2831853;                       // 0 at dawn
    float latScale = mix(1.0, 0.45, u_latitude);                // sun rides lower toward the poles
    float elev = sin(ang) * latScale
               + mix(-0.10, 0.10, summer) * (0.5 + u_latitude); // seasonal day-length swing, bigger at high lat
    // hand over to the real thing when the page has it
    elev = mix(elev, u_sunElev, u_sunReal);
    float dayAmt   = smoothstep(-0.05, 0.35, elev);
    float nightAmt = 1.0 - smoothstep(-0.25, 0.05, elev);
    float gwidth   = mix(0.46, 0.32, summer);                   // winter golden hour wider
    float golden   = 1.0 - smoothstep(0.0, gwidth, abs(elev));  // peaks at dawn & dusk (spec-safe)

    float sunX = mix((tod - 0.25) * 2.0, u_sunAz, u_sunReal);
    vec2 sunDir = normalize(vec2((sunX - 0.5) * 1.2, max(elev, 0.2)) + vec2(0.001));
    // Where the sun actually IS on screen, which the sky needs even with no disc
    // drawn: a real sky's brightest region is around the sun and everything else
    // is read relative to it.
    vec2 sunPos = vec2(clamp(sunX, -0.2, 1.2) * aspect, clamp(elev, -0.25, 1.15));
    float sunD  = distance(vec2(uv.x, v_uv.y), sunPos);
#ifdef SKY_WINDOW
    // WINDOW: the same quantities from real angles. Screen distance in the classic
    // frame only ever stood in for the angle between this bit of sky and the sun;
    // here the angle is computed and sunD carries it back in classic units
    // (theta = sunD * 1.35), so every term downstream reads it unchanged. winSide
    // and winAnti replace the two horizontal falloffs (sunset gold toward the sun,
    // Belt of Venus opposite it) at the strengths per radian the classic frame
    // had at aspect 2 (0.80 and 0.85 per 90 degrees).
    float winSide = 0.0, winAnti = 0.0;
    if (u_fovH > 0.0) {
        float fovV   = u_fovH / aspect;
        float pixAz  = u_viewAz + (v_uv.x - 0.5) * u_fovH;
        float pixEl  = v_uv.y * fovV;
        // without a real sun, the model's rises in the east, stands in the south
        // at noon and sets in the west
        float sunAzW = mix(90.0 + (tod - 0.25) * 360.0, u_sunAzDeg, u_sunReal);
        float sunElW = degrees(asin(clamp(elev, -1.0, 1.0)));
        float relAz  = mod(sunAzW - u_viewAz + 180.0, 360.0) - 180.0;
        sunDir = normalize(vec2(sin(radians(relAz)), cos(radians(relAz))) + vec2(0.001));
        sunPos = vec2((0.5 + relAz / u_fovH) * aspect, sunElW / fovV);
        float th = acos(clamp(dot(skyDir(pixAz, pixEl), skyDir(sunAzW, sunElW)), -1.0, 1.0));
        sunD = th / 1.35;
        float dPix = abs(mod(pixAz - sunAzW + 180.0, 360.0) - 180.0);   // 0..180 deg
        winSide = exp(-radians(dPix) * 0.51);
        winAnti = exp(-radians(180.0 - dPix) * 0.54);
    }
#endif
    // THE MOON, WITH A PHASE. Approximating it as always full had a consequence I
    // did not see until the night states were probed: a full moon rises as the sun
    // sets, so the moon was up whenever the sun was down and a MOONLESS NIGHT COULD
    // NEVER HAPPEN. Half of all real nights are moonless or nearly so, and they are
    // the ones you can see anything in.
    // Phase is taken from the date (u_season carries day-of-year), running through
    // about 12.37 lunations a year, so it drifts the way the real one does. Offset 0
    // is new moon, which rises WITH the sun and is invisible; 0.5 is full, which
    // rises as the sun sets.
    // Phase is a PARAMETER now rather than derived from the season inside here.
    // The page still computes it from the date (see src/lib/weather.js) - it just
    // does the computing outside, where it can also be verified - and the lab gets
    // a slider, which is the only way to see a crescent without waiting a fortnight.
    float moonPhase = fract(u_moonph);
    float moonLit   = 0.5 - 0.5 * cos(moonPhase * 6.2831853);   // 0 new .. 1 full
    float mTod  = fract(tod + moonPhase);
    float mAng  = (mTod - 0.25) * 6.2831853;
    float mElev = sin(mAng) * latScale + mix(-0.10, 0.10, summer) * (0.5 + u_latitude);
    vec2 moonPos = vec2(clamp((mTod - 0.25) * 2.0, -0.2, 1.2) * aspect, clamp(mElev, -0.25, 1.15));
#ifdef SKY_WINDOW
    float moonUp = smoothstep(-0.04, 0.10, mElev);
    // A page that knows where the moon is (or where it wants it) places it and
    // says how visible it is. A window that places none shows none: the modelled
    // moon walks the classic frame, which a window's slice is not.
    if (u_moonReal > 0.0) {
        moonPos = vec2(u_moonX * aspect, u_moonY);
        moonUp  = clamp(u_moonReal, 0.0, 1.0);
    } else if (u_fovH > 0.0) {
        moonUp = 0.0;
    }
    float moonD  = distance(vec2(uv.x, v_uv.y), moonPos);
#else
    float moonD  = distance(vec2(uv.x, v_uv.y), moonPos);
    float moonUp = smoothstep(-0.04, 0.10, mElev);
#endif

    // --- weather bookkeeping ---
    // Overcast rain cloud is not just more cloud, it is FLATTER and DARKER, and a
    // storm is darker still. Both are derived here so every downstream term (cloud
    // colour, golden hour, stars, lining) dims together instead of one by one.
    float wet    = clamp(u_precip, 0.0, 1.0);
    // u_cover is a THRESHOLD on the cloud noise, so it runs BACKWARDS: a low value
    // is more cloud. This term had it the right way round for a slider and the wrong
    // way round for the world - a clear sky (0.80) was being given gloom 0.20 and an
    // overcast one (0.34) none, so clear days were slightly dimmed, their golden hour
    // cut by a sixth and their stars thinned, while overcast days kept a bright sky.
    float gloom  = clamp(wet * 0.55 + u_storm * 0.55 + max(0.55 - u_cover, 0.0) * 0.8, 0.0, 1.0);
    float flat_  = clamp(wet * 0.7 + u_storm * 0.5, 0.0, 1.0);  // flattens cloud lighting contrast
    golden *= 1.0 - 0.85 * gloom;                               // no golden hour under a rain deck

    // --- clouds, on a deck seen in PERSPECTIVE ---
    // The single biggest tell in the old version was that the cloud field was flat:
    // uniform cell size top to bottom, which is a texture, not a sky. A real deck is
    // a plane above the viewer, so its texture coordinate runs to infinity at the
    // horizon - cells shrink and crowd as they approach it, and wind moves distant
    // cloud slower than overhead cloud without any extra parallax term, because the
    // constant offset in DECK space is what perspective divides down.
    // How MUCH perspective is the whole judgement here. A full 0..90 degree divide
    // (yv floor near zero) is a grazing view along the deck: every cloud becomes a
    // horizontal smear and the bottom of the frame aliases into pillars. Someone
    // standing outside is looking mostly UP, so the frame covers a narrow band of
    // elevation and the compression across it is about 3x, not 50x.
    // u_persp 1 is the deck-in-perspective of iteration 1; 0 collapses it back to
    // a flat field, which is what this was before that iteration and is still the
    // right look for an abstract wash rather than a sky.
    float pFloor = 1.0 - 0.45 * u_persp;
    float yv   = max(v_uv.y * 0.70 * u_persp + pFloor, pFloor);
    vec2  deck = vec2(uv.x / yv, 1.0 / yv);      // uv.x is already aspect-corrected
#ifdef SKY_WINDOW
    // A window looks along its own centre line, so the deck's vanishing point is
    // the middle of the plate, not the classic frame's left edge (where the divide
    // above anchors it). With the anchor at the edge, wind blowing straight in or
    // out of the window also slid every cloud sideways (measured).
    if (u_fovH > 0.0) deck.x = (uv.x - 0.5 * aspect) / yv;
#endif
    // WIND GUSTS. Real wind pulses - it rises and eases on a 20-70 second cycle with
    // lulls between, and a deck sliding at exactly one rate is the last thing in the
    // frame still behaving like a machine.
    // INTEGRATED, not multiplied. Position is the integral of speed, so writing
    // t * speed(t) makes the cloud slide BACKWARDS every time a gust eases, which is
    // worse than no gusts at all. sin(wt)/w is the integral of cos(wt), so adding it
    // to the offset gives a SPEED that varies as a cosine - and with the amplitudes
    // below the speed dips to 35% of the mean at the deepest lull and never reverses.
    float wMean = mix(0.01, 0.09, u_wind);
    // 0.30, not 0.42: at 0.42 the deepest lull dropped the deck to 35% of mean and
    // the peak reached 1.65x, a 4.7x spread between them. Real gust factors are
    // nearer 1.5x - wind eases, it does not nearly stop - and 0.30 gives 0.54x to
    // 1.46x, a 2.7x spread, which is a breezy day rather than a stuttering one.
    float gAmp  = wMean * u_gust;
    float gust  = gAmp * (sin(t * 0.085) / 0.085 + 0.55 * sin(t * 0.23 + 1.7) / 0.23);
    // the same pulse as a multiplier, for things that respond to wind SPEED rather
    // than to distance travelled
    float gustNow = 1.0 + u_gust * (cos(t * 0.085) + 0.55 * cos(t * 0.23 + 1.7));
#ifdef SKY_WINDOW
    // REAL WIND DIRECTION. The drift is an offset in the noise domain, so cloud
    // moves the OPPOSITE way to it: the classic +x offset carries the deck right
    // to left. u_windDir turns the offset in the deck plane, where +y is away from
    // the viewer, so wind blowing toward the window brings cloud up out of the
    // horizon and wind blowing away from it sends cloud down into the horizon.
    vec2 drift = vec2((t * wMean + gust) * u_advect, 0.0);
    mat2 windRot = mat2(1.0, 0.0, 0.0, 1.0);
    if (u_windDir != 0.0) {
        windRot = mat2(cos(u_windDir), sin(u_windDir), -sin(u_windDir), cos(u_windDir));
        drift = windRot * drift;
    }
    vec2 p = deck * u_scale + (u_mouse - 0.5) * 0.6 + drift;
#else
    vec2 p = deck * u_scale + (u_mouse - 0.5) * 0.6 + vec2(t * wMean + gust, 0.0);
#endif
    // The warp is computed ONCE and reused by all three samples below (density, the
    // sunward sample, the downward one). They have to share it or they are sampling
    // three different cloud fields and the shading derivatives are meaningless -
    // and it is also what keeps this at four fbm calls instead of six.
    // The deck also EVOLVES, it does not only slide. Cloud forms and dissipates, and
    // a field that is purely translated reads as a scrolling texture the moment
    // anyone looks at it for more than a few seconds - which on a portfolio header
    // is most of the visit. Drifting the warp's own domain slowly makes the shapes
    // change as they cross, at zero cost: it is an offset, not a sample.
    // Deliberately much slower than the wind - weather changes over minutes, and
    // anything faster reads as boiling rather than as sky.
    float warp    = fbm3(p * 1.2 + vec2(t * 0.004, t * 0.0026) * u_evolve);
    float density = fbm(p * 1.8 + warp * 0.5);
    // The threshold is nudged down because the perspective divide concentrates the
    // noise: at the same u_cover the projected field carries visibly LESS cloud than
    // the flat one did, and the weather mapping's numbers were tuned against the
    // flat one. Without this, "Overcast" came out as a blue sky with clouds in it.
    // The downward sample (used again below for base shading): positive gradient
    // means the field thins downward, i.e. this pixel is near the cloud's UNDERSIDE.
    float below = fbm((p + vec2(0.0, 0.13)) * 1.8 + warp * 0.5);
    float grad  = density - below;
#ifdef SKY_WINDOW
    // the finer lobes, after the gradient (the base's shading stays smooth)
    if (u_cuDetail > 0.0) density += u_cuDetail * (fbm3(p * 5.3 + warp * 0.9 + 11.7) - 0.5) * 0.20;
    // the cumulus mass (density only, after the gradient: its shading is the field's)
    if (u_fovH > 0.0 && u_cuMass.w > 0.0) {
        float azM = u_viewAz + (v_uv.x - 0.5) * u_fovH;
        float elM = v_uv.y * (u_fovH / aspect);
        vec2 dM = vec2((azM - u_cuMass.x) / u_cuMass.z, (elM - u_cuMass.y) / (u_cuMass.z * 0.5));
        dM.y *= dM.y < 0.0 ? 2.2 : 1.0;
        density += u_cuMass.w * exp(-dot(dM, dM));
    }
#endif
    // ASYMMETRIC EDGE - this is cumulus form. A cumulus has a hard, near-flat base
    // (the condensation level, a sharp altitude) and a soft billowing top where it
    // is still boiling upward. One symmetric edge width gives a blob that is equally
    // soft all round, which is the shape of fog. Crisp underneath, soft on top.
    float edge = mix(0.14, 0.44, u_softness);
    float e = mix(edge * 1.55, edge * 0.40, smoothstep(-0.03, 0.05, grad));
    float covT = u_cover * 0.90;
#ifdef SKY_WINDOW
    float bandLift = 0.0;
    if (u_fovH > 0.0 && (u_cuBand.z != 0.0 || u_cuBand.w != 0.0)) {
        float elC = v_uv.y * (u_fovH / aspect);
        bandLift = u_cuBand.z * smoothstep(u_cuBand.x, u_cuBand.y, elC)
                 - u_cuBand.w * (1.0 - smoothstep(u_cuBand.x - 12.0, u_cuBand.x, elC));
        covT += bandLift;
    }
#endif
    float c = smoothstep(covT, covT + e, density);
    // OPTICAL THICKNESS, which is a different quantity from coverage and has been
    // conflated with it until now. Coverage says whether cloud is in the way;
    // thickness says how much of it there is. A wisp and a thunderhead can both be
    // fully opaque in outline and behave completely differently in light.
    float thickness = clamp((density - covT) / 0.34, 0.0, 1.0);
    c = pow(c, mix(1.7, 0.9, u_softness));                      // crisp vs soft; base [0,1] safe
    // Aerial perspective: cloud toward the horizon loses contrast and dissolves into
    // haze. It is also where the deck coordinate is densest, so this doubles as the
    // anti-aliasing the projection needs - detail finer than a pixel gets faded out
    // rather than left to sparkle.
    float aer = smoothstep(-0.10, 0.22, v_uv.y);
    c *= mix(0.72, 1.0, aer);
    // STRATUS. Below about 0.46 cover the sky stops being "cloud with gaps" and
    // becomes a continuous deck - a real overcast day has NO blue in it anywhere,
    // and a threshold on noise can never produce that however far it is pushed,
    // because thresholding always leaves holes. So past that point the field stops
    // deciding whether there is cloud and only decides how THICK it is. That is
    // also physically what changes: stratus is one sheet, not a field of objects.
    float strat = smoothstep(0.46, 0.30, u_cover);
    c = mix(c, clamp(0.80 + density * 0.30, 0.0, 1.0), strat);
    // EDGE WISPS. A real cloud boundary is not a smooth contour - it is torn, with
    // shreds and tendrils at a much finer scale than the body. Adding that detail
    // everywhere would just make the whole field noisy and cost a full octave set,
    // so it is applied ONLY in the band where the edge actually is: c*(1-c) peaks at
    // the boundary and is zero in open sky and deep inside cloud, which means three
    // cheap octaves buy the one thing the eye checks.
    float edgeBand = c * (1.0 - c) * 4.0;
    if (edgeBand > 0.02) {
        c = clamp(c + (fbm3(p * 6.5) - 0.5) * 0.34 * edgeBand * (1.0 - strat), 0.0, 1.0);
    }
#ifdef SKY_WINDOW
    // torn edges: a finer set eats into the boundary band only
    if (u_cuDetail > 0.0 && edgeBand > 0.02) {
        float fray = fbm3(p * 13.0 + vec2(3.1, 7.7));
        c = clamp(c - u_cuDetail * edgeBand * smoothstep(0.42, 0.72, fray) * 0.55 * (1.0 - strat), 0.0, 1.0);
    }
#endif
    float dSun = fbm((p + sunDir * 0.10) * 1.8 + warp * 0.5);
    float light = clamp((density - dSun) * 3.5 + 0.55, 0.0, 1.0);
    // Cumulus have a FLAT DARK BASE and a bright billowing top, because the cloud
    // above shadows the cloud below. The same downward sample taken for the edge
    // says which of the two this pixel is: cloud beneath it means body or top and
    // lit, none beneath means base, and a base sits in its own shadow.
    float body  = clamp(grad * 2.2 + 0.5, 0.0, 1.0);
    // WHICH SIDE IS LIT FLIPS WITH THE SUN. By day the sun is above the deck, so
    // tops are lit and bases sit in shadow. As it drops toward the horizon it goes
    // UNDER the cloud base and lights the undersides instead - which is the whole
    // reason a sunset looks like a sunset, and why the bright bits are underneath.
    // The term was darkening bases unconditionally, so at golden hour it was
    // fighting the low sun: that, not the palette, is what made the derived golden
    // hour read as muted in iteration 12.
    float fromBelow = smoothstep(0.26, -0.03, elev);       // 0 by day, 1 at sunset
    float bodyLit = mix(body, 1.0 - body, fromBelow);
    light *= mix(0.62, 1.06, bodyLit);
    // Forward scattering: cloud near the sun is lit THROUGH rather than on, so it
    // goes bright and loses its shading - the "you cannot look at that part of the
    // sky" effect that reads as sunlight more than any amount of blue does.
    float fwd = exp(-sunD * 1.7) * dayAmt * (1.0 - gloom);
    light = clamp(light + fwd * 0.55, 0.0, 1.0);
    // A stratus sheet has no modelling either, wet or dry: nothing is lit from the
    // side because there are no sides, only a ceiling.
    light = mix(light, 0.5, max(flat_, strat * 0.8));

    // --- sky palette (time of day + season temperature) ---
    vec3 dayTop   = mix(vec3(0.30, 0.52, 0.86), vec3(0.15, 0.40, 0.80), summer); // winter crisp -> summer deep
    vec3 dayHoriz = mix(vec3(0.72, 0.84, 0.95), vec3(0.60, 0.76, 0.90), summer);
    vec3 top   = mix(vec3(0.02, 0.03, 0.10), dayTop, dayAmt);
    vec3 horiz = mix(vec3(0.05, 0.05, 0.14), dayHoriz, dayAmt);
    // --- THE COLOUR OF DIRECT SUNLIGHT, from the air it has to cross ---
    // Sunlight is only white overhead. Near the horizon it crosses many times as
    // much atmosphere, and Rayleigh scattering removes short wavelengths first, so
    // blue goes, then green, and what is left is orange and finally red. Deriving it
    // means the cloud tops, the halo and the horizon glow are all the SAME light -
    // three hand-tuned constant pairs used to approximate this separately, and any
    // change to one left the other two disagreeing with it.
    // The coefficients matter more than the idea. The first numbers were physically
    // enthusiastic and visually wrong in both directions at once: cream cloud tops
    // at NOON (the curve was already reddening at an elevation where sunlight is
    // white) and a blood-red dusk (unclamped air path ran to ~18, which takes the
    // green channel to 3% and leaves pure red). Whiter base, gentler slope, and the
    // path clamped at 9 - which is about what the real atmosphere tops out at.
    float airPath = clamp(1.0 / max(elev * 0.92 + 0.15, 0.06), 1.0, 9.0);
    vec3  sunColor = vec3(1.00, 0.995, 0.985)
                   * exp(-vec3(0.20, 0.46, 1.00) * (airPath - 1.0) * 0.155);
    // the season term survives as a small bias: winter light is pinker, summer's is
    // more orange, which is dust and humidity rather than geometry
    // Brightened by dividing by its own max channel, NOT by multiplying and clamping.
    // Multiplying by 1.28 and clamping drove red AND green to 1.0 and left only blue
    // below - which is yellow-green, and golden hour came out OLIVE. Clipping does
    // not brighten a colour, it destroys its hue: the channel that was carrying the
    // character is the first one to hit the ceiling.
    vec3 goldCol = sunColor / max(max(sunColor.r, max(sunColor.g, sunColor.b)), 0.001);
    goldCol *= mix(vec3(1.0, 0.94, 0.99), vec3(1.0, 0.99, 0.95), summer);
    // Sunset happens in a DIRECTION. This mixed the gold across the entire horizon,
    // so every azimuth burned equally - which is why the sky opposite the sun had
    // nothing to contrast against and the Belt of Venus below could not be seen at
    // all. Concentrated toward the sun's azimuth now, falling to a quarter strength
    // opposite it, which is roughly what the sky does.
    float sunSide = exp(-abs(uv.x - sunPos.x) * 0.80);
#ifdef SKY_WINDOW
    if (u_fovH > 0.0) sunSide = winSide;
#endif
    horiz = mix(horiz, goldCol, golden * mix(0.22, 1.0, sunSide));
    top   = mix(top, vec3(0.30, 0.24, 0.42), golden * 0.6);
    // The zenith-to-horizon fall is NOT linear. Air mass grows roughly as 1/sin of
    // the elevation, so the blue holds most of the upper sky and then washes out
    // fast in the last stretch above the horizon; a straight mix (what this was)
    // puts pale blue halfway up the frame, which is why it read as a gradient
    // rather than as air.
    float airMass = pow(clamp(v_uv.y, 0.0, 1.0), 0.62);
    vec3 sky = mix(horiz, top, airMass);
    // --- how the air scatters, which is what makes a sky look like AIR ---
    // Screen distance from the sun, read as an angle. The frame spans a narrow band
    // of elevation (see the deck projection), so this is approximate by design - it
    // only has to be monotonic and roughly right at the two ends.
    float theta = min(sunD * 1.35, 3.14159);
    float cs = cos(theta);
    // RAYLEIGH PHASE. Molecular scattering goes as (1 + cos^2), so the sky is
    // brightest toward the sun AND toward the point opposite it, and DARKEST at 90
    // degrees from the sun. That band of deepest blue is the thing photographers use
    // a polariser to exaggerate, and its absence is why a flat altitude gradient
    // reads as a painted backdrop: a real sky is not symmetric about the zenith, it
    // is symmetric about the SUN.
    float rayleigh = 0.5 + 0.5 * cs * cs;
    sky *= mix(0.88, 1.08, rayleigh);
    // MIE AUREOLE. Aerosol scattering is not a gaussian - it is a fierce little core
    // a few degrees wide sitting in a broad skirt that falls off about as 1/theta^2
    // and reaches most of the way across the sky. Two exponentials (what this was)
    // give a soft blob with a definite edge, which reads as a lens flare rather than
    // as sunlight in air.
    vec3 haloCol = mix(vec3(1.00, 0.96, 0.88), sunColor, golden * 0.9);
    float mieCore  = exp(-theta * 9.0);
    float mieSkirt = 1.0 / (1.0 + theta * theta * 12.0);
    // The aureole IS the aerosol: a scrubbed sky has a tight bright sun and hard
    // shadows, a hazy one has a huge soft glare you cannot look near. Scaling the
    // skirt by u_haze ties the two together, so a dusty day gets its washed-out sun
    // instead of a clean one wearing a haze filter.
    float skirtGain = mix(0.45, 1.55, clamp(u_haze, 0.0, 1.0));
    sky += haloCol * (mieCore * 0.42 + mieSkirt * 0.26 * skirtGain) * dayAmt
         * (1.0 - gloom * 0.85) * u_glare;
    // --- TWILIGHT, OPPOSITE THE SUN ---
    // For the ~20 minutes after sunset the most interesting half of the sky is the
    // half nobody looks at. The planet's own shadow rises there as a dark blue-grey
    // band, and riding on top of it is the Belt of Venus: a pink arch of sunlight
    // that has been backscattered by air still in daylight higher up. Both fade as
    // the shadow climbs past them. Drawing sunset only on the sun's side is the
    // single most common tell in a fake dusk.
    float tw = smoothstep(0.03, -0.05, elev) * (1.0 - smoothstep(-0.14, -0.30, elev));
    if (tw > 0.005) {
        float antiX = (1.0 - clamp(sunX, 0.0, 1.0)) * aspect;
        float antiW = exp(-abs(uv.x - antiX) * 0.85);       // strongest opposite the sun
#ifdef SKY_WINDOW
        if (u_fovH > 0.0) antiW = winAnti;
#endif
        float belt  = exp(-pow((v_uv.y - 0.20) / 0.13, 2.0));
        vec3  beltCol = mix(vec3(0.95, 0.63, 0.63), vec3(0.93, 0.55, 0.52), summer);
        sky = mix(sky, beltCol, belt * tw * antiW * 0.42);
        float shadow = 1.0 - smoothstep(0.0, 0.13, v_uv.y);  // the planet's shadow, below the belt
        sky = mix(sky, vec3(0.15, 0.17, 0.30), shadow * tw * antiW * 0.55);
    }

    // storm / rain sky loses its blue as well as its light
    vec3 gloomCol = mix(vec3(0.10, 0.11, 0.14), vec3(0.40, 0.42, 0.46), dayAmt);
    sky = mix(sky, gloomCol, gloom * 0.7);

    // atmospheric haze: desaturate + lift toward the horizon
    float hazeAmt = u_haze * (1.0 - 0.7 * clamp(v_uv.y, 0.0, 1.0));
    vec3 hazeCol = mix(vec3(0.70, 0.74, 0.80), vec3(0.86, 0.82, 0.74), dayAmt);
    sky = mix(sky, hazeCol * mix(0.28, 1.0, dayAmt), hazeAmt * 0.6);

    // aurora (night, high latitudes look great) - vertical curtains
    vec3 aurCol = vec3(0.0);
    for (int i = 0; i < 3; i++) {
        float fi = float(i);
        float base = 0.45 + fi * 0.13 + (fbm7(vec2(uv.x * 2.2 + fi * 3.0, u_time * 0.1 + fi)) - 0.5) * 0.5;
        float dband = (v_uv.y - base) * 3.5;
        float band = exp(-dband * dband);
        float streak = 0.5 + 0.5 * fbm(vec2(uv.x * 30.0, v_uv.y * 5.0 - u_time * 0.3));
        vec3 cc = mix(vec3(0.20, 1.0, 0.55), vec3(0.55, 0.30, 1.0), fi * 0.4);
        aurCol += cc * band * streak;
    }
    sky += aurCol * u_aurora * nightAmt * (1.0 - gloom) * 0.5;

    // THE MOON. This breaks the shader's own "no disc" rule, on purpose and only on
    // one side of it: there is no sun disc because you cannot look at the sun - it
    // is a blown-out region of glow, which is what the halo above already draws -
    // but you CAN look at the moon, it is a hard-edged object, and a night sky with
    // no moon in it is missing the brightest thing in the frame.
    // The branch is on tod-derived uniforms, so it is coherent across the draw.
    if (moonUp > 0.01 && nightAmt > 0.01 && moonLit > 0.02) {
        float rM = 0.014;                            // ~2x true angular size, for legibility
#ifdef SKY_WINDOW
        if (u_moonScale > 0.0) rM *= u_moonScale;
#endif
        float disc = smoothstep(rM, rM * 0.62, moonD);
        // maria: the flat grey patches, or the disc reads as a hole punched in the sky
        float mare = fbm3((vec2(uv.x, v_uv.y) - moonPos) / rM * 1.4);
        vec3 moonCol = vec3(1.00, 0.98, 0.93) * (0.86 + 0.28 * mare);
        // THE TERMINATOR. The lit edge of a crescent is an ELLIPSE, not a straight
        // cut: it is the circle of the day/night line seen at an angle, so its
        // half-width shrinks toward the poles of the disc. A straight cut is the
        // giveaway in every hand-drawn moon.
        vec2 md = (vec2(uv.x, v_uv.y) - moonPos) / rM;
        vec2 ax = normalize(sunPos - moonPos + vec2(1e-4));       // sunward across the disc
#ifdef SKY_WINDOW
        // a placed moon brings its own lit side, worked out from the real sun and
        // moon (src/lib/astro.js), since where it sits on the plate is a choice
        if (u_moonReal > 0.0) ax = vec2(cos(u_moonLimb), sin(u_moonLimb));
#endif
        vec2 ay = vec2(-ax.y, ax.x);
        float pxm = dot(md, ax), pym = dot(md, ay);
        float halfW = sqrt(max(1.0 - pym * pym, 0.0));
        float term  = (1.0 - 2.0 * moonLit) * halfW;
        float lit   = smoothstep(term - 0.14, term + 0.14, pxm);
        // earthshine: the dark limb is not black, it is lit by the Earth
        lit = max(lit, 0.055 * (1.0 - moonLit));
        sky += moonCol * disc * lit * nightAmt * moonUp * (1.0 - gloom * 0.9) * 0.95;
        // and the glow it throws into the air around it, which scales with how much
        // of it is actually lit
#ifdef SKY_WINDOW
        float glowK = 1.0 - clamp(u_moonGlowCut, 0.0, 1.0) * smoothstep(rM, rM * 2.5, moonD);
        sky += vec3(0.86, 0.90, 1.0) * exp(-moonD * 13.0) * nightAmt * moonUp
             * moonLit * (1.0 - gloom * 0.8) * 0.24 * glowK;
#else
        sky += vec3(0.86, 0.90, 1.0) * exp(-moonD * 13.0) * nightAmt * moonUp
             * moonLit * (1.0 - gloom * 0.8) * 0.24;
#endif
    }

    // realistic stars: density by u_stars, clearer in winter, dimmed by haze,
    // and gone entirely under cloud - a clear night is the only night with stars
    float starAmt = u_stars * (1.0 - 0.5 * u_haze) * mix(1.15, 0.75, summer) * (1.0 - gloom);
#ifdef SKY_WINDOW
    // a city sky: the glow drowns all but the brightest stars, and the Milky Way
    // (which rides on starAmt below) goes with them
    if (u_skyglow > 0.0) starAmt *= 1.0 - 0.8 * clamp(u_skyglow, 0.0, 1.0);
#endif
    // THE MILKY WAY. An even scatter of stars is a planetarium, not a sky: most of
    // what you can see is in one broad tilted band, unresolved, with dark rifts of
    // dust cutting across it. It does two jobs here - it is a faint glow in its own
    // right, and it is WHERE THE STARS ARE, which is what stops the field reading as
    // wallpaper. Branch is on night/starAmt, both uniform-derived above the cloud
    // work, so it costs nothing by day.
    float mwGlow = 0.0;
    if (nightAmt > 0.01 && starAmt > 0.01) {
        float axis = (v_uv.y - 0.62) * 2.1 - (uv.x - aspect * 0.5) * 0.62;
        float band = exp(-axis * axis * 2.6);
        float dust = fbm(vec2(uv.x * 2.4, v_uv.y * 2.4) + 17.0);   // the rifts
        mwGlow = band * (0.28 + 0.72 * dust);
        sky += vec3(0.70, 0.75, 0.96) * mwGlow * starAmt * nightAmt
             * (1.0 - 0.6 * moonLit * moonUp) * 0.15;
    }
    vec3 stars = starLayer(uv, 60.0, 8.0, 0.11, t) + starLayer(uv + 9.3, 150.0, 4.0, 0.06, t) * 0.35;
    stars *= 1.0 + mwGlow * 1.8;
    // The moon washes the sky out around itself, exactly as a city does: near a full
    // moon you lose everything but the brightest stars. Without this the moon sits in
    // a field of stars it would physically drown.
    stars *= 1.0 - 0.75 * exp(-moonD * 3.2) * moonUp * moonLit * (1.0 - gloom);
    sky += stars * starAmt * nightAmt * smoothstep(0.05, 0.45, v_uv.y);

    // --- HIGH CIRRUS, a second deck above the first ---
    // Real skies are layered: thin ice cloud at 8-12km over whatever is happening at
    // 1-2km, and because the high deck is further away it is FLATTER in perspective,
    // SLOWER across the frame and finer in texture. One altitude was the last thing
    // making this read as a single painted surface.
    // It is drawn into the sky BEFORE the low deck, so low cloud passes in front of
    // it - which is the whole point of having two altitudes.
    // Scaled by how much low cloud there is: a genuinely clear day carries a few
    // wisps, a broken day carries the most (the high deck is what you see THROUGH
    // the gaps), and an overcast day carries none you could ever see. Without this
    // every sky got the same full cirrus sheet, including "Clear".
    float cirAmt = smoothstep(0.86, 0.46, u_cover) * (1.0 - gloom) * (1.0 - wet) * u_cirrus;
    float cir = 0.0;
    // The branch is on UNIFORMS only, so it is coherent across the whole draw - a
    // rain sky genuinely skips this fbm rather than executing both sides of it.
    if (cirAmt > 0.01) {
        float yvH   = max(v_uv.y * 0.42 + 0.92, 0.92);   // barely any foreshortening up there
        vec2  deckH = vec2(uv.x / yvH, 1.0 / yvH);
#ifdef SKY_WINDOW
        if (u_fovH > 0.0) deckH.x = (uv.x - 0.5 * aspect) / yvH;   // centred, as the low deck
#endif
        // anisotropic: cirrus are drawn out into streaks by the wind shear at altitude
        // HIGH CLOUD RIDES A DIFFERENT STREAM. Wind veers with height, so cirrus
        // crosses the low deck at an angle instead of running parallel to it - two
        // decks sliding in lockstep is a quieter version of the same tell as one
        // constant speed. It is also STEADIER: the jet does not gust the way surface
        // wind does, so this drift deliberately does NOT carry the gust term, and
        // the contrast between a pulsing low deck and an even high one is itself
        // something you can see.
        vec2 hiDrift = vec2(t * mix(0.006, 0.038, u_wind), t * mix(0.002, 0.011, u_wind));
#ifdef SKY_WINDOW
        if (u_windDir != 0.0) hiDrift = windRot * hiDrift;   // the veer turns with it
#endif
        vec2  ph = deckH * vec2(2.2, 7.0) + hiDrift;
        // FIBROUS, not billowed. Cirrus is ice falling through a shearing wind, so
        // it is drawn out into strands and hooks - the texture is combed rather than
        // lumpy, and a smoothstep on one fbm gives lumpy. A second, far more
        // anisotropic octave set combs it.
        float fib = fbm3(ph * vec2(0.5, 6.0) + 4.0);
        cir = smoothstep(0.50, 0.80, fbm(ph)) * (0.45 + 0.55 * fib);
    }
    // Sparse by nature, absent under a thick or wet deck (you cannot see 10km up
    // through a rain cloud), and they are the LAST thing the sun leaves - which is
    // why a sunset's best colour is usually up there rather than at the horizon.
    cir *= cirAmt * mix(0.55, 1.0, aer) * 0.62;
    vec3 cirCol = mix(vec3(1.00, 0.99, 0.97), goldCol, golden * 0.9);
    cirCol = mix(cirCol * 0.35, cirCol, dayAmt);      // ice cloud goes grey at night
    sky = mix(sky, cirCol, clamp(cir, 0.0, 1.0));
    // ICE FORWARD-SCATTERS HARDER THAN WATER. A hexagonal crystal throws light
    // forward far more strongly than a droplet does, which is why cirrus within a
    // few degrees of the sun goes white-hot and silvery while the cumulus below it
    // is merely bright - and it is the same property that makes haloes and sun dogs,
    // which this does not attempt. A wider, stronger lobe than the low deck's.
    sky += sunColor * cir * exp(-theta * 2.0) * dayAmt * (1.0 - gloom) * 0.75;

    // --- cloud shading ---
    // Sunlit cloud is lit by the sun, so its colour IS sunColor - reddening on its
    // own as the sun drops, with no separate golden-hour constant to keep in step.
    vec3 lightCol = mix(vec3(0.55, 0.62, 0.80), sunColor, dayAmt);
    // A cloud's shadowed side is not a fixed grey - it is lit by the SKY, which is
    // the only light reaching it. Taking it from the sky value at this pixel means
    // underside goes blue on a clear day, orange under a sunset, grey under an
    // overcast one and near-black at night, all for free, and it can never disagree
    // with the sky it is sitting in front of. Two hand-tuned constants (one for day,
    // one for golden hour) used to approximate that, and they were wrong every time
    // the sky did something the constants had not anticipated.
    vec3 cloudShadow = sky * mix(0.52, 0.80, dayAmt);
#ifdef SKY_WINDOW
    if (u_cuBase.w > 0.0) {
        vec3 lw = vec3(0.2126, 0.7152, 0.0722);
        vec3 baseC = u_cuBase.rgb / max(dot(u_cuBase.rgb, lw), 1e-3) * dot(cloudShadow, lw) * 0.82;
        cloudShadow = mix(cloudShadow, baseC, clamp(u_cuBase.w, 0.0, 1.0));
    }
#endif
    // a floor, so a cloud against a black night sky is still a silhouette rather
    // than a hole
    cloudShadow = max(cloudShadow, vec3(0.045, 0.05, 0.075) * mix(1.0, 2.6, dayAmt));
    vec3 cloudCol = mix(cloudShadow, lightCol, light);
    // TRANSMISSION. Sunlight does not stop at a cloud, it goes THROUGH the thin
    // parts - which is why the edge of a cloud crossing the sun goes incandescent
    // while its core stays grey, and why an overcast sky has a bright patch where
    // the sun is behind it. Falls off exponentially with optical thickness, which
    // is what Beer's law says and what a photograph shows.
    float through = exp(-thickness * 3.4) * fwd;
    cloudCol += sunColor * through * 1.15;
    // and the reverse: deep cloud is darker than its surface shading suggests,
    // because light entering it is scattered many times before it gets back out
    cloudCol *= mix(1.0, 0.86, thickness * (1.0 - fwd) * (1.0 - strat * 0.6));
    cloudCol = mix(cloudCol, mix(vec3(0.16, 0.17, 0.20), vec3(0.44, 0.45, 0.49), dayAmt), gloom * 0.75);
    vec3 color = mix(sky, cloudCol, c);
#ifdef SKY_WINDOW
    // CITY SKYGLOW. A city is lit from below all night and its sky shows it. The
    // clear air carries a dull dome, brightest on the horizon where a line of
    // sight crosses the most lit air: that part ADDS. Cloud is different: at night
    // a city's cloud is lit almost entirely by the city, so its underside TAKES ON
    // the glow's colour rather than being tinted by it, most of all a low thick
    // deck. That is why an overcast city night is orange-grey and never black or
    // blue, and a clear one is only lifted along the horizon. (Adding the glow to
    // the classic night deck, the first version, could only ever make lavender.)
    // The page scales u_skyglow by the real low-cloud fraction; this does the rest.
    if (u_skyglow > 0.0) {
        float glowAmt  = clamp(u_skyglow, 0.0, 1.0) * nightAmt;
        float horizonK = 1.0 - clamp(v_uv.y, 0.0, 1.0);
        color += u_skyglowColor * glowAmt * (0.06 + 0.30 * horizonK * horizonK) * (1.0 - c);
        float under = glowAmt * c * (0.45 + 0.35 * max(strat, gloom));
        color = mix(color, u_skyglowColor * (0.55 + 0.25 * thickness), clamp(under, 0.0, 0.85));
    }
#endif

    // CREPUSCULAR RAYS: TRIED AND CUT, four formulations, kept as a record so the
    // next person does not spend the afternoon I did.
    //   1. Sample the cloud field on a ring near the sun (physically the right idea:
    //      whatever sits there is what blocks that angle). The field varies as slowly
    //      in angle as the cloud does, so it gives a handful of broad wedges that
    //      read as uneven exposure, not as beams.
    //   2. Strengthen and sharpen it. Same wedges, now obvious.
    //   3. Put the noise in the polar ANGLE instead, which is where shafts actually
    //      have their frequency. Legible at last - and immediately wrong: hard
    //      straight spokes painted over the clouds, a starburst filter.
    //   4. Mask by (1 - c) so beams only live in the gaps (correct - a shaft is light
    //      scattering off air, not a stripe on the cloud in front of it), soften,
    //      shorten. Artefacts gone, and with them the effect: at a strength where
    //      nothing looks fake it is indistinguishable from the aureole already there.
    // A term that costs an fbm and either reads as fake or does not read at all is
    // not worth keeping, so it is gone. Worth revisiting only with a real march of
    // 6-8 samples toward the sun, which this shader cannot afford as a background.

    // silver / gold lining on thin edges (a storm deck has none)
#ifdef SKY_WINDOW
    // the lining follows the band's threshold (no rims round cloud it removed)
    float covR = u_cover + bandLift / 0.90;
    float rim = smoothstep(covR - 0.05, covR + 0.10, density) * (1.0 - c) * light;
#else
    float rim = smoothstep(u_cover - 0.05, u_cover + 0.10, density) * (1.0 - c) * light;
#endif
    color += mix(mix(vec3(0.40, 0.45, 0.60), vec3(1.0, 0.97, 0.9), dayAmt), goldCol, golden)
           * rim * 0.6 * (1.0 - gloom);

    // --- lightning: a bright wash from a random top corner, twice per strike ---
#ifdef SKY_WINDOW
    if (u_storm > 0.001 && u_plateOnly < 0.5) {   // a backdrop leaves timing to its page
#else
    if (u_storm > 0.001) {
#endif
        // +0.4 so the cycle does NOT start on a strike: every canvas begins at
        // t=0, and without the offset a storm sky opened with a full-brightness
        // flash frozen in the first frame (caught red-handed in the /sky sheet).
        float cyc = t * 0.11 + 0.4;               // one candidate strike every ~9s
        float slot = floor(cyc);
        float ph = fract(cyc);
        float fires = step(1.0 - u_storm, hash(vec2(slot, 3.7)));   // storminess = how often it fires
        float main_ = exp(-ph * 26.0);
        float echo = exp(-max(ph - 0.055, 0.0) * 34.0) * 0.55;      // the second, weaker beat
        float flash = fires * max(main_, echo) * (0.75 + 0.25 * sin(t * 120.0));
        float fx = hash(vec2(slot, 8.1));                            // where in the sky it lit up
        float fall = 1.0 - smoothstep(0.0, 1.4, distance(vec2(uv.x, v_uv.y), vec2(fx * aspect, 1.05)));
        color += vec3(0.85, 0.88, 1.0) * flash * fall * 1.6;
    }
#ifdef SKY_WINDOW
    // A flash the PAGE decided: the same wash from the same height, so the sky,
    // the room and the window frame all light on one frame.
    if (u_flash > 0.0) {
        float fallP = 1.0 - smoothstep(0.0, 1.4, distance(vec2(uv.x, v_uv.y), vec2(u_flashX * aspect, 1.05)));
        color += vec3(0.85, 0.88, 1.0) * u_flash * fallP * 1.6;
    }
#endif

    // --- precipitation: rain -> sleet -> snow, three parallax sheets ---
#ifdef SKY_WINDOW
    if (wet > 0.001 && u_plateOnly < 0.5) {   // a 3D scene draws rain in front of its trees
#else
    if (wet > 0.001) {
#endif
        float snowy = clamp(u_kind, 0.0, 1.0);
        // rain leans harder in a gust and stands up in a lull, which is the most
        // legible sign of wind there is when you cannot see the trees
        float slant = mix(0.10, 0.55, u_wind) * clamp(gustNow, 0.35, 1.75);
#ifdef SKY_WINDOW
        // the lean follows the turned wind's sideways part (none when it blows
        // straight toward or away from the viewer)
        if (u_windDir != 0.0) slant *= cos(u_windDir);
#endif
        float fill = mix(0.10, 0.85, wet);         // intensity = how many drops, not how bright
        // Three depths, and they differ in every property at once - near rain is
        // longer, thicker, faster, brighter and sparser on screen; far rain is a
        // fine grey fuzz. Varying only the density (the first pass) gives three
        // copies of one sheet, which the eye reads as a moire, not as depth.
        // Near rain is longer, thicker, faster and brighter; far rain is a fine
        // grey fuzz. Sizes in pixels (see rainSheet): 22px x 1.6px is a raindrop
        // photographed at a normal shutter, and the earlier 4px-wide sticks were
        // the whole reason this read as falling sparks rather than weather.
        // The weights carry the drops through the home band's treatment (the sky
        // is held at half opacity under a scrim there, and hairline rain at the
        // lab's weights vanished completely in it).
        // Both sides used to be evaluated on every pixel and then mixed, so a rain
        // sky paid for three snow sheets it discarded and a snow sky paid for three
        // rain sheets. u_kind is a uniform, so these branches are coherent across
        // the whole draw - only a sky mid-transition between rain and snow pays for
        // both, which is the two seconds the ease takes.
        float r = 0.0, s = 0.0;
        if (snowy < 0.995) {
            r = rainSheet(uv,       16.0, 4.2, slant,        fill,        22.0, 1.6, t) * 0.42
              + rainSheet(uv + 4.0, 26.0, 3.0, slant * 0.85, fill * 0.9,  15.0, 1.3, t) * 0.28
              + rainSheet(uv + 8.0, 40.0, 2.1, slant * 0.7,  fill * 0.95, 10.0, 1.0, t) * 0.18;
        }
        if (snowy > 0.005) {
            s = snowSheet(uv, 22.0, 0.55, fill * 0.9, t) * 0.45
              + snowSheet(uv + 3.0, 14.0, 0.34, fill * 0.7, t) * 0.65
              + snowSheet(uv + 7.0, 8.0, 0.20, fill * 0.5, t) * 0.90;
        }
        float amount = mix(r, s, snowy);
        // Drops are lit by whatever is lighting the sky, so their colour comes from
        // the backdrop rather than from a constant: warm through a sunset, grey under
        // an overcast deck, and nearly invisible at night - which is exactly right,
        // since you cannot see rain at night except against a light. The old fixed
        // white-blue glowed faintly in the dark, the one thing rain never does.
        vec3 dropCol = mix(vec3(0.86, 0.90, 0.97), vec3(1.0, 1.0, 1.0), snowy);
        dropCol *= 0.32 + 0.85 * color;
        // rain reads as a lighter-than-sky streak by day and a darker one against a
        // bright deck; a straight add is close enough and never blows out. Kept
        // deliberately faint - rain you can READ individual drops in is rain drawn
        // on top of a sky rather than falling through it.
        color += dropCol * amount * mix(0.34, 0.55, dayAmt) * (0.35 + 0.65 * wet);
    }

    // --- ground fog: a soft drifting bank rising from the bottom edge ---
#ifdef SKY_WINDOW
    if (u_fog > 0.001 && u_plateOnly < 0.5) {
#else
    if (u_fog > 0.001) {
#endif
        // Reaches well past the top of the frame at full strength: a fog day is
        // not a bank at your feet, it is the sky ITSELF gone. At the first
        // numbers this read as light haze and was indistinguishable from
        // overcast in the /sky sheet.
        float bank = 1.0 - smoothstep(0.0, mix(0.45, 1.6, u_fog), v_uv.y);
        float body = 0.55 + 0.45 * fbm(vec2(uv.x * 1.6 + t * 0.02, v_uv.y * 2.2 + t * 0.015));
        vec3 fogCol = mix(vec3(0.20, 0.22, 0.26), vec3(0.86, 0.88, 0.90), dayAmt);
        color = mix(color, fogCol, clamp(bank * body * (0.35 + 0.65 * u_fog), 0.0, 1.0) * 0.96);
    }

    // --- grade: exposure, highlight rolloff, tint, dither ---
    color *= u_exposure;
    // Saturation last, against the frame's own luminance, so 0 gives a true
    // greyscale sky rather than a desaturated-looking colour cast.
    float lum = dot(color, vec3(0.2126, 0.7152, 0.0722));
    color = mix(vec3(lum), color, u_sat);
    // Everything bright in a real photograph rolls off rather than stopping: the
    // sun's core, the moon's disc and a sunlit cloud top all approach white through
    // a gradient. Straight clipping (what this did) puts a hard flat-white plateau
    // where the gradient should be - visible as a shape with an EDGE around the sun
    // and a paper cut-out moon. Midtones are untouched by construction; only the top
    // fifth is compressed, so nothing else in the frame shifts.
    vec3 hi = max(color - 0.80, 0.0);
    color = min(color, vec3(0.80)) + hi / (1.0 + hi * 1.35);
    color *= u_tint;
    color += (hash(gl_FragCoord.xy + t) - 0.5) / 255.0;
#ifdef SKY_WINDOW
    // the plate's own cloud cover, for the page's grade (skyPlate.js, light/grade.js):
    // alpha = 1 - 0.25 c, so clear sky keeps alpha 1 and loses no precision
    gl_FragColor = vec4(color, 1.0 - 0.25 * clamp(c, 0.0, 1.0));
#else
    gl_FragColor = vec4(color, 1.0);
#endif
}
`;

export const WASHES = {
  clouds: CLOUDS,
  livingSky: LIVING_SKY,
  golden: GOLDEN_HOUR,
  iridescent: IRIDESCENT_WISP,
  aurora: AURORA,
  mesh: MESH_GRADIENT,
  chrome: LIQUID_CHROME,
  caustics: CAUSTICS,
  quilt: QUILT,
};

export const SHADER_LIST = [
  { key: "livingSky", name: "Living Sky", group: "Sky" },
  { key: "clouds", name: "Cloud Sky", group: "Sky" },
  { key: "golden", name: "Golden Hour", group: "Sky" },
  { key: "aurora", name: "Aurora", group: "Sky" },
  { key: "mesh", name: "Mesh Gradient", group: "Gradient" },
  { key: "quilt", name: "Quilt", group: "Surface" },
  { key: "iridescent", name: "Iridescent Wisp", group: "Glow" },
  { key: "chrome", name: "Liquid Chrome", group: "Metal" },
  { key: "caustics", name: "Caustics", group: "Water" },
];

// The Living Sky's own parameter set, from the `// param` header of the preset.
// Anything omitted here resolves to 0 in GL, and for this shader that is a black
// frame, so this is not a convenience — it is required.
//
// `u_tod` is deliberately absent: ShaderCanvas drives it from the real clock when
// given `clock`, which is what makes the sky living rather than a picture.
export const LIVING_SKY_DEFAULTS = {
  u_cycle: 0,        // 0 = do not fast-forward the clock; real time drives it
  u_season: 0.5,
  u_latitude: 0.5,
  u_cover: 0.52,
  u_softness: 0.4,
  u_wind: 0.4,
  u_haze: 0.35,
  u_stars: 0.8,
  u_aurora: 0,
  u_precip: 0,       // 0 = dry; weather.js raises it for drizzle .. downpour
  u_kind: 0,         // 0 rain · 0.5 sleet/freezing · 1 snow
  u_fog: 0,
  u_storm: 0,        // gloom + lightning frequency
  // --- look controls (added as parameters, previously hard-coded constants) ---
  u_scale: 3.0,      // deck sampling scale: bigger number, smaller clouds
  u_persp: 1.0,      // 1 = deck in perspective, 0 = flat field
  u_cirrus: 1.0,     // high-cloud amount on top of what cover implies
  u_gust: 0.30,      // gust amplitude as a fraction of mean wind
  u_evolve: 1.0,     // how fast cloud shapes form and dissipate
  u_glare: 1.0,      // aureole strength around the sun
  u_moonph: 0.5,     // 0 new · 0.5 full · 1 new again (the page sets it from the date)
  u_sat: 1.0,        // final saturation
  u_sunReal: 0,      // 0 = shader's own time-of-day sun; the home page sets 1
  u_sunElev: 0,
  u_sunAz: 0.5,
  u_exposure: 1.0,
  u_tint: [1, 1, 1],
};
