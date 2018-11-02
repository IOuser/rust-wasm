const sharedMemoryWorker: Worker = self as any;


const enum Constants {
    x = 0,
    y = 1,
    dx = 2,
    dy = 3,
}


sharedMemoryWorker.addEventListener('message', function (event) {
    const {
        sharedBuffer,
        pointsCount,
        width,
        height,
    } = event.data;

    const subWidth = width * 0.5;
    const subHeight = height * 0.5;

    const sharedArrayLength = Math.floor(pointsCount * 4);
    const sharedArray = new Float32Array(sharedBuffer, 0, sharedArrayLength);
    console.log(sharedArray.length, sharedArray.byteLength)

    for (let i = 0; i < sharedArrayLength; i += 4) {
        sharedArray[i + Constants.x] = Math.random() * width - subWidth;
        sharedArray[i + Constants.y] = Math.random() * height - subHeight;
        sharedArray[i + Constants.dx] = Math.random() * 0.5 - 0.25;
        sharedArray[i + Constants.dy] = Math.random() * 0.5 - 0.25;
    }

    sharedMemoryWorker.postMessage('ready');

    let frameId;
    let lastT = 0;
    const renderLoop = () => {
        // fps.render();
        const t = performance.now();
        let dt = t - lastT;
        if (dt > 64) {
            dt = 64;
        }

        // particlesBox.tick(dt);
        lastT = t;

        // v.render(cells);


        for (let i = 0; i < sharedArrayLength; i += 4) {
            const x = i + Constants.x;
            const y = i + Constants.y;
            const dx = i + Constants.dx;
            const dy = i + Constants.dy;

            sharedArray[x] += sharedArray[dx] * dt;
            sharedArray[y] += sharedArray[dy] * dt;

            if (sharedArray[x] < -subWidth) {
                sharedArray[dx] = Math.abs(sharedArray[dx]);
            }

            if (sharedArray[x] > subWidth) {
                sharedArray[dx] = -Math.abs(sharedArray[dx]);
            }

            if (sharedArray[y] < -subHeight) {
                sharedArray[dy] = Math.abs(sharedArray[dy]);
            }

            if (sharedArray[y] > subHeight) {
                sharedArray[dy] = -Math.abs(sharedArray[dy]);
            }

            let k = 0.0007 * dt;
            sharedArray[dx] -= sharedArray[dx] * k;
            sharedArray[dy] -= sharedArray[dy] * k;

            let vec = Math.random() * 6.28;
            let amp = (Math.sqrt(Math.random() * 0.3 + 0.1) * 0.5 - 0.3) * 0.003 * dt;

            sharedArray[i + Constants.dx] += Math.sin(vec) * amp;
            sharedArray[i + Constants.dy] += Math.cos(vec) * amp;
        }

        frameId = setTimeout(renderLoop, 0);
    };

    renderLoop();
});


// class Particles {
//     points
//     constructor(sharedBuffer: SharedArrayBuffer) {

//     }
// }