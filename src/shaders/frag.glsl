precision lowp float;

uniform vec2 resolution;

varying vec2 vPos;
varying float size;

void main() {
    float innerRadius = 3.0;
    float outerRadius = 5.0;
    float blurFactor = 0.275;

    // gl_FragColor = vec4(
    //     // gl_FragCoord.xy / resolution.xy, resolution.y / gl_FragCoord.x + 0.1, 0.2
    //     vPos.yx, 1.0, 1.0
    // );

    vec2 center = vPos;
    float r = size * 0.5;



    float x1 = (gl_FragCoord.x - resolution.x * 0.5) - center.x;
    float y1 = (gl_FragCoord.y - resolution.y * 0.5) - center.y;
    float d = sqrt(x1 * x1 + y1 * y1);


    // float len = min((vPos.x + vPos.y + abs(vPos.x - vPos.y)) * 0.5, 2.0);

    gl_FragColor = mix(
        vec4(gl_FragCoord.xy / resolution.xy, 1.0, 0.25),
        vec4(gl_FragCoord.xy / resolution.xy * 0.25, 0.25, 0.25),
        clamp((innerRadius - d) * blurFactor, 0.5, 1.0)
    ) * clamp((outerRadius - d) * blurFactor, 0.0, 0.5) * 1.2;

    // if (d < 5.0) {
    //     float v = size / 15.0;
    //     gl_FragColor = vec4(v, v, v, 1.0);
    //     return;
    // }
}
