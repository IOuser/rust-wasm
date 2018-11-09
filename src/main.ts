// import { QuadTree } from './utils/quad-tree';
// import { AABB } from './utils/aabb';
// // import { Point, IPoint } from './utils/point';
// import { getProgram } from './utils/shader';
// import { Coord } from './utils/types';

import StateWorker from 'worker-loader?name=state-worker.[hash:5].js!./workers/state/state-worker';
import { initStateEvent, triggerEvent } from './workers/state/events';
import RenderWorker from 'worker-loader?name=render-worker.[hash:5].js!./workers/render/render-worker';
import { initRenderEvent, setLightLocationEvent } from './workers/render/events';

const stateWorker = new StateWorker();
const renderWorker = new RenderWorker();


const pointsCount = 0;

(async () => {
    // const { init } = await import('./lib');
    // const { memory, ParticlesBox } = await init();


    // let frameId = null;

    // window.addEventListener('keyup', (e: KeyboardEvent) => {
    //     if (e.key !== ' ') {
    //         return;
    //     }

    //     if (frameId === null) {
    //         frameId = requestAnimationFrame(renderLoop);
    //     } else {
    //         cancelAnimationFrame(frameId);
    //         frameId = null;
    //     }
    // });

    const buffer = new SharedArrayBuffer(Math.floor(pointsCount * 4 * 4))

    const canvas = document.querySelector<HTMLCanvasElement>('canvas');
    console.assert(canvas !== null);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const offscreen = (canvas as any).transferControlToOffscreen();

    stateWorker.postMessage(initStateEvent({
        pointsCount,
        buffer,
        width: canvas.width,
        height: canvas.height,
    }));

    window.addEventListener('click', (e: MouseEvent) => {
        const { left, top } = canvas.getBoundingClientRect()

        const x = e.clientX - left - canvas.width / 2;
        const y = e.clientY - top - canvas.height / 2;

        console.log(x, y);
        stateWorker.postMessage(triggerEvent({ x, y: -y }));
        // renderWorker.postMessage(setLightLocationEvent({ x, y: -y }));
    })

    window.addEventListener('mousemove', (e: MouseEvent) => {
        const { left, top } = canvas.getBoundingClientRect()

        const x = e.clientX - left - canvas.width / 2;
        const y = e.clientY - top - canvas.height / 2;

        renderWorker.postMessage(setLightLocationEvent({ x, y: -y }));
    })

    const getShaderSource = async (name: string) => (await import(`./shaders/${name}`)).default;
    const [pV, pF, cV, cF, lV, lF] = await Promise.all([
        getShaderSource('particles.v.glsl'),
        getShaderSource('particles.f.glsl'),
        getShaderSource('color.v.glsl'),
        getShaderSource('color.f.glsl'),
        getShaderSource('light.v.glsl'),
        getShaderSource('light.f.glsl'),
    ])

    renderWorker.postMessage(initRenderEvent({
        pointsCount,
        buffer,
        canvas: offscreen,
        shaders: {
            particlesVertex: pV,
            particlesFragment: pF,
            colorVertex: cV,
            colorFragment: cF,
            lightVertex: lV,
            lightFragment: lF,
        }
    }), [offscreen]);
})();
