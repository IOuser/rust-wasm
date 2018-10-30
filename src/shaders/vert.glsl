precision lowp float;

attribute vec2 coord;
attribute vec2 scale;

varying vec2 vPos;
varying float size;

void main() {
    gl_Position = vec4(
        coord.x * scale.x,
        coord.y * scale.y,
        0.0,
        1.0
    );

    vPos = coord;

    size = 10.0;

    gl_PointSize = size;
}
