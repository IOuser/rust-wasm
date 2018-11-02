use wasm_bindgen::prelude::*;

use super::point::Point;
use super::point::Point as HalfSize;

#[wasm_bindgen]
#[repr(u8)]
pub enum AABBSide {
    NW,
    NE,
    SW,
    SE,
}

#[wasm_bindgen]
#[derive(Clone, Copy)]
pub struct AABBDimensions {
    pub x: f32,
    pub y: f32,
    pub width: f32,
    pub height: f32,
}

#[wasm_bindgen]
#[derive(Clone, Copy)]
pub struct AABB {
    pub dimensions: AABBDimensions,
    pub center: Point,
    half_size: HalfSize,
}

#[wasm_bindgen]
impl AABB {
    pub fn new(center: Point, half_size: HalfSize) -> AABB {
        let x = center.x - half_size.x;
        let y = center.y - half_size.y;
        let width = half_size.x * 2.0;
        let height = half_size.y * 2.0;
        let dimensions = AABBDimensions {
            x,
            y,
            width,
            height,
        };

        AABB {
            dimensions,
            center,
            half_size,
        }
    }

    pub fn subdivide(&self, side: AABBSide) -> AABB {
        let x = self.center.x;
        let y = self.center.y;
        let half_width = self.half_size.x;
        let half_height = self.half_size.y;


        let quad_width = half_width / 2.0;
        let quad_height = half_height / 2.0;
        let half_size = HalfSize::new(quad_width, quad_height);

        match side {
            AABBSide::NW => AABB::new(Point::new(x - quad_width, y - quad_height), half_size),
            AABBSide::NE => AABB::new(Point::new(x + quad_width, y - quad_height), half_size),
            AABBSide::SW => AABB::new(Point::new(x - quad_width, y + quad_height), half_size),
            AABBSide::SE => AABB::new(Point::new(x + quad_width, y + quad_height), half_size),
        }
    }

    pub fn intersects(&self, other: &AABB) -> bool {
        let a_dims = self.dimensions;
        let b_dims = other.dimensions;

        let a_left = a_dims.x;
        let a_right = a_dims.x + a_dims.width;
        let a_top = a_dims.y;
        let a_bottom = a_dims.y + a_dims.height;

        let b_left = b_dims.x;
        let b_right = b_dims.x + b_dims.width;
        let b_top = b_dims.y;
        let b_bottom = b_dims.y + b_dims.height;

        if a_left > b_right || a_right < b_left || a_top > b_bottom || a_bottom < b_top {
            return false;
        }

        true
    }

    pub fn contains(&self, point: &Point) -> bool {
        let left = self.dimensions.x;
        let right = self.dimensions.x + self.dimensions.width;
        let top = self.dimensions.y;
        let bottom = self.dimensions.y + self.dimensions.height;

        return !(point.x < left || point.x > right || point.y < top || point.y > bottom)
    }
}