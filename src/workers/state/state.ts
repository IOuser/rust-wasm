import { InitStateData, TriggerEventData } from './events';

export const enum Constants {
    x = 0,
    y = 1,
    dx = 2,
    dy = 3,
}

export class State {
    private _lastT = 0;
    private _frameId = null;

    private _particles;

    public init(data: InitStateData): void {
        console.log(`initEventHandler`);
        console.log(data);

        const { buffer: sharedBuffer, pointsCount: particlesCount, width, height } = data;

        const buffer = new Float32Array(sharedBuffer, 0, Math.floor(particlesCount * 4));

        this._particles = new Particles({
            buffer,
            particlesCount,
            width,
            height,
        });

        this._particles.init();

        this._render();
    }

    public trigger({ x, y }: TriggerEventData): void {
        this._particles.trigger(x, y);
    }

    private _render = () => {
        const t = performance.now();
        let dt = t - this._lastT;
        if (dt > 64) {
            dt = 64;
        }

        this._lastT = t;


        this._particles.update(dt);

        this._frameId = setImmediate(this._render);
    }
}

export type ParticlesParams = {
    buffer: Float32Array;
    particlesCount: number;
    width: number;
    height: number;
}

export class Particles {
    private _buffer: Float32Array;
    private _bufferLength: number;
    private _subWidth: number;
    private _subHeight: number;

    constructor(params: ParticlesParams) {
        const { buffer, particlesCount, width, height } = params;
        this._buffer = buffer;
        this._bufferLength = Math.floor(particlesCount * 4);
        this._subWidth = width / 2;
        this._subHeight = height / 2;
    }

    public init(): void {
        const buffer = this._buffer;
        const bufferLength = this._bufferLength;
        const subWidth = this._subWidth;
        const subHeight = this._subHeight;

        for (let i = 0; i < bufferLength; i += 4) {
            buffer[i + Constants.x] = Math.random() * subWidth * 2 - subWidth;
            buffer[i + Constants.y] = Math.random() * subHeight * 2 - subHeight;
            buffer[i + Constants.dx] = Math.random() * 0.5 - 0.25;
            buffer[i + Constants.dy] = Math.random() * 0.5 - 0.25;
        }

    }

    public update(dt: number): void {
        const buffer = this._buffer;
        const bufferLength = this._bufferLength;
        const subWidth = this._subWidth;
        const subHeight = this._subHeight;

        for (let i = 0; i < bufferLength; i += 4) {
            const x = i + Constants.x;
            const y = i + Constants.y;
            const dx = i + Constants.dx;
            const dy = i + Constants.dy;

            const cdx = buffer[dx];
            const cdy = buffer[dy];

            buffer[x] += cdx * dt;
            buffer[y] += cdy * dt;

            const cx = buffer[x];
            if (cx < -subWidth) {
                buffer[dx] = Math.abs(cdy);
            }

            if (cx > subWidth) {
                buffer[dx] = -Math.abs(cdy);
            }

            const cy = buffer[y];
            if (cy < -subHeight) {
                buffer[dy] = Math.abs(cdx);
            }

            if (cy > subHeight) {
                buffer[dy] = -Math.abs(cdx);
            }

            let k = 0.0007 * dt;
            buffer[dx] -= buffer[dx] * k;
            buffer[dy] -= buffer[dy] * k;

            let vec = Math.random() * 6.28;
            let amp = (Math.sqrt(Math.random() * 0.3 + 0.1) * 0.5 - 0.3) * 0.003 * dt;

            buffer[i + Constants.dx] += Math.sin(vec) * amp;
            buffer[i + Constants.dy] += Math.cos(vec) * amp;
        }
    }

    public trigger(x: number, y: number): void {
        const buffer = this._buffer;
        const bufferLength = this._bufferLength;

        for (let i = 0; i < bufferLength; i += 4) {
            buffer[i + Constants.x] = x;
            buffer[i + Constants.y] = y;

            const amp = Math.sqrt(Math.random() * 0.35) * 0.5;
            const vec = Math.random() * 2.0 * 3.14;
            buffer[i + Constants.dx] = Math.sin(vec) * amp;
            buffer[i + Constants.dy] = Math.cos(vec) * amp;
        }
    }
}
