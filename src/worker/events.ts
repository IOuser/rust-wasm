type OffscreenCanvas = HTMLCanvasElement;

export type WorkerEvent<T> = {
    type: string;
    data: T;
};

export type InitStateData = {
    buffer: SharedArrayBuffer,
    pointsCount: number;
    width: number;
    height: number;
}

export const initStateEvent = (data: InitStateData): WorkerEvent<InitStateData> => ({
    type: 'init-state',
    data,
});

initStateEvent.toString = () => 'init-state';

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

