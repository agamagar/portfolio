// name: Nebula
// group: Volumetric
// param float u_density "Density" 0.3 1.6 0.85
// param float u_glow    "Glow"    0.0 2.0 1.00
// param float u_flow    "Flow"    0.0 1.0 0.35
//
// Raymarched emissive gas cloud (on the Volumetric Smoke engine): domain-warped 3D
// fbm density, self-emission tinted magenta <-> cyan with gold veins + a soft key
// light, over a twinkling star field. medium+light; ACES + vignette + dither, highp.
precision highp float;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_dark;
uniform float u_density;
uniform float u_glow;
uniform float u_flow;
varying vec2 v_uv;

float h31(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float n3(vec3 x) {
    vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(h31(i + vec3(0,0,0)), h31(i + vec3(1,0,0)), f.x),
                   mix(h31(i + vec3(0,1,0)), h31(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(h31(i + vec3(0,0,1)), h31(i + vec3(1,0,1)), f.x),
                   mix(h31(i + vec3(0,1,1)), h31(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm3(vec3 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * n3(p); p *= 2.03; a *= 0.5; } return v; }

float dens(vec3 p) {
    vec3 q = p + 0.6 * (fbm3(p * 0.5 + u_time * 0.03 * u_flow) - 0.5); // slow drift/warp
    float env = smoothstep(2.6, 0.3, length(p * vec3(0.75, 0.75, 0.6)));
    float d = fbm3(q * 0.95) * 1.7 - 0.55;
    return clamp(d, 0.0, 1.0) * env * u_density;
}
vec3 emit(vec3 p) {
    float m = fbm3(p * 0.7 + 11.0);
    vec3 c = mix(vec3(0.85, 0.15, 0.55), vec3(0.15, 0.50, 1.00), m);          // magenta <-> cyan
    c += vec3(0.55, 0.38, 0.06) * smoothstep(0.55, 0.92, fbm3(p * 1.4 - 5.0)); // gold veins
    return c;
}
vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }

void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv = (v_uv * 2.0 - 1.0); uv.x *= aspect;

    float yaw = (u_mouse.x - 0.5) * 0.6;
    float cy = cos(yaw), sy = sin(yaw);
    mat3 rotY = mat3(cy, 0.0, sy, 0.0, 1.0, 0.0, -sy, 0.0, cy);
    vec3 ro = rotY * vec3(0.0, 0.0, -3.8);
    vec3 rd = rotY * normalize(vec3(uv, 1.6));
    vec3 L = normalize(vec3(0.5, 0.7, -0.4));

    float t = 1.4, T = 1.0; vec3 C = vec3(0.0);
    for (int i = 0; i < 38; i++) {
        vec3 p = ro + rd * t;
        float d = dens(p);
        if (d > 0.01) {
            float sh = 0.0;
            for (int j = 0; j < 3; j++) sh += dens(p + L * (0.16 * float(j + 1)));
            float lt = exp(-sh * 0.8);
            vec3 col = emit(p) * u_glow + mix(vec3(0.10, 0.10, 0.16), vec3(1.0, 0.95, 0.9), lt) * 0.25;
            float a = d * 0.16;
            C += T * a * col; T *= (1.0 - a);
            if (T < 0.03) break;
        }
        t += 0.13;
    }

    // deep-space backdrop + star field behind the gas
    vec3 bg = mix(vec3(0.015, 0.02, 0.045), vec3(0.05, 0.06, 0.10), v_uv.y);
    bg = mix(bg * 1.6, bg, u_dark);
    float star = smoothstep(0.985, 1.0, h31(vec3(floor(gl_FragCoord.xy), 1.0)));
    bg += vec3(star) * (0.5 + 0.5 * sin(u_time * 2.0 + gl_FragCoord.x));
    vec3 col = C + bg * T;

    col = aces(col * 1.15);
    col *= 1.0 - 0.30 * dot(uv, uv) * 0.5;
    col += (h31(vec3(gl_FragCoord.xy, u_time)) - 0.5) / 255.0;
    gl_FragColor = vec4(col, 1.0);
}
