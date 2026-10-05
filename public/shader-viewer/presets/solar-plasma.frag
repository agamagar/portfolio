// name: Solar Plasma
// group: Volumetric
// param float u_turb "Turbulence" 0.0 1.0 0.60
// param float u_heat "Heat"       0.0 1.0 0.55
// param float u_flow "Flow"       0.0 1.0 0.40
//
// A churning star surface: domain-warped fbm granulation evolving in time, mapped
// through a blackbody-ish ramp (deep red -> orange -> yellow -> white) with dark
// convection lanes, ridged flares, and limb darkening. medium+light (continuous
// emissive medium, no shapes); ACES + dither, highp, safe pow.
precision highp float;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_dark;
uniform float u_turb;
uniform float u_heat;
uniform float u_flow;
varying vec2 v_uv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float v = 0.0, a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 6; i++) { v += a * noise(p); p = m * p; a *= 0.5; } return v; }
vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }

void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = (v_uv - 0.5); p.x *= aspect; p *= 3.0;
    float t = u_time * 0.15 * u_flow;

    // churn: time-evolving domain warp
    vec2 w = vec2(fbm(p * 1.5 + vec2(0.0, t)), fbm(p * 1.5 + vec2(3.7, -t))) - 0.5;
    vec2 q = p + w * (0.6 + 0.8 * u_turb);
    float gran = fbm(q * 2.5 + t * 0.5);            // granulation cells
    float fine = fbm(q * 6.0 - t * 0.8);            // fine flicker
    float heat = 0.7 * gran + 0.3 * fine;
    heat = pow(clamp(heat, 0.0, 1.0), mix(1.6, 0.8, u_heat)); // heat curve, base clamped

    // blackbody-ish emission ramp
    vec3 col = vec3(0.0);
    col += vec3(0.55, 0.05, 0.00) * smoothstep(0.00, 0.40, heat);
    col += vec3(0.80, 0.35, 0.00) * smoothstep(0.25, 0.70, heat);
    col += vec3(1.00, 0.85, 0.40) * smoothstep(0.55, 0.95, heat);
    col += vec3(1.00, 1.00, 0.95) * smoothstep(0.85, 1.00, heat);
    col *= 0.5 + 0.7 * gran;                         // dark convection lanes

    // ridged flares licking off the hotter granules
    float flare = pow(clamp(1.0 - abs(fine - 0.6) * 3.0, 0.0, 1.0), 3.0) * smoothstep(0.5, 0.9, gran);
    col += vec3(1.0, 0.7, 0.3) * flare * 0.6;

    col = mix(col, col * vec3(0.72, 0.80, 1.0) * 0.85, u_dark); // dark theme = cooler, dimmer star
    vec2 vg = (v_uv - 0.5) * 2.0; col *= 1.0 - 0.35 * dot(vg, vg); // limb darkening

    col = aces(col * 1.2);
    col += (hash(gl_FragCoord.xy + t) - 0.5) / 255.0;
    gl_FragColor = vec4(col, 1.0);
}
