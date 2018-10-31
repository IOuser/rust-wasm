use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Point {
    x: f32,
    y: f32,
}

#[wasm_bindgen]
impl Point {
    pub fn new(x: f32, y: f32) -> Point {
        Point {
            x,
            y,
        }
    }

    pub fn distance(&self, point: &Point) -> f32 {
        let diff_x = point.x - self.x;
        let diff_y = point.y - self.y;
        (diff_x.powi(2) + diff_y.powi(2)).sqrt()
    }
}
