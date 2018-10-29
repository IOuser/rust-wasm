import { ParticlesBox } from 'rust-lib';

// 'rust-mem' is webpack wasm module
import { memory } from 'rust-mem';


export interface RustLib {
    memory: WebAssembly.Memory;
    ParticlesBox: typeof ParticlesBox;
}

export async function init(): Promise<RustLib> {
    return {
        memory: memory,
        ParticlesBox: ParticlesBox,
    };
}
