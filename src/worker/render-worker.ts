import { initRenderEvent, InitRenderData } from "./events";
import { getProgram } from '../utils/shader';

self.addEventListener('message', function (event) {
    const { data: { type, data } } = event;

    console.assert(type);

    switch(type) {
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
        [gl.VERTEX_SHADER, shaders.gridVertex],
        [gl.FRAGMENT_SHADER, shaders.gridFragment],
    ])


    const linesBuffer = new Float32Array(512 * 1024);
    const linesBufferLength = linesBuffer.length;
    // const sideSize = Math.max(canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;
    const scaleW = 2 / w;
    const scaleH = 2 / h;

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

            // console.log(buffer);

            // console.log(buffer);
            // debugger;

            gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.DYNAMIC_DRAW);
            gl.drawArrays(gl.POINTS, 0, pointsCount);

            // draw grid
            gl.useProgram(gridProgram);

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

            // const halfSideSize = sideSize * 0.5;
            // const qt = new QuadTree<Coord & { i: number }>(new AABB({ x: 0, y: 0 }, { w: halfSideSize, h: halfSideSize }));
            // measurer.measure();
            // for (let i = 0; i + 4 < buffer.length; i += 4) {
            //     qt.insert({ i, x: buffer[i], y: buffer[i + 1] });
            // }
            // measurer.measureEnd();

            // let offset = 0;
            // let getOffset = () => offset;
            // let setOffset = (v: number) => { offset = v };

            linesBuffer.fill(0, 0, linesBufferLength);
            // qt.renderNodes(linesBuffer, linesBufferLength, getOffset, setOffset);

            // modification
            // qt.traverse((items: (Coord & { i: number })[]) => {
            //     const l = items.length;
            //     for (let j = 0; j < l; j++) {
            //         const i1 = items[j];
            //         for(let k = 0; k < l; k++) {
            //             if (j === k) {
            //                 continue;
            //             }

            //             const i2 = items[k];

            //             if (Math.sqrt((i2.x - i1.x) ** 2 + (i2.y - i1.y) ** 2) < 10) {
            //                 const amp = Math.sqrt(Math.random() * 0.3 + 0.1) * 0.5 - 0.3;
            //                 const vec = Math.random() * 2.0 * 3.14;
            //                 buffer[i1.i + 2] += Math.sin(vec) * amp * 0.02; // dx
            //                 buffer[i1.i + 3] += Math.cos(vec) * amp * 0.02; // dy

            //                 buffer[i2.i + 2] += Math.sin(vec + 3.14) * amp * 0.02; // dx
            //                 buffer[i2.i + 3] += Math.cos(vec + 3.14) * amp * 0.02; // dy
            //             }
            //         }
            //     }
            // });

            gl.bufferData(
                gl.ARRAY_BUFFER,
                linesBuffer,
                gl.DYNAMIC_DRAW
            );
            gl.drawArrays(gl.LINES, 0, Math.floor(linesBufferLength / 2)); // 2 it's coord num (x, y)
        },

        resize: (width: number, height: number) => {
            canvas.width = width;
            canvas.height = height;
            gl.viewport(0, 0, width, height);
        }
    }
}
