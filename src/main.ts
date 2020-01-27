import { QuadTree } from './utils/quad-tree';
import { AABB } from './utils/aabb';
import { Point } from './utils/point';
import { getProgram } from './utils/shader';
import { assert } from './utils/assert';

// import Worker from 'worker-loader!./worker/worker';
// const worker = new Worker();
// worker.addEventListener("message", (event) => {
//     console.log('from worker: ', event.data);
// });

// setTimeout(() => {
//     worker.postMessage({ foo: 1 });
// }, 1000);

const pointsCount = 10000;

(async () => {
    const { init } = await import('./lib');
    const { memory, ParticlesBox } = await init();


    let frameId: number | null = null;

    const w = window.innerWidth;
    const h = window.innerHeight;

    const particlesBox = ParticlesBox.new(w, h, pointsCount);
    particlesBox.tick(0);

    // convert raw pointer to Float32Array;
    const pointsPtr = particlesBox.particles();
    const cells = new Float32Array(memory.buffer, pointsPtr, Math.floor(pointsCount * 4));

    const canvas = document.querySelector<HTMLCanvasElement>('canvas');
    assert(canvas !== null, 'canvas is not HTMLCanvasElement');

    canvas.width = w;
    canvas.height = h;

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

        particlesBox.trigger(x, -y)
    })

    const v = await initView(canvas);
    console.log(v);
    v.render(cells);

    let lastT = 0;
    const renderLoop = (t: number) => {
        // fps.render();
        let dt = t - lastT;
        if (dt > 64) {
            dt = 64;
        }

        particlesBox.tick(dt);
        lastT = t;

        v.render(cells);

        frameId = requestAnimationFrame(renderLoop);
    };

    frameId = requestAnimationFrame(renderLoop);

    particlesBox.trigger(0, 0);
})();

interface View {
    render(buffer: Float32Array): void;
    resize(width: number, height: number): void;
}

async function initView(canvas: HTMLCanvasElement): Promise<View> {
    const gl = canvas.getContext('webgl', { alpha: false, antialias: true });
    assert(gl !== null, 'gl is not WebGLRenderingContext');

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
            const qt = new QuadTree(new AABB({ x: 0, y: 0 }, { w: halfSideSize, h: halfSideSize }));
            // measurer.measure();
            for (let i = 0; i + 4 < buffer.length; i += 4) {
                qt.insert(new Point(buffer[i], buffer[i + 1]));
            }
            // measurer.measureEnd();

            let offset = 0;
            let getOffset = () => offset;
            let setOffset = (v: number) => { offset = v };

            linesBuffer.fill(0, 0, linesBufferLength);
            qt.renderNodes(linesBuffer, linesBufferLength, getOffset, setOffset);


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
