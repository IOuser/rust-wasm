precision lowp float;

uniform vec2 resolution;

void main() {
    gl_FragColor = vec4(
        gl_FragCoord.xy / resolution.xy, resolution.y / gl_FragCoord.x + 0.1, 0.2
    );
}
