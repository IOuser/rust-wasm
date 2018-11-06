import { WorkerEvent } from '../worker-event';

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

export type TriggerEventData = {
    x: number;
    y: number;
};

export const triggerEvent = (data: TriggerEventData): WorkerEvent<TriggerEventData> => ({
    type: 'trigger',
    data,
});

triggerEvent.toString = () => 'trigger';
