import { assert } from './assert';

export class Measurer {
    private static _pre: HTMLPreElement | null = document.querySelector('pre');
    private static _frames: number[] = [];
    private static _lastFrameTimeStamp: number = performance.now();

    public static measure() {
        this._lastFrameTimeStamp = performance.now();
    }

    public static measureEnd() {
        // Convert the delta time since the last frame render into a measure
        // of frames per second.
        const now = performance.now();
        const delta = now - this._lastFrameTimeStamp;
        const fps = delta * 1000;

        // Save only the latest 100 timings.
        this._frames.push(fps);
        if (this._frames.length > 100) {
            this._frames.shift();
        }

        // Find the max, min, and mean of our 100 latest timings.
        let min = Infinity;
        let max = -Infinity;
        let sum = 0;
        for (let i = 0; i < this._frames.length; i++) {
            sum += this._frames[i];
            min = Math.min(this._frames[i], min);
            max = Math.max(this._frames[i], max);
        }
        let mean = sum / this._frames.length;

        assert(this._pre !== null, 'pre is not HTMLPreElement');

        // Render the statistics.
        this._pre.textContent =
`Measure:
         latest = ${Math.round(fps) / 1000}ms
avg of last 100 = ${Math.round(mean) / 1000}ms
min of last 100 = ${Math.round(min) / 1000}ms
max of last 100 = ${Math.round(max) / 1000}ms
`;
    }
};
