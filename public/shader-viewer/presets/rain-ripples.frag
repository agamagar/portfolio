// name: Rain Ripples
// group: Water
precision highp float;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_dark;      // 0 = teal water, 1 = near-black water (dark variant)
varying vec2 v_uv;

float hash1(float n) {
    return fract(sin(n) * 43758.5453123);
}

// Grid-free rain: a fixed pool of drop emitters scattered across the whole
// surface. Each emitter re-spawns at a new random position every `period`
// seconds; its drop is an expanding ring (gaussian shell around a growing
// radius) carrying a ripple wave that fades over its short life. No floor()
// cells, so there's no square tiling.
float dropsField(vec2 p, float t) {
    float aspect = u_resolution.x / u_resolution.y;
    float h = 0.0;
    for (int i = 0; i < 48; i++) {
        float fi = float(i);
        float period = 2.6 + hash1(fi * 1.7) * 3.0;     // this emitter's cadence
        float ph = hash1(fi * 2.3) * period;            // staggered start
        float cyc = floor((t + ph) / period);           // which drop we're on
        float lt = mod(t + ph, period);                 // time since this drop
        // fresh random position each cycle, spread across the full frame
        vec2 pos = vec2(hash1(fi * 3.1 + cyc * 7.13) * aspect,
                        hash1(fi * 5.7 + cyc * 4.27));
        float d = length(p - pos);
        float radius = lt * 0.16;                        // ring expansion speed (slow)
        float env = exp(-70.0 * (d - radius) * (d - radius)); // narrow ring shell
        float decay = exp(-1.3 * lt);                    // slow fade → ripples linger
        float wave = sin(d * 55.0 - lt * 11.0);          // slow ripple propagation
        h += wave * env * decay;
    }
    return h;
}

void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = v_uv;
    p.x *= aspect;
    float t = u_time;

    // a ripple that follows the pointer, like a fingertip on the surface
    vec2 mp = u_mouse;
    mp.x *= aspect;
    float md = length(p - mp);
    float mAmp = exp(-6.0 * md) * 0.8;
    float mC = sin(md * 55.0 - t * 6.0) * mAmp;
    float mX = sin(length(p + vec2(0.0016, 0.0) - mp) * 55.0 - t * 6.0) * mAmp;
    float mY = sin(length(p + vec2(0.0, 0.0016) - mp) * 55.0 - t * 6.0) * mAmp;

    // sample the height field at three points to build a surface normal
    float e = 0.0016;
    float hC = dropsField(p, t) + mC;
    float hX = dropsField(p + vec2(e, 0.0), t) + mX;
    float hY = dropsField(p + vec2(0.0, e), t) + mY;

    // gradient → normal (xy scaled so the water stays gently sloped)
    vec3 n = normalize(vec3(-(hX - hC) / e * 0.015,
                            -(hY - hC) / e * 0.015,
                            1.0));

    // top-down lighting
    vec3 L = normalize(vec3(0.4, 0.55, 0.72));
    vec3 V = vec3(0.0, 0.0, 1.0);
    vec3 H = normalize(L + V);
    float diff = clamp(dot(n, L), 0.0, 1.0);
    float spec = pow(clamp(dot(n, H), 0.0, 1.0), 80.0);

    // dark water base; ripple crests show as bright specular rings
    vec3 deep    = mix(vec3(0.015, 0.06, 0.085), vec3(0.004, 0.018, 0.028), u_dark);
    vec3 shallow = mix(vec3(0.04, 0.16, 0.20), vec3(0.012, 0.055, 0.075), u_dark);
    vec3 color = mix(deep, shallow, diff * diff);
    color += spec * mix(vec3(0.85, 0.93, 1.0), vec3(0.45, 0.55, 0.72), u_dark);
    color += mix(vec3(0.01, 0.03, 0.05), vec3(0.003, 0.009, 0.016), u_dark); // faint cool ambient

    gl_FragColor = vec4(color, 1.0);
}
