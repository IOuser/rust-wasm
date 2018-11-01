// use wasm_bindgen::prelude::*;

use super::point::Point;
use super::aabb::AABB;

// #[derive(Clone, Copy)]
// #[wasm_bindgen]
pub struct QuadTree {
    pub _boundary: AABB,
    pub _points: Vec<*const Point>,

    pub _nw: Option<*const QuadTree>,
    pub _ne: Option<*const QuadTree>,
    pub _sw: Option<*const QuadTree>,
    pub _se: Option<*const QuadTree>,
}

impl QuadTree {
    pub fn new(aabb: AABB) -> QuadTree {
        QuadTree {
            _boundary: aabb,
            _points: vec![],
            _nw: None,
            _ne: None,
            _sw: None,
            _se: None,
        }
    }
}