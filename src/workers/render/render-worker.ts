import { initRenderEvent, InitRenderData } from "./events";
import { getProgram } from '../../utils/shader';
import { ISegment, Segment } from '../../utils/segment';
import { IPoint, Point } from '../../utils/point';

self.addEventListener('message', function (event) {
    const { data: { type, data } } = event;

    console.assert(type);

    switch (type) {
        case initRenderEvent.toString():
            return initEventHandler(data);
    }
});

async function initEventHandler(data: InitRenderData): Promise<void> {
    console.log(`renderer ${initRenderEvent}`);
    console.log(data);

    const { buffer, canvas, pointsCount, shaders } = data;

    const cells = new Float32Array(buffer, 0, Math.floor(pointsCount * 4));
    console.log('Buffer readed', cells.length, cells.byteLength)


    console.log('Init view', canvas);
    const view = await initView(canvas, pointsCount, shaders);


    view.render(cells);

    let frameId;
    let lastT = 0;
    const renderLoop = (t: number) => {
        let dt = t - lastT;
        if (dt > 64) {
            dt = 64;
        }

        lastT = t;

        view.render(cells);

        frameId = requestAnimationFrame(renderLoop);
    };

    frameId = requestAnimationFrame(renderLoop);
}


interface View {
    render(buffer: Float32Array): void;
    resize(width: number, height: number): void;
}

