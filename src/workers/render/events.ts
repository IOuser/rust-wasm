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

export type SetLightLocationData = {
    x: number;
    y: number;
}

export const setLightLocationEvent = (data: SetLightLocationData): WorkerEvent<SetLightLocationData> => ({
    type: 'set-light-location',
    data,
});

setLightLocationEvent.toString = () => 'set-light-location';