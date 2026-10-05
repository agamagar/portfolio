// name: Volumetric Smoke
// group: Volumetric
// Raymarched 3D smoke: density field marched front-to-back with a secondary light
// march for soft self-shadowing (Beer-Lambert), filmic tonemap + dither.
precision highp float;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_dark;
varying vec2 v_uv;

// --- 3D value noise / fbm ---
float h31(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float n3(vec3 x) {
    vec3 i = floor(x), f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(h31(i + vec3(0,0,0)), h31(i + vec3(1,0,0)), f.x),
                   mix(h31(i + vec3(0,1,0)), h31(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(h31(i + vec3(0,0,1)), h31(i + vec3(1,0,1)), f.x),
                   mix(h31(i + vec3(0,1,1)), h31(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm3(vec3 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * n3(p); p *= 2.02; a *= 0.5; }
    return v;
}

// smoke density within a soft ellipsoid envelope; rises and breathes over time
float dens(vec3 p) {
    vec3 q = p;
    q.y -= u_time * 0.18;                       // buoyant rise
    q += 0.4 * (fbm3(q * 0.6 + u_time * 0.05) - 0.5); // large-scale drift
    float env = 1.0 - length(p * vec3(0.7, 0.55, 0.7)); // soft containment
    float d = env + (fbm3(q * 1.3) - 0.5) * 1.9;
    return clamp(d, 0.0, 1.0);
}

vec3 aces(vec3 x) {
    return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv = (v_uv * 2.0 - 1.0); uv.x *= aspect;

    // camera with gentle pointer-driven yaw
    float yaw = (u_mouse.x - 0.5) * 0.7;
    float cy = cos(yaw), sy = sin(yaw);
    mat3 rotY = mat3(cy, 0.0, sy, 0.0, 1.0, 0.0, -sy, 0.0, cy);
    vec3 ro = rotY * vec3(0.0, 0.0, -3.6);
    vec3 rd = rotY * normalize(vec3(uv, 1.6));

    // single key light
    vec3 L = normalize(vec3(0.6, 0.85, -0.25));
    vec3 sunCol    = mix(vec3(1.0, 0.86, 0.66), vec3(0.78, 0.85, 1.0), u_dark);
    vec3 shadowCol = mix(vec3(0.20, 0.23, 0.30), vec3(0.05, 0.06, 0.10), u_dark);

    // front-to-back volumetric integration
    float t = 1.6, T = 1.0;
    vec3 C = vec3(0.0);
    for (int i = 0; i < 34; i++) {
        vec3 p = ro + rd * t;
        float d = dens(p);
        if (d > 0.01) {
            float sh = 0.0;
            for (int j = 0; j < 4; j++) sh += dens(p + L * (0.12 * float(j + 1)));
            float lt = exp(-sh * 0.85);                 // Beer-Lambert self-shadow
            vec3 lit = mix(shadowCol, sunCol, lt);
            float a = d * 0.18;
            C += T * a * lit;
            T *= (1.0 - a);
            if (T < 0.03) break;
        }
        t += 0.14;
    }

    // dark studio backdrop behind the smoke
    vec3 bg = mix(vec3(0.04, 0.05, 0.07), vec3(0.10, 0.11, 0.14), v_uv.y);
    bg = mix(bg, bg * 0.4, u_dark);
    vec3 col = C + bg * T;

    // grade: filmic tonemap + vignette + dither
    col = aces(col * 1.1);
    col *= 1.0 - 0.28 * dot(uv, uv) * 0.4;
    col += (h31(vec3(gl_FragCoord.xy, u_time)) - 0.5) / 255.0;

    gl_FragColor = vec4(col, 1.0);
}