async function initView(canvas: HTMLCanvasElement, pointsCount: number, shaders: Record<string, string>): Promise<View> {
    const gl = canvas.getContext('webgl', { alpha: false, antialias: true });

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());

    gl.clearColor(0, 0, 0, 1);

    gl.disable(gl.DEPTH_TEST);
    // gl.disable(gl.CULL_FACE);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const particlesProgram = await getProgram(gl, 'particles shader', [
        [gl.VERTEX_SHADER, shaders.particlesVertex],
        [gl.FRAGMENT_SHADER, shaders.particlesFragment],
    ])
    const gridProgram = await getProgram(gl, 'grid shader', [
        [gl.VERTEX_SHADER, shaders.colorVertex],
        [gl.FRAGMENT_SHADER, shaders.colorFragment],
    ])
    const triangesProgram = await getProgram(gl, ' trianges shader', [
        [gl.VERTEX_SHADER, shaders.colorVertex],
        [gl.FRAGMENT_SHADER, shaders.colorFragment],
    ])

    const w = canvas.width;
    const h = canvas.height;
    const scaleW = 2 / w;
    const scaleH = 2 / h;

    // squares vertecies
    const square = [
        0, 0, 100, 0,
        100, 0, 100, 100,
        100, 100, 0, 100,
        0, 100, 0, 0,
    ];

    // linesBuffer.fill(0, 0, linesBufferLength);
    const squareBuffer = new Float32Array([
        ...square.map((v, i) => i % 2 === 0 ? v - 120 : v + 50),
        ...square.map((v, i) => i % 2 === 0 ? v - 150 : v - 200)
    ])
    const squareBufferLength = squareBuffer.length;

    return {
        render: (buffer: Float32Array) => {
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(particlesProgram);

            {
                const uniformLocation = gl.getUniformLocation(particlesProgram, 'resolution');
                gl.uniform2f(uniformLocation, w, h);
            }

            {
                const attribLocation = gl.getAttribLocation(particlesProgram, 'scale');
                gl.disableVertexAttribArray(attribLocation);
                gl.vertexAttrib2f(attribLocation, scaleW, scaleH);
            }

            {
                const attribLocation = gl.getAttribLocation(particlesProgram, 'velocity');
                gl.enableVertexAttribArray(attribLocation);
                gl.vertexAttribPointer(
                    attribLocation, // index of attr
                    2, // pick two values X and Y
                    gl.FLOAT, // f32
                    false, // normalized
                    16, // stride (step in bytes)
                    // dx, dy
                    8, // start
                );
            }

            {
                const attribLocation = gl.getAttribLocation(particlesProgram, 'coord');
                gl.enableVertexAttribArray(attribLocation);
                gl.vertexAttribPointer(
                    attribLocation, // index of attr
                    2, // pick two values X and Y
                    gl.FLOAT, // f32
                    false, // normalized
                    16, // stride (step in bytes)
                    0, // start
                );
            }

            gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.DYNAMIC_DRAW);
            gl.drawArrays(gl.LINES, 0, pointsCount);

            const trianges = [
                0, 0,
                200, 0,
                200, 100,
                // 100, 100, 0, 100,
                // 0, 100, 0, 0,
            ];
            const segments: ISegment[] = [];
            const points: IPoint[] = [];
            for (let i = 0; i < squareBufferLength; i += 4) {
                const x1 = squareBuffer[i];
                const y1 = squareBuffer[i + 1];
                const x2 = squareBuffer[i + 2];
                const y2 = squareBuffer[i + 3];

                const p1 = new Point(x1, y1);
                const p2 = new Point(x2, y2);

                points.push(p1, p2);
                segments.push(new Segment(p1, p2));
            }

            // sort points
            points.sort((a: IPoint, b: IPoint) => a.getPhi() - b.getPhi());

            console.log(segments, points);
            // debugger;

            // draw lights
            // var endpoints: [number, number][] = []; // list of endpoints, sorted by angle
            // var open = []; // list of walls the sweep line intersects


            // console.log((endpoints as any).flat())
            // debugger;

            for (let i = 0; i < points.length; i++) {
                const p = points[i];
            }
            // loop over endpoints:
            //     remember which wall is nearest
            //     add any walls that BEGIN at this endpoint to 'walls'
            //     remove any walls that END at this endpoint from 'walls'

            //     figure out which wall is now nearest
            //     if the nearest wall changed:
            //         fill the current triangle and begin a new one


            ///////////////////////////////////////////////////////////////////////////////////////////////////
            // draw squares
            gl.useProgram(gridProgram);

            {
                const uniformLocation = gl.getUniformLocation(gridProgram, 'color');
                gl.uniform3f(uniformLocation, 0, 1, 0);
            }

            {
                const attribLocation = gl.getAttribLocation(gridProgram, 'scale');
                gl.disableVertexAttribArray(attribLocation);
                gl.vertexAttrib2f(attribLocation, scaleW, scaleH);
            }

            {
                const attribLocation = gl.getAttribLocation(gridProgram, 'coord');
                gl.enableVertexAttribArray(attribLocation);
                gl.vertexAttribPointer(
                    attribLocation, // index of attr
                    2, // pick two values X and Y
                    gl.FLOAT, // f32
                    false, // normalized
                    8, // stride (step in bytes)
                    0, // start
                );
            }

            gl.bufferData(
                gl.ARRAY_BUFFER,
                squareBuffer,
                gl.DYNAMIC_DRAW
            );
            gl.drawArrays(gl.LINES, 0, Math.floor(squareBufferLength / 2)); // 2 it's coord num (x, y)


            ///////////////////////////////////////////////////////////////////////////////////////////////////
            // draw triangles
            gl.useProgram(triangesProgram);

            {
                const uniformLocation = gl.getUniformLocation(triangesProgram, 'color');
                gl.uniform3f(uniformLocation, 1, 0, 0);
            }

            {
                const attribLocation = gl.getAttribLocation(triangesProgram, 'scale');
                gl.disableVertexAttribArray(attribLocation);
                gl.vertexAttrib2f(attribLocation, scaleW, scaleH);
            }

            {
                const attribLocation = gl.getAttribLocation(triangesProgram, 'coord');
                gl.enableVertexAttribArray(attribLocation);
                gl.vertexAttribPointer(
                    attribLocation, // index of attr
                    2, // pick two values X and Y
                    gl.FLOAT, // f32
                    false, // normalized
                    8, // stride (step in bytes)
                    0, // start
                );
            }

            const trianglesBuffer = new Float32Array(trianges);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                trianglesBuffer,
                gl.DYNAMIC_DRAW
            );
            gl.drawArrays(gl.TRIANGLE_FAN, 0, Math.floor(trianglesBuffer.length / 2)); // 2 it's coord num (x, y)

        },

        resize: (width: number, height: number) => {
            canvas.width = width;
            canvas.height = height;
            gl.viewport(0, 0, width, height);
        }
    }
}
