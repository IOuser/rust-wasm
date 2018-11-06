import { initStateEvent, triggerEvent } from "./events";
import { State } from './state';

const state = new State();

self.addEventListener('message', function (event) {
    const { data: { type, data } } = event;

    console.log(type, data);
    console.assert(type);

    switch (type) {
        case initStateEvent.toString():
            return state.init(data);
        case triggerEvent.toString():
            return state.trigger(data);
    }
});
