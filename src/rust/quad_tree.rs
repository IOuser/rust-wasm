use wasm_bindgen::prelude::*;

use std::fmt;
use std::ptr;

use super::aabb::*;
use super::point::Point;

// #[derive(Clone, Copy)]

#[wasm_bindgen]
pub struct QuadTree {
    pub _boundary: AABB,
    _points: Vec<*const Point>,

    pub _nw: *mut QuadTree,
    pub _ne: *mut QuadTree,
    pub _sw: *mut QuadTree,
    pub _se: *mut QuadTree,
}

#[wasm_bindgen]
impl QuadTree {
    pub fn new(aabb: AABB) -> QuadTree {
        QuadTree {
            _boundary: aabb,
            _points: vec![],
            _nw: ptr::null_mut(),
            _ne: ptr::null_mut(),
            _sw: ptr::null_mut(),
            _se: ptr::null_mut(),
        }
    }

    pub fn points(&self) -> *const *const Point {
        self._points.as_ptr()
    }

    pub fn len(&self) -> usize {
        self._points.len()
    }

    pub fn nw_len(&self) -> usize {
        unsafe { (*self._nw).len() }
    }

    pub fn ne_len(&self) -> usize {
        unsafe { (*self._ne).len() }
    }

    pub fn sw_len(&self) -> usize {
        unsafe { (*self._sw).len() }
    }

    pub fn se_len(&self) -> usize {
        unsafe { (*self._se).len() }
    }

    pub fn insert(&mut self, point: &Point) -> bool {
        if !self._boundary.contains(point) {
            return false;
        }

        if self._points.len() < 4 {
            self._points.push(point);
            return true;
        }

        if self._nw.is_null() {
            self._nw = &mut QuadTree::new(self._boundary.subdivide(AABBSide::NW));
            println!("new _nw");
            println!("{:p}", self._nw);
        }

        if self._ne.is_null() {
            self._ne = &mut QuadTree::new(self._boundary.subdivide(AABBSide::NE));
            println!("new _ne");
            println!("{:p}", self._ne);
        }

        if self._sw.is_null() {
            self._sw = &mut QuadTree::new(self._boundary.subdivide(AABBSide::SW));
            println!("new _sw");
            println!("{:p}", self._sw);
        }

        if self._se.is_null() {
            self._se = &mut QuadTree::new(self._boundary.subdivide(AABBSide::SE));
            println!("new se");
            println!("{:p}", self._se);
        }

        // // splitting
        while self._points.len() > 0 {
            let p = self._points.pop().unwrap();

            if p.is_null() {
                break;
            }

            unsafe {
                if !self._nw.is_null() {
                    if (*self._nw).insert(&*p) {
                        continue;
                    }
                }

                if !self._ne.is_null() {
                    if (*self._ne).insert(&*p) {
                        continue;
                    }
                }

                if !self._sw.is_null() {
                    if (*self._sw).insert(&*p) {
                        continue;
                    }
                }

                if !self._se.is_null() {
                    if (*self._se).insert(&*p) {
                        continue;
                    }
                }

                panic!("Something went wrong");
            }
        }

        // panic!("Something went wrong");

        unsafe {
            if (*self._nw).insert(point) {
                return true;
            }
            if (*self._ne).insert(point) {
                return true;
            }

            if (*self._sw).insert(point) {
                return true;
            }

            if (*self._se).insert(point) {
                return true;
            }
        }

        panic!("Something went wrong");
    }
}

impl fmt::Display for QuadTree {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "\n")?;

        unsafe {
            write!(f, "points {}\n", self.len())?;

            for p in &self._points {
                write!(f, "{}\n", **p)?;
            }

            write!(f, "  {:p}, empty: {}\n", self._nw, self._nw.is_null())?;
            write!(f, "  {:p}, empty: {}\n", self._ne, self._ne.is_null())?;
            write!(f, "  {:p}, empty: {}\n", self._sw, self._sw.is_null())?;
            write!(f, "  {:p}, empty: {}\n", self._se, self._se.is_null())?;

            if !self._nw.is_null() {
                write!(f, "{}", (*self._nw).len())?;
            }
        }

        // if !self._ne.is_null() {
        //     write!(f, "\n\t{}\n", *self._ne);
        // }

        write!(f, "\n")?;

        Ok(())
    }
}
