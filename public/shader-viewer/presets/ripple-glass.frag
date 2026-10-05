// name: Ripple Glass
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

    // two drifting ripple sources refract the image in expanding concentric rings
    vec2 off = vec2(0.0);
    float crest = 0.0;
    for (int i = 0; i < 2; i++) {
        float fi = float(i);
        vec2 ctr = vec2(0.5, 0.5) + vec2(0.22 * sin(t * 0.2 + fi * 2.0), 0.18 * cos(t * 0.17 + fi * 3.0));
        vec2 d = uv - ctr; d.x *= aspect;
        float r = length(d);
        float rip = sin(r * 36.0 - t * 2.0 - fi * 1.5) * exp(-r * 1.8);
        vec2 dir = normalize((uv - ctr) + vec2(1e-5));
        off += dir * rip * 0.035;
        crest += pow(max(0.0, rip), 4.0);
    }

    vec2 ruv = uv + off;
    vec2 dir = normalize(off + vec2(1e-5));
    float disp = length(off) * 0.6;
    vec3 col = vec3(srcColor(ruv + dir * disp).r, srcColor(ruv).g, srcColor(ruv - dir * disp).b);

    // glints on the ripple crests
    col += mix(vec3(0.9, 0.95, 1.0), vec3(0.5, 0.7, 1.0), u_dark) * crest * 0.4;

    col *= mix(1.0, 0.7, u_dark);
    col += (hash(gl_FragCoord.xy) - 0.5) / 220.0;
    gl_FragColor = vec4(col, 1.0);
}
