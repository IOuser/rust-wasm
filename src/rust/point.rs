use wasm_bindgen::prelude::*;

use std::fmt;

#[wasm_bindgen]
#[derive(Clone, Copy)]
pub struct Point {
    pub x: f32,
    pub y: f32,
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

impl fmt::Display for Point {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "[x: {}, y: {}]", self.x, self.y)?;

        Ok(())
    }
}