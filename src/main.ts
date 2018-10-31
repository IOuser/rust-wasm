// import Worker from 'worker-loader!./worker/worker';
// const worker = new Worker();
// worker.addEventListener("message", (event) => {
//     console.log('from worker: ', event.data);
// });

// setTimeout(() => {
//     worker.postMessage({ foo: 1 });
// }, 1000);


// const fps = new class {
//     fps: HTMLPreElement = document.querySelector("pre");
//     frames: number[] = [];
//     lastFrameTimeStamp = performance.now();

//     render() {
//         // Convert the delta time since the last frame render into a measure
//         // of frames per second.
//         const now = performance.now();
//         const delta = now - this.lastFrameTimeStamp;
//         this.lastFrameTimeStamp = now;
//         const fps = 1 / delta * 1000;

//         // Save only the latest 100 timings.
//         this.frames.push(fps);
//         if (this.frames.length > 100) {
//             this.frames.shift();
//         }

//         // Find the max, min, and mean of our 100 latest timings.
//         let min = Infinity;
//         let max = -Infinity;
//         let sum = 0;
//         for (let i = 0; i < this.frames.length; i++) {
//             sum += this.frames[i];
//             min = Math.min(this.frames[i], min);
//             max = Math.max(this.frames[i], max);
//         }
//         let mean = sum / this.frames.length;

//         // Render the statistics.
//         this.fps.textContent = `
//   Frames per Second:
//            latest = ${Math.round(fps)}
//   avg of last 100 = ${Math.round(mean)}
//   min of last 100 = ${Math.round(min)}
//   max of last 100 = ${Math.round(max)}
//   `.trim();
//     }
// };


const pointsCount = 50000;

(async () => {
    const { init } = await import('./lib');
    const { memory, ParticlesBox } = await init();


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

        particlesBox.trigger(x, -y)
    })


    const w = window.innerWidth;
    const h = window.innerHeight;

    const particlesBox = ParticlesBox.new(w, h, pointsCount);
    particlesBox.tick(0);
    const pointsPtr = particlesBox.particles();
    const cells = new Float32Array(memory.buffer, pointsPtr, Math.floor(pointsCount * 4));
    // console.log(cells);

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

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());

    gl.clearColor(0, 0, 0, 1);

    gl.disable(gl.DEPTH_TEST);
    // gl.disable(gl.CULL_FACE);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    gl.VERTEX_SHADER
    const [vert, frag, vert2, frag2] = await Promise.all([
        getShader('vert.glsl', gl, gl.VERTEX_SHADER),
        getShader('frag.glsl', gl, gl.FRAGMENT_SHADER),
        getShader('vert-2.glsl', gl, gl.VERTEX_SHADER),
        getShader('frag-2.glsl', gl, gl.FRAGMENT_SHADER),
    ])


    const program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);

    var numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (var ii = 0; ii < numAttribs; ++ii) {
        var attribInfo = gl.getActiveAttrib(program, ii);
        if (!attribInfo) {
            break;
        }
        console.log(gl.getAttribLocation(program, attribInfo.name), attribInfo.name);
    }

    const program2 = gl.createProgram();
    gl.attachShader(program2, vert2);
    gl.attachShader(program2, frag2);
    gl.linkProgram(program2);

    var numAttribs = gl.getProgramParameter(program2, gl.ACTIVE_ATTRIBUTES);
    for (var ii = 0; ii < numAttribs; ++ii) {
        var attribInfo = gl.getActiveAttrib(program2, ii);
        if (!attribInfo) {
            break;
        }
        console.log(gl.getAttribLocation(program2, attribInfo.name), attribInfo.name);
    }

    return {
        render: (buffer: Float32Array) => {
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(program);

            {
                const uniformLocation = gl.getUniformLocation(program, 'resolution');
                gl.uniform2f(uniformLocation, canvas.width, canvas.height);
            }

            {
                const attribLocation = gl.getAttribLocation(program, 'scale');
                gl.disableVertexAttribArray(attribLocation);
                gl.vertexAttrib2f(attribLocation, 2 / canvas.width, 2 / canvas.height);
            }

            {
                const attribLocation = gl.getAttribLocation(program, 'coord');
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

            // draw lines
            gl.useProgram(program2);

            {
                const attribLocation = gl.getAttribLocation(program2, 'scale');
                gl.disableVertexAttribArray(attribLocation);
                gl.vertexAttrib2f(attribLocation, 2 / canvas.width, 2 / canvas.height);
            }

            {
                const attribLocation = gl.getAttribLocation(program2, 'coord');
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
                new Float32Array([
                    -100, 100, 100, 100,
                    -100, -100, 100, -100,
                    100, 100, 100, -100,
                    -100, 100, -100, -100,
                ]),
                gl.STATIC_DRAW
            );
            gl.drawArrays(gl.LINES, 0, 8);
        },
        resize: (width: number, height: number) => {
            canvas.width = width;
            canvas.height = height;
            gl.viewport(0, 0, width, height);
        }
    }
}

type Flavour = WebGLRenderingContextBase['VERTEX_SHADER'] | WebGLRenderingContextBase['FRAGMENT_SHADER'];
async function getShader(name: string, gl: WebGLRenderingContext, flavour: Flavour): Promise<WebGLShader> {
    const source = (await import(`./shaders/${name}`)).default;

    const shader = gl.createShader(flavour);
    gl.shaderSource(shader, source);
    gl.compileShader(shader)

    console.groupCollapsed(name);
    console.log(source);
    console.log(gl.getShaderInfoLog(shader));
    console.groupEnd();

    return shader;
}