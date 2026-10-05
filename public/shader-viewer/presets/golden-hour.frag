// name: Golden Hour
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
