// name: Quilt
// group: Surface
// param float u_scale    "Tile size"   3.0 16.0 8.0
// param float u_relief   "Relief"      0.0  1.0 0.6
// param float u_contrast "Contrast"    0.0  0.6 0.15
// param float u_spin     "Light spin"  0.0  1.0 0.25
//
// A running-bond grid of soft embossed rounded tiles, lit by a slowly rotating
// raking light so only the rounded rims shade while the centres stay flat.
// High-key near-white by day, charcoal quilt by night. Height field -> normal
// from the gradient -> directional light + soft AO in the grooves.
// NOTE: this is deliberately a "shapes" piece (a lattice), counter to the house
// "medium + light, not shapes" standard; kept because it reproduces a specific
// reference. Safe pow (clamped base), highp, dithered.
precision highp float;

uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_dark;
uniform float u_scale;
uniform float u_relief;
uniform float u_contrast;
uniform float u_spin;
varying vec2 v_uv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

// signed distance to a rounded box centred at the origin
float sdRoundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

// height of the quilted surface at aspect-corrected point p (in tile units)
float quilt(vec2 p) {
    p.x += 0.5 * mod(floor(p.y), 2.0);          // running-bond: offset alt rows
    vec2 id = floor(p);
    vec2 g = fract(p) - 0.5;
    float rad = 0.26 + 0.08 * hash(id);         // slight per-tile corner variation
    float d = sdRoundBox(g, vec2(0.44), rad);
    float h = 1.0 - smoothstep(-0.22, 0.04, d); // wide bevel -> puffy dome
    return h * h * (3.0 - 2.0 * h);             // smooth the shoulders
}

void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = vec2(v_uv.x * aspect, v_uv.y) * u_scale;

    // surface normal from central differences of the height field
    float e = 0.05;
    float hx = quilt(p + vec2(e, 0.0)) - quilt(p - vec2(e, 0.0));
    float hy = quilt(p + vec2(0.0, e)) - quilt(p - vec2(0.0, e));
    float h  = quilt(p);
    float z  = mix(2.4, 0.6, u_relief);         // smaller z = deeper relief
    vec3 n = normalize(vec3(-hx, -hy, z));

    // slowly rotating raking light + a soft specular sheen
    float a = u_time * u_spin;
    vec3 L = normalize(vec3(cos(a) * 0.85, sin(a) * 0.85, 0.6));
    vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
    float diff = clamp(dot(n, L), 0.0, 1.0);
    float spec = pow(clamp(dot(n, H), 0.0, 1.0), 22.0);  // base clamped >= 0
    float ao = mix(mix(0.90, 0.70, u_dark), 1.0, h);     // grooves sit in shadow

    // high-key near-white by day, charcoal quilt by night
    vec3 base = mix(vec3(0.965, 0.965, 0.97), vec3(0.115, 0.12, 0.135), u_dark);
    float shade = mix(u_contrast, 0.55, u_dark);         // shading depth per theme
    vec3 col = base * (1.0 - shade + shade * diff) * ao;
    col += spec * mix(0.10, 0.35, u_dark);

    col += (hash(gl_FragCoord.xy) - 0.5) * 0.010;        // dither out banding
    gl_FragColor = vec4(col, 1.0);
}
