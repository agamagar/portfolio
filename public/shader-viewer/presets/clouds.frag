// name: Clouds
// group: Sky
precision mediump float;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_dark;      // 0 = full colour, 1 = dark variant
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

    vec2 p = uv * 3.0 + mouse;

    float density = cloudDensity(p, t);

    // coverage threshold -> distinct clouds with clear blue gaps
    float coverage = 0.52;
    float c = smoothstep(coverage, coverage + 0.30, density);
    c = pow(c, 1.3);

    // fake volumetric lighting: sample density toward the sun
    vec2 sunDir = normalize(vec2(0.45, 0.55));
    float dHere = density;
    float dSun  = cloudDensity(p + sunDir * 0.10, t);
    float light = clamp((dHere - dSun) * 3.5 + 0.55, 0.0, 1.0);

    vec3 skyTop    = mix(vec3(0.20, 0.46, 0.82), vec3(0.02, 0.05, 0.12), u_dark);
    vec3 skyHoriz  = mix(vec3(0.66, 0.80, 0.93), vec3(0.06, 0.10, 0.18), u_dark);
    vec3 sky = mix(skyHoriz, skyTop, clamp(v_uv.y, 0.0, 1.0));

    vec3 cloudShadow = mix(vec3(0.55, 0.60, 0.70), vec3(0.08, 0.10, 0.15), u_dark);
    vec3 cloudLit    = mix(vec3(1.00, 0.99, 0.97), vec3(0.32, 0.36, 0.44), u_dark);
    vec3 cloudCol = mix(cloudShadow, cloudLit, light);

    vec3 color = mix(sky, cloudCol, c);

    float rim = smoothstep(coverage - 0.05, coverage + 0.10, density) * (1.0 - c) * light;
    color += mix(vec3(1.0, 0.97, 0.9), vec3(0.4, 0.45, 0.6), u_dark) * rim * 0.6;

    vec2 sunPos = vec2(0.7, 0.8);
    sunPos.x *= u_resolution.x / u_resolution.y;
    float glow = 1.0 - smoothstep(0.0, 1.2, length(uv - sunPos));
    color += mix(vec3(1.0, 0.85, 0.6), vec3(0.25, 0.32, 0.5), u_dark) * glow * 0.15 * (1.0 - c);

    gl_FragColor = vec4(color, 1.0);
}
