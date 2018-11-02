precision lowp float;

uniform vec2 resolution;

varying vec2 vPos;
varying vec2 vVel;
varying float vSize;

void main() {
    float innerRadius = vSize * 0.3;
    float outerRadius = vSize * 0.5;
    float blurFactor = 0.275;


    float x1 = (gl_FragCoord.x - resolution.x * 0.5) - vPos.x;
    float y1 = (gl_FragCoord.y - resolution.y * 0.5) - vPos.y;
    float d = sqrt(x1 * x1 + y1 * y1);

    // float b = min(max( , 0.0), 1.0);

    float b = vSize * 0.05;

    gl_FragColor = mix(
        vec4(gl_FragCoord.xy / resolution.xy, max(b, 0.5), 0.25),
        vec4(gl_FragCoord.xy / resolution.xy * 0.25, min(b, 0.0), 0.25),
        clamp((innerRadius - d) * blurFactor, 0.5, 1.0)
    ) * clamp((outerRadius - d) * blurFactor, 0.0, 0.5) * 1.2;
}
