// name: Liquid Lens
// group: Glass
precision highp float;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_dark;
uniform sampler2D u_image;   // swappable base image
uniform float u_hasImage;    // 1 if an image is loaded, else 0 (black)
uniform vec2 u_imageRes;
varying vec2 v_uv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

// cover-fit the image into the canvas
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

    // a big glass orb drifting partly off-frame — you never see all of it at once
    vec2 ctr = vec2(0.5, 0.55) + 0.18 * vec2(sin(t * 0.23), cos(t * 0.19));
    float R = 0.44 + 0.03 * sin(t * 0.7);
    vec2 d = (uv - ctr); d.x *= aspect;
    float r = length(d);

    vec3 col = vec3(0.0);
    if (r < R) {
        float nr = r / R;
        float z = sqrt(max(0.0, 1.0 - nr * nr));         // sphere height
        vec2 dir = normalize(d + vec2(1e-5)); dir.x /= aspect; // back to uv space
        float bend = (1.0 - z) * 0.32;
        vec2 ruv = ctr + (uv - ctr) * mix(0.80, 1.0, z) - dir * bend;
        float disp = (1.0 - z) * 0.02;                   // chromatic dispersion grows toward rim
        col = vec3(srcColor(ruv + dir * disp).r, srcColor(ruv).g, srcColor(ruv - dir * disp).b);
        col *= mix(0.7, 1.0, z);                          // darken toward the rim

        // bright rim highlight arc (the glassy crescent in the refs)
        float rim = smoothstep(R * 0.92, R, r);
        float topf = clamp(dot(dir, normalize(vec2(0.35, 1.0))) * 0.5 + 0.5, 0.0, 1.0);
        col += mix(vec3(1.0, 0.95, 0.85), vec3(0.6, 0.8, 1.0), u_dark) * rim * topf * 1.3;

        // thin chromatic ring at the very edge
        float ring = smoothstep(R * 0.97, R, r) * smoothstep(R, R * 0.94, r);
        col += vec3(0.4, 0.6, 1.0) * ring * 0.5;

        // caustic sparkles near the lower rim
        float low = clamp(-dir.y, 0.0, 1.0);
        float spark = pow(max(0.0, sin(r * 44.0 - t * 2.2)), 8.0) * smoothstep(R, R * 0.6, r) * low;
        col += vec3(0.85, 0.92, 1.0) * spark * 0.7;
    }

    col *= mix(1.0, 0.7, u_dark);
    col += (hash(gl_FragCoord.xy) - 0.5) / 220.0;
    gl_FragColor = vec4(col, 1.0);
}
