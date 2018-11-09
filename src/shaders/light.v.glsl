precision lowp float;

attribute vec2 coord;
attribute vec2 scale;

attribute vec2 lightCoord;

varying vec2 lightPos;

void main() {
    lightPos = lightCoord;

    gl_Position = vec4(
        coord.x * scale.x,
        coord.y * scale.y,
        0.0,
        1.0
    );
}
