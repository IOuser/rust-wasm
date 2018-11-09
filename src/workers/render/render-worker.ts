import { initRenderEvent, InitRenderData, setLightLocationEvent } from "./events";
import { Renderer } from './renderer';

const renderer = new Renderer();

self.addEventListener('message', function (event) {
    const { data: { type, data } } = event;

    console.assert(type);

    switch (type) {
        case initRenderEvent.toString():
            return renderer.initEventHandler(data);
        case setLightLocationEvent.toString():
            return renderer.setLightLocationEventHandler(data);
    }
});
