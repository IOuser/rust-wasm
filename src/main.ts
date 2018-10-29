// import Worker from 'worker-loader!./worker/worker';
// const worker = new Worker();
// worker.addEventListener("message", (event) => {
//     console.log('from worker: ', event.data);
// });

// setTimeout(() => {
//     worker.postMessage({ foo: 1 });
// }, 1000);

const CELL_SIZE = 5; // px
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";


const fps = new class {
    fps: HTMLPreElement = document.querySelector("pre");
    frames: number[] = [];
    lastFrameTimeStamp = performance.now();

    render() {
        // Convert the delta time since the last frame render into a measure
        // of frames per second.
        const now = performance.now();
        const delta = now - this.lastFrameTimeStamp;
        this.lastFrameTimeStamp = now;
        const fps = 1 / delta * 1000;

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
        this.fps.textContent = `
  Frames per Second:
           latest = ${Math.round(fps)}
  avg of last 100 = ${Math.round(mean)}
  min of last 100 = ${Math.round(min)}
  max of last 100 = ${Math.round(max)}
  `.trim();
    }
};


(async () => {
    const { init } = await import('./lib');
    const { Universe, Cell, memory } = await init();

    // console.time('rust');
    // console.log(addOne(1, 2));
    // console.timeEnd('rust');

    let frameId = null;

    window.addEventListener('keyup', (e: KeyboardEvent) => {
        if (e.key !== ' ') {
            return;
        }

        if (frameId === null) {
            frameId = requestAnimationFrame(renderLoop);
        } else {
            cancelAnimationFrame(frameId);
            frameId = null;
        }
    });

    const universe = Universe.new();
    const width = universe.width();
    const height = universe.height();
    const cellsPtr = universe.cells();
    const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

    const canvas = document.querySelector<HTMLCanvasElement>('canvas');
    console.assert(canvas !== null);

    canvas.height = (CELL_SIZE + 1) * height + 1;
    canvas.width = (CELL_SIZE + 1) * width + 1;

    const ctx = canvas.getContext('2d');

    const renderLoop = (t: number) => {
        fps.render();
        universe.tick();

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();
        drawCells();

        frameId = requestAnimationFrame(renderLoop);
    };
    // frameId = requestAnimationFrame(renderLoop);

    const drawGrid = () => {
        ctx.beginPath();
        ctx.strokeStyle = GRID_COLOR;

        // Vertical lines.
        for (let i = 0; i <= width; i++) {
            ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
            ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
        }

        // Horizontal lines.
        for (let j = 0; j <= height; j++) {
            ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
            ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
        }

        ctx.stroke();
    };

    const getIndex = (row, column) => {
        return row * width + column;
    };

    const drawCells = () => {
        ctx.beginPath();
        ctx.fillStyle = ALIVE_COLOR;

        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                const idx = getIndex(row, col);

                if (cells[idx] === Cell.Dead) {
                    continue;
                }

                ctx.rect(
                    col * (CELL_SIZE + 1) + 1,
                    row * (CELL_SIZE + 1) + 1,
                    CELL_SIZE,
                    CELL_SIZE
                );
            }
        }

        ctx.fill();
        ctx.closePath();
    };
})();
