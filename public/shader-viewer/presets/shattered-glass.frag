// name: Shattered Glass
// group: Glass
precision highp float;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_dark;
uniform sampler2D u_image;
uniform float u_hasImage;
uniform vec2 u_imageRes;
varying vec2 v_uv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

vec2 coverUV(vec2 uv) {
    float ca = u_resolution.x / u_resolution.y, ia = u_imageRes.x / u_imageRes.y;
    vec2 s = uv;
    if (ca > ia) s.y = (uv.y - 0.5) * (ia / ca) + 0.5;
    else         s.x = (uv.x - 0.5) * (ca / ia) + 0.5;
    return s;
}
vec3 srcColor(vec2 uv) {
    if (u_hasImage < 0.5) return vec3(0.0);
    vec2 s = coverUV(uv);
    if (s.x < 0.0 || s.x > 1.0 || s.y < 0.0 || s.y > 1.0) return vec3(0.0);
    return texture2D(u_image, s).rgb;
}

void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv = v_uv;
    float t = u_time;

    // voronoi shards — each facet refracts the image with its own offset, edges catch light
    vec2 p = uv * vec2(aspect, 1.0) * 6.0;
    vec2 g = floor(p), f = fract(p);
    float best = 1e9, second = 1e9;
    vec2 bestCell = vec2(0.0);
    for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
            vec2 o = vec2(float(i), float(j));
            vec2 site = o + 0.5 + 0.5 * sin(t * 0.4 + 6.2831 * hash(g + o) + vec2(0.0, 1.5));
            float dd = length(f - site);
            if (dd < best) { second = best; best = dd; bestCell = g + o; }
            else if (dd < second) { second = dd; }
        }
    }

    vec2 off = (vec2(hash(bestCell), hash(bestCell + 5.0)) - 0.5) * 0.06;
    vec2 ruv = uv + off;
    vec2 dir = normalize(off + vec2(1e-5));
    vec3 col = vec3(srcColor(ruv + dir * 0.012).r, srcColor(ruv).g, srcColor(ruv - dir * 0.012).b);

    // bright caustic seams where shards meet
    float edge = smoothstep(0.04, 0.0, second - best);
    col += mix(vec3(0.9, 0.95, 1.0), vec3(0.5, 0.7, 1.0), u_dark) * edge * 0.7;

    col *= mix(1.0, 0.7, u_dark);
    col += (hash(gl_FragCoord.xy) - 0.5) / 220.0;
    gl_FragColor = vec4(col, 1.0);
}
