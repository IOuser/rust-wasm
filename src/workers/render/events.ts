import { WorkerEvent } from '../worker-event';

type OffscreenCanvas = HTMLCanvasElement;

export type InitRenderData = {
    buffer: SharedArrayBuffer,
    canvas: OffscreenCanvas,
    pointsCount: number;
    shaders: Record<string, string>;
}

export const initRenderEvent = (data: InitRenderData): WorkerEvent<InitRenderData> => ({
    type: 'init-render',
    data,
});

initRenderEvent.toString = () => 'init-render';

