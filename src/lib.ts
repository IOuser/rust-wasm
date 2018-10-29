import { Universe, Cell } from 'rust-lib';

// 'rust-mem' is webpack wasm module
import { memory } from 'rust-mem';


export interface RustLib {
    memory: WebAssembly.Memory;
    Universe: typeof Universe;
    Cell: typeof Cell;
}

export async function init(): Promise<RustLib> {
    return {
        memory: memory,
        Universe: Universe,
        Cell: Cell,
    };
}
