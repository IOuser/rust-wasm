import { QuadTree } from './utils/quad-tree';
import { AABB } from './utils/aabb';
// import { Point, IPoint } from './utils/point';
import { getProgram } from './utils/shader';
import { Coord } from './utils/types';

import Worker from 'worker-loader!./worker/shared-memory';
const worker = new Worker();
// worker.addEventListener("message", (event) => {
//     console.log('from worker: ', event.data);
// });

// setTimeout(() => {
//     worker.postMessage({ foo: 1 });
// }, 1000);

const pointsCount = 10000;

(async () => {
    // const { init } = await import('./lib');
    // const { memory, ParticlesBox } = await init();


    let frameId = null;

    window.addEventListener('keyup', (e: KeyboardEvent) => {
        if (e.key !== ' ') {
            return;
        }

        if (frameId === null) {
            frameId = requestAnimationFrame(renderLoop);
        } else {
            cancelAnimationFrame(frameId);
            frameId = null;
        }
    });

    window.addEventListener('click', (e: MouseEvent) => {
        const { left, top } = canvas.getBoundingClientRect()

        const x = e.clientX - left - canvas.width / 2;
        const y = e.clientY - top - canvas.height / 2;

        console.log(x, y);

        // particlesBox.trigger(x, -y)
    })


    const w = window.innerWidth;
    const h = window.innerHeight;

    // const particlesBox = ParticlesBox.new(w, h, pointsCount);
    // particlesBox.tick(0);

    const sharedBuffer = new SharedArrayBuffer(Math.floor(pointsCount * 4 * 4))

    worker.postMessage({ sharedBuffer, pointsCount, width: w, height: h });

    // convert raw pointer to Float32Array;
    // const pointsPtr = particlesBox.particles();
    // const cells = new Float32Array(memory.buffer, pointsPtr, Math.floor(pointsCount * 4));

    const cells = new Float32Array(sharedBuffer, 0, Math.floor(pointsCount * 4));
    console.log(cells.length, cells.byteLength)

    const canvas = document.querySelector<HTMLCanvasElement>('canvas');
    console.assert(canvas !== null);
    canvas.width = w;
    canvas.height = h;

    const v = await initView(canvas);
    console.log(v);
    v.render(cells);
    // const ctx = canvas.getContext('2d');

    let lastT = 0;
    const renderLoop = (t: number) => {
        // fps.render();
        let dt = t - lastT;
        if (dt > 64) {
            dt = 64;
        }

        // particlesBox.tick(dt);
        lastT = t;

        v.render(cells);

        frameId = requestAnimationFrame(renderLoop);
    };

    frameId = requestAnimationFrame(renderLoop);

    // particlesBox.tick(0)
    // particlesBox.trigger(0, 0);
})();

interface View {
    render(buffer: Float32Array): void;
    resize(width: number, height: number): void;
}

async function initView(canvas: HTMLCanvasElement): Promise<View> {
    const gl = canvas.getContext('webgl', { alpha: false, antialias: true });

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());

    gl.clearColor(0, 0, 0, 1);

    gl.disable(gl.DEPTH_TEST);
    // gl.disable(gl.CULL_FACE);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);


    const particlesProgram = await getProgram(gl, 'particles shader', [
        ['particles.v.glsl', gl.VERTEX_SHADER],
        ['particles.f.glsl', gl.FRAGMENT_SHADER],
    ])
    const gridProgram = await getProgram(gl, 'grid shader', [
        ['grid.v.glsl', gl.VERTEX_SHADER],
        ['grid.f.glsl', gl.FRAGMENT_SHADER],
    ])


    const linesBuffer = new Float32Array(512 * 1024);
    const linesBufferLength = linesBuffer.length;
    const sideSize = Math.max(canvas.width, canvas.height);

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

            const halfSideSize = sideSize * 0.5;
            const qt = new QuadTree<Coord & { i: number }>(new AABB({ x: 0, y: 0 }, { w: halfSideSize, h: halfSideSize }));
            // measurer.measure();
            // for (let i = 0; i + 4 < buffer.length; i += 4) {
            //     qt.insert({ i, x: buffer[i], y: buffer[i + 1] });
            // }
            // measurer.measureEnd();

            let offset = 0;
            let getOffset = () => offset;
            let setOffset = (v: number) => { offset = v };

            linesBuffer.fill(0, 0, linesBufferLength);
            qt.renderNodes(linesBuffer, linesBufferLength, getOffset, setOffset);

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
