precision lowp float;

attribute vec2 scale;
attribute vec2 velocity;
attribute vec2 coord;

varying vec2 vPos;
varying vec2 vVel;
varying float vSize;

void main() {
    gl_Position = vec4(
        coord.x * scale.x,
        coord.y * scale.y,
        0.0,
        1.0
    );

    vPos = coord;

    vVel = velocity;

    // calc size from velocity
    float s = sqrt(velocity.x * velocity.x + velocity.y * velocity.y) * 200.0;
    vSize = min(max(s, 5.0), 15.0);
    // vSize = min(max(0.8 / s, 5.0), 20.0);


    gl_PointSize = vSize;
}
