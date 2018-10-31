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
#[derive(Clone, Copy, PartialEq)]
pub struct AABBDimensions {
    pub x: f32,
    pub y: f32,
    pub width: f32,
    pub height: f32,
}

#[wasm_bindgen]
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

    pub fn intersects(&self, _other: &AABB) -> bool {
        // const aDims = this.fullDimensions();
        // const bDims = aabb.fullDimensions();

        // const aLeft = aDims.x;
        // const aRight = aDims.x + aDims.width;
        // const aTop = aDims.y;
        // const aBottom = aDims.y + aDims.height;

        // const bLeft = bDims.x;
        // const bRight = bDims.x + bDims.width;
        // const bTop = bDims.y;
        // const bBottom = bDims.y + bDims.height;

        // if (aLeft > bRight || aRight < bLeft || aTop > bBottom || aBottom < bTop) {
        //     return false;
        // }

        false
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
}