export const measurer = new class {
    pre: HTMLPreElement = document.querySelector('pre');
    frames: number[] = [];
    lastFrameTimeStamp: number = performance.now();

    measure() {
        this.lastFrameTimeStamp = performance.now();
    }

    measureEnd() {
        // Convert the delta time since the last frame render into a measure
        // of frames per second.
        const now = performance.now();
        const delta = now - this.lastFrameTimeStamp;
        const fps = delta * 1000;

        // Save only the latest 100 timings.
        this.frames.push(fps);
        if (this.frames.length > 100) {
            this.frames.shift();
        }

        // Find the max, min, and mean of our 100 latest timings.
        let min = Infinity;
        let max = -Infinity;
        let sum = 0;
        for (let i = 0; i < this.frames.length; i++) {
            sum += this.frames[i];
            min = Math.min(this.frames[i], min);
            max = Math.max(this.frames[i], max);
        }
        let mean = sum / this.frames.length;

        // Render the statistics.
        this.pre.textContent =
`Measure:
         latest = ${Math.round(fps) / 1000}ms
avg of last 100 = ${Math.round(mean) / 1000}ms
min of last 100 = ${Math.round(min) / 1000}ms
max of last 100 = ${Math.round(max) / 1000}ms
`;
    }
};
