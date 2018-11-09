import { initRenderEvent, InitRenderData, setLightLocationEvent, SetLightLocationData } from "./events";
import { getProgram } from '../../utils/shader';
import { ISegment, Segment, IPoint, Point, IBlock, Block, Visibility } from './visibility';
// import { ISegment, Segment } from '../../utils/segment';
// import { IPoint, Point } from '../../utils/point';
// import { Rect, IRect } from '../../utils/rect';


export class Renderer {
    private _view: View;

    public async initEventHandler(data: InitRenderData): Promise<void> {
        console.log(`renderer ${initRenderEvent}`);
        console.log(data);

        const { buffer, canvas, pointsCount, shaders } = data;

        const cells = new Float32Array(buffer, 0, Math.floor(pointsCount * 4));
        console.log('Buffer readed', cells.length, cells.byteLength)


        console.log('Init view', canvas);
        const view = await initView(canvas, pointsCount, shaders);
        this._view = view;


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

    public setLightLocationEventHandler(data: SetLightLocationData): void {
        this._view.setLightLocation(data.x, data.y);
    }
}

interface View {
    render(buffer: Float32Array): void;
    resize(width: number, height: number): void;
    setLightLocation(x: number, y: number): void;
}

async function initView(canvas: HTMLCanvasElement, pointsCount: number, shaders: Record<string, string>): Promise<View> {
    const gl = canvas.getContext('webgl', { alpha: false, antialias: true });

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());

    gl.clearColor(0, 0, 0, 1);

    gl.disable(gl.DEPTH_TEST);
    // gl.disable(gl.CULL_FACE);

    gl.enable(gl.BLEND);
    // gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const particlesProgram = await getProgram(gl, 'particles shader', [
        [gl.VERTEX_SHADER, shaders.particlesVertex],
        [gl.FRAGMENT_SHADER, shaders.particlesFragment],
    ])
    const gridProgram = await getProgram(gl, 'grid shader', [
        [gl.VERTEX_SHADER, shaders.colorVertex],
        [gl.FRAGMENT_SHADER, shaders.colorFragment],
    ])
    const lightProgram = await getProgram(gl, 'light shader', [
        [gl.VERTEX_SHADER, shaders.lightVertex],
        [gl.FRAGMENT_SHADER, shaders.lightFragment],
    ])

    const w = canvas.width;
    const h = canvas.height;
    const scaleW = 2 / w;
    const scaleH = 2 / h;

    // squares vertecies
    const edgeOfMap = new Block(0, 0, Math.min(w, h) * 0.5 - 10);
    const r1 = new Block(-50, -50, 50);
    const r2 = new Block(-100, 100, 30);
    const r3 = new Block(100, 100, 20);
    const r4 = new Block(100, -100, 20);

    let lightLocation = new Point(5, 5);

    const visibility = new Visibility();
    visibility.loadMap(edgeOfMap, [r1, r2, r3, r4], []);
    visibility.setLightLocation(lightLocation);

    visibility.sweep();
    console.log(visibility);
    // debugger;

    // linesBuffer.fill(0, 0, linesBufferLength);
    const squareBuffer = new Float32Array(1024 * 1024);
    const squareBufferLength = squareBuffer.length;

    edgeOfMap.toBuffer(squareBuffer, 0);
    r1.toBuffer(squareBuffer, 16);
    r2.toBuffer(squareBuffer, 32);
    r3.toBuffer(squareBuffer, 48);
    r4.toBuffer(squareBuffer, 64);

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


            ///////////////////////////////////////////////////////////////////////////////////////////////////
            // draw light
            gl.useProgram(lightProgram);

            {
                const uniformLocation = gl.getUniformLocation(lightProgram, 'resolution');
                gl.uniform2f(uniformLocation, w, h);
            }

            {
                const attribLocation = gl.getAttribLocation(lightProgram, 'lightCoord');
                gl.disableVertexAttribArray(attribLocation);
                gl.vertexAttrib2f(attribLocation, lightLocation.x, lightLocation.y);
            }

            {
                const attribLocation = gl.getAttribLocation(lightProgram, 'scale');
                gl.disableVertexAttribArray(attribLocation);
                gl.vertexAttrib2f(attribLocation, scaleW, scaleH);
            }

            {
                const attribLocation = gl.getAttribLocation(lightProgram, 'coord');
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

            // process light
            const trianges = [];
            const o = visibility.getOutput();
            for (const p of o) {
                trianges.push(p.x, p.y);
            }

            const trianglesBuffer = new Float32Array(trianges);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                trianglesBuffer,
                gl.DYNAMIC_DRAW
            );
            gl.drawArrays(gl.TRIANGLE_FAN, 0, Math.floor(trianglesBuffer.length / 2)); // 2 it's coord num (x, y)




            ///////////////////////////////////////////////////////////////////////////////////////////////////
            // draw squares
            gl.useProgram(gridProgram);

            {
                const uniformLocation = gl.getUniformLocation(gridProgram, 'color');
                gl.uniform4f(uniformLocation, 0, 1, 0, 0.5);
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
        },

        resize: (width: number, height: number) => {
            canvas.width = width;
            canvas.height = height;
            gl.viewport(0, 0, width, height);
        },

        setLightLocation: (x: number, y: number) => {
            lightLocation = new Point(x, y);
            visibility.setLightLocation(lightLocation);
            visibility.sweep();
        }
    }
}
