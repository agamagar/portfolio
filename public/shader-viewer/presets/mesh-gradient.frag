// name: Mesh Gradient
// group: Gradient
// param float u_speed "Speed" 0.0 1.0 0.25
// param float u_grain "Grain" 0.0 1.0 0.40
//
// Four drifting colour sources blended by inverse-distance - the soft animated
// mesh-gradient look. Premium powder/cream/sage by day, deep jewel by night.
// Continuous colour medium, no drawn geometry. highp, dithered.
precision highp float;

uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_dark;
uniform float u_speed;
uniform float u_grain;
varying vec2 v_uv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = vec2(v_uv.x * aspect, v_uv.y);
    float t = u_time * u_speed;

    // four colour sources on slow lissajous paths
    vec2 s0 = vec2(0.35 * aspect + 0.25 * aspect * sin(t * 0.70),       0.35 + 0.22 * cos(t * 0.90));
    vec2 s1 = vec2(0.70 * aspect + 0.20 * aspect * sin(t * 0.90 + 2.0), 0.65 + 0.20 * cos(t * 0.60 + 1.0));
    vec2 s2 = vec2(0.50 * aspect + 0.28 * aspect * cos(t * 0.50 + 1.5), 0.55 + 0.25 * sin(t * 0.80 + 3.0));
    vec2 s3 = vec2(0.55 * aspect + 0.24 * aspect * cos(t * 1.10),       0.30 + 0.20 * sin(t * 0.70 + 0.5));

    vec3 cA = mix(vec3(0.66, 0.80, 0.90), vec3(0.10, 0.16, 0.42), u_dark); // powder / indigo
    vec3 cB = mix(vec3(0.95, 0.88, 0.70), vec3(0.42, 0.12, 0.30), u_dark); // cream  / plum
    vec3 cC = mix(vec3(0.60, 0.78, 0.62), vec3(0.10, 0.34, 0.36), u_dark); // sage   / teal
    vec3 cD = mix(vec3(0.90, 0.72, 0.66), vec3(0.30, 0.20, 0.50), u_dark); // blush  / violet

    float w0 = 1.0 / (0.02 + dot(p - s0, p - s0));
    float w1 = 1.0 / (0.02 + dot(p - s1, p - s1));
    float w2 = 1.0 / (0.02 + dot(p - s2, p - s2));
    float w3 = 1.0 / (0.02 + dot(p - s3, p - s3));
    vec3 col = (cA * w0 + cB * w1 + cC * w2 + cD * w3) / (w0 + w1 + w2 + w3);

    col += (hash(gl_FragCoord.xy + t) - 0.5) * 0.05 * u_grain; // grain to kill banding
    gl_FragColor = vec4(col, 1.0);
}
