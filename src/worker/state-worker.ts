import { initStateEvent, InitStateData } from "./events";


const enum Constants {
    x = 0,
    y = 1,
    dx = 2,
    dy = 3,
}


self.addEventListener('message', function (event) {
    const { data: { type, data } } = event;

    console.assert(type);

    switch(type) {
        case initStateEvent.toString():
            return initEventHandler(data);
    }
});

function initEventHandler(data: InitStateData): void {
    console.log(`state ${initStateEvent}`);
    console.log(data);

    const { buffer, pointsCount, width, height } = data;

    const subWidth = width * 0.5;
    const subHeight = height * 0.5;

    const sharedArrayLength = Math.floor(pointsCount * 4);
    const sharedArray = new Float32Array(buffer, 0, sharedArrayLength);
    // console.log(sharedArray.length, sharedArray.byteLength)

    for (let i = 0; i < sharedArrayLength; i += 4) {
        sharedArray[i + Constants.x] = Math.random() * width - subWidth;
        sharedArray[i + Constants.y] = Math.random() * height - subHeight;
        sharedArray[i + Constants.dx] = Math.random() * 0.5 - 0.25;
        sharedArray[i + Constants.dy] = Math.random() * 0.5 - 0.25;
    }

    let frameId;
    let lastT = 0;
    const renderLoop = () => {
        const t = performance.now();
        let dt = t - lastT;
        if (dt > 64) {
            dt = 64;
        }

        lastT = t;

        for (let i = 0; i < sharedArrayLength; i += 4) {
            const x = i + Constants.x;
            const y = i + Constants.y;
            const dx = i + Constants.dx;
            const dy = i + Constants.dy;

            const cdx = sharedArray[dx];
            const cdy = sharedArray[dy];

            sharedArray[x] += cdx * dt;
            sharedArray[y] += cdy * dt;

            const cx = sharedArray[x];
            if (cx < -subWidth) {
                sharedArray[dx] = Math.abs(cdx);
            }

            if (cx > subWidth) {
                sharedArray[dx] = -Math.abs(cdx);
            }

            const cy = sharedArray[y];
            if (cy < -subHeight) {
                sharedArray[dy] = Math.abs(cdx);
            }

            if (cy > subHeight) {
                sharedArray[dy] = -Math.abs(cdy);
            }

            let k = 0.0007 * dt;
            sharedArray[dx] -= sharedArray[dx] * k;
            sharedArray[dy] -= sharedArray[dy] * k;

            let vec = Math.random() * 6.28;
            let amp = (Math.sqrt(Math.random() * 0.3 + 0.1) * 0.5 - 0.3) * 0.003 * dt;

            sharedArray[i + Constants.dx] += Math.sin(vec) * amp;
            sharedArray[i + Constants.dy] += Math.cos(vec) * amp;
        }


        frameId = requestAnimationFrame(renderLoop);
    }

    renderLoop();
}



// class Particles {
//     points
//     constructor(sharedBuffer: SharedArrayBuffer) {

//     }
// }


// const {
//     sharedBuffer,
//     pointsCount,
//     width,
//     height,
// } = event.data;

// const subWidth = width * 0.5;
// const subHeight = height * 0.5;

// const sharedArrayLength = Math.floor(pointsCount * 4);
// const sharedArray = new Float32Array(sharedBuffer, 0, sharedArrayLength);
// console.log(sharedArray.length, sharedArray.byteLength)

// for (let i = 0; i < sharedArrayLength; i += 4) {
//     sharedArray[i + Constants.x] = Math.random() * width - subWidth;
//     sharedArray[i + Constants.y] = Math.random() * height - subHeight;
//     sharedArray[i + Constants.dx] = Math.random() * 0.5 - 0.25;
//     sharedArray[i + Constants.dy] = Math.random() * 0.5 - 0.25;
// }

// ctx.postMessage('ready');

// let frameId;
// let lastT = 0;
// const renderLoop = () => {
//     // fps.render();


//     frameId = requestAnimationFrame(renderLoop);
// };

// renderLoop();