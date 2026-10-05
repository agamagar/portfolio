// name: Sun
// group: Sky
precision mediump float;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_dark;      // 0 = fiery sun, 1 = dim ember (dark variant)
varying vec2 v_uv;
float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}
float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 2.0;
    for(int i = 0; i < 6; i++) {
        value += amplitude * noise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    return value;
}
float circle(vec2 uv, vec2 center, float radius, float blur) {
    float d = length(uv - center);
    return smoothstep(radius, radius - blur, d);
}
void main() {
    vec2 uv = v_uv * 2.0 - 1.0;
    uv.x *= u_resolution.x/u_resolution.y;

    vec2 center = vec2(0.0);
    float mouseInfluence = length(u_mouse - uv) * 0.5;

    float time = u_time * 0.5;

    // Sun core
    float sun = circle(uv, center, 0.4, 0.1);

    // Corona effect
    float corona = 0.0;
    for(float i = 0.0; i < 6.28; i += 0.1) {
        vec2 offset = vec2(cos(i), sin(i));
        corona += fbm(uv + offset * time) * circle(uv, center, 0.8 + sin(time + i) * 0.1, 0.5);
    }

    // Surface detail
    float surface = fbm(uv * 4.0 + time) * sun;

    // Mouse interaction
    float distortion = sin(mouseInfluence * 10.0 - time) * 0.1;

    vec3 color = mix(vec3(1.0, 0.5, 0.2), vec3(0.34, 0.10, 0.05), u_dark);
    color = mix(color, mix(vec3(1.0, 0.8, 0.3), vec3(0.55, 0.22, 0.08), u_dark), surface);
    color += mix(vec3(1.0, 0.4, 0.1), vec3(0.40, 0.12, 0.04), u_dark) * corona * 0.3;
    color *= (1.0 + distortion);

    // Glow
    float glow = circle(uv, center, 1.2, 1.0);
    color += mix(vec3(1.0, 0.3, 0.1), vec3(0.28, 0.08, 0.03), u_dark) * glow * 0.3;

    gl_FragColor = vec4(color, 1.0);
}
