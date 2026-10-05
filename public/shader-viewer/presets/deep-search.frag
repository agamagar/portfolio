// name: Deep Search
// group: Away
// param float u_energy "Energy" 0.0 1.0 0.55
// param float u_warmth "Warmth" 0.0 1.0 0.35
// param float u_grain  "Grain"  0.0 1.0 0.30
//
// Away's "activating your concierge / negotiating" wait as a moving image: the agent
// fans out across many sources at once. A bright core (the agent) throws luminous
// search currents outward through a curl-warped field, with expanding search pings
// and warm "hits" where a current lands a fare. Cool + calm at low Energy, faster and
// busier as it climbs; Warmth dials searching-blue -> found-gold. medium+light
// (continuous curl-flow medium, no drawn lines), ACES + vignette + dither, highp.
precision highp float;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_dark;
uniform float u_energy;
uniform float u_warmth;
uniform float u_grain;
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
    vec2 c = (v_uv - 0.5); c.x *= aspect;
    float t = u_time * (0.3 + 0.9 * u_energy);

    float r = length(c);
    float ang = atan(c.y, c.x);

    // curl-warp the polar field so the currents wander instead of firing straight
    vec2 warp = vec2(fbm(c * 2.5 + t * 0.10), fbm(c * 2.5 + 5.0 - t * 0.10)) - 0.5;
    float rr = r + dot(warp, c / max(r, 0.001)) * 0.15;
    float aa = ang + (fbm(c * 2.0 - t * 0.05) - 0.5) * 1.2 + t * 0.05; // fan wobble + slow drift

    // radial currents streaming outward from the core (search fanning out)
    float streams = fbm(vec2(aa * 3.0, rr * 6.0 - t * 1.5));
    streams = smoothstep(0.48, 0.92, streams);
    float reach = 0.3 + exp(-rr * 1.2);           // stronger near the agent, still reaches far
    float field = streams * reach;

    // expanding search pings + the bright agent core
    float ping = smoothstep(0.6, 1.0, sin(rr * 9.0 - t * 2.5)) * exp(-rr * 1.6);
    float core = exp(-r * 8.0);

    // warm "hits": a strong current landing out in the field
    float hit = smoothstep(0.78, 1.0, streams) * smoothstep(0.18, 0.6, rr) * (0.5 + 0.5 * sin(t * 3.0 + aa * 10.0));

    vec3 cool = vec3(0.20, 0.50, 1.00);
    vec3 warm = vec3(1.00, 0.70, 0.32);
    vec3 base = mix(cool, warm, u_warmth);

    vec3 bg = mix(vec3(0.020, 0.030, 0.060), vec3(0.005, 0.008, 0.020), u_dark);
    vec3 col = bg;
    col += base * field * 1.3;
    col += base * ping * 0.40;
    col += warm * hit * 0.85;
    col += vec3(1.0, 0.96, 0.9) * core;

    col = aces(col * 1.3);
    vec2 vg = (v_uv - 0.5) * 2.0; col *= 1.0 - 0.28 * dot(vg, vg);
    col += (hash(gl_FragCoord.xy + t) - 0.5) * (0.02 + 0.05 * u_grain); // dither + grain
    gl_FragColor = vec4(col, 1.0);
}
