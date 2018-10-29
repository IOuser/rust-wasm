extern crate cfg_if;
extern crate wasm_bindgen;

mod utils;

use cfg_if::cfg_if;
use wasm_bindgen::prelude::*;

cfg_if! {
    // When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
    // allocator.
    if #[cfg(feature = "wee_alloc")] {
        extern crate wee_alloc;
        #[global_allocator]
        static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;
    }
}

#[wasm_bindgen]
extern {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, {{project-name}}!");
}

struct Coord {
    x: f32,
    y: f32,
}

impl Coord {
    fn sum(&self) -> f32 {
        self.x + self.y + 1.25
    }
}

#[wasm_bindgen]
pub fn add_one(n: f32) -> f32 {
    let p1 = Coord { x: n, y: n };
    p1.sum()
}
