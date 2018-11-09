precision lowp float;

uniform vec2 resolution;

varying vec2 lightPos;

void main() {
    // if (gl_FragColor.x < 0.1 && gl_FragColor.y < 0.1 && gl_FragColor.z < 0.1) {
        // return;
    // }

    float vSize = 300.0;
    float innerRadius = vSize * 0.3;
    float outerRadius = vSize * 0.5;
    float blurFactor = 0.275;



    float m = min(resolution.x, resolution.y);

    float x1 = (gl_FragCoord.x - resolution.x * 0.5) - lightPos.x;
    float y1 = (gl_FragCoord.y - resolution.y * 0.5) - lightPos.y;


    float r = max(resolution.x, resolution.y);
    float d = max(r / sqrt(x1 * x1 + y1 * y1), 1.0);

    float c = max(d * 0.05, 0.01);
    gl_FragColor = vec4(c, c, c * 0.65, 1.0);
}
