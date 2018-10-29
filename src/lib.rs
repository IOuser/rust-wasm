extern crate cfg_if;
extern crate wasm_bindgen;

mod utils;

use cfg_if::cfg_if;
use wasm_bindgen::prelude::*;
use std::fmt;

cfg_if! {
    // When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
    // allocator.
    if #[cfg(feature = "wee_alloc")] {
        extern crate wee_alloc;
        #[global_allocator]
        static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;
    }
}

// #[wasm_bindgen]
// extern {
//     fn alert(s: &str);
// }

// #[wasm_bindgen]
// pub fn greet() {
//     alert("Hello, {{project-name}}!");
// }

// struct Coord {
//     x: f32,
//     y: f32,
// }

// impl Coord {
//     fn sum(&self) -> f32 {
//         self.x + self.y
//     }
// }

// #[wasm_bindgen]
// pub fn add_one(mut x: f32, mut y: f32) -> f32 {
//     if x.is_nan() {
//         x = 0.0
//     }

//     if y.is_nan() {
//         y = 0.0
//     }

//     let p1 = Coord { x: x, y: y };
//     p1.sum()
// }

// Utils
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn time(name: &str);

    #[wasm_bindgen(js_namespace = console)]
    fn timeEnd(name: &str);
}

pub struct Timer<'a> {
    name: &'a str,
}

impl<'a> Timer<'a> {
    pub fn new(name: &'a str) -> Timer<'a> {
        time(name);
        Timer { name }
    }
}

impl<'a> Drop for Timer<'a> {
    fn drop(&mut self) {
        timeEnd(self.name);
    }
}

// // Life
// #[wasm_bindgen]
// #[repr(u8)]
// #[derive(Clone, Copy, Debug, PartialEq, Eq)]
// pub enum Cell {
//     Dead = 0,
//     Alive = 1,
// }

// #[wasm_bindgen]
// pub struct Universe {
//     width: u32,
//     height: u32,
//     cells: Vec<Cell>,
// }

// #[wasm_bindgen]
// impl Universe {
//     pub fn new() -> Universe {
//         let width = 128;
//         let height = 128;

//         let cells = (0..width * height)
//             .map(|i| {
//                 if i % 2 == 0 || i % 7 == 0 {
//                     Cell::Alive
//                 } else {
//                     Cell::Dead
//                 }
//             })
//             .collect();

//         Universe {
//             width,
//             height,
//             cells,
//         }
//     }

//     pub fn render(&self) -> String {
//         self.to_string()
//     }

//     pub fn width(&self) -> u32 {
//         self.width
//     }

//     pub fn height(&self) -> u32 {
//         self.height
//     }

//     pub fn cells(&self) -> *const Cell {
//         self.cells.as_ptr()
//     }

//     pub fn tick(&mut self) {
//         // let _timer = Timer::new("Universe::tick");

//         let mut next = {
//             // let _timer = Timer::new("allocate next cells");
//             self.cells.clone()
//         };

//         {
//             // let _timer = Timer::new("new generation");
//             for row in 0..self.height {
//                 for col in 0..self.width {
//                     let idx = self.get_index(row, col);
//                     let cell = self.cells[idx];
//                     let live_neighbors = self.live_neighbor_count(row, col);

//                     let next_cell = match (cell, live_neighbors) {
//                         // Rule 1: Any live cell with fewer than two live neighbours
//                         // dies, as if caused by underpopulation.
//                         (Cell::Alive, x) if x < 2 => Cell::Dead,
//                         // Rule 2: Any live cell with two or three live neighbours
//                         // lives on to the next generation.
//                         (Cell::Alive, 2) | (Cell::Alive, 3) => Cell::Alive,
//                         // Rule 3: Any live cell with more than three live
//                         // neighbours dies, as if by overpopulation.
//                         (Cell::Alive, x) if x > 3 => Cell::Dead,
//                         // Rule 4: Any dead cell with exactly three live neighbours
//                         // becomes a live cell, as if by reproduction.
//                         (Cell::Dead, 3) => Cell::Alive,
//                         // All other cells remain in the same state.
//                         (otherwise, _) => otherwise,
//                     };

//                     next[idx] = next_cell;
//                 }
//             }
//         }

//         // let _timer = Timer::new("free old cells");
//         self.cells = next;
//     }

//     fn get_index(&self, row: u32, column: u32) -> usize {
//         (row * self.width + column) as usize
//     }

//     // fn live_neighbor_count(&self, row: u32, column: u32) -> u8 {
//     //     let mut count = 0;
//     //     for delta_row in [self.height - 1, 0, 1].iter().cloned() {
//     //         for delta_col in [self.width - 1, 0, 1].iter().cloned() {
//     //             if delta_row == 0 && delta_col == 0 {
//     //                 continue;
//     //             }

//     //             let neighbor_row = (row + delta_row) % self.height;
//     //             let neighbor_col = (column + delta_col) % self.width;
//     //             let idx = self.get_index(neighbor_row, neighbor_col);
//     //             count += self.cells[idx] as u8;
//     //         }
//     //     }
//     //     count
//     // }

//     // faster impl
//     fn live_neighbor_count(&self, row: u32, column: u32) -> u8 {
//         let mut count = 0;

//         let north = if row == 0 { self.height - 1 } else { row - 1 };

//         let south = if row == self.height - 1 { 0 } else { row + 1 };

//         let west = if column == 0 {
//             self.width - 1
//         } else {
//             column - 1
//         };

//         let east = if column == self.width - 1 {
//             0
//         } else {
//             column + 1
//         };

//         let nw = self.get_index(north, west);
//         count += self.cells[nw] as u8;

//         let n = self.get_index(north, column);
//         count += self.cells[n] as u8;

//         let ne = self.get_index(north, east);
//         count += self.cells[ne] as u8;

//         let w = self.get_index(row, west);
//         count += self.cells[w] as u8;

//         let e = self.get_index(row, east);
//         count += self.cells[e] as u8;

//         let sw = self.get_index(south, west);
//         count += self.cells[sw] as u8;

//         let s = self.get_index(south, column);
//         count += self.cells[s] as u8;

//         let se = self.get_index(south, east);
//         count += self.cells[se] as u8;

//         count
//     }
// }

// impl fmt::Display for Universe {
//     fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
//         for line in self.cells.as_slice().chunks(self.width as usize) {
//             for &cell in line {
//                 let symbol = if cell == Cell::Dead { '◻' } else { '◼' };
//                 write!(f, "{}", symbol)?;
//             }
//             write!(f, "\n")?;
//         }

//         Ok(())
//     }
// }

// Particles
#[wasm_bindgen]
extern {
    #[wasm_bindgen(js_namespace = Math)]
    fn random() -> f32;

    #[wasm_bindgen(js_namespace = Math)]
    fn abs(v: f32) -> f32;

    #[wasm_bindgen(js_namespace = Math)]
    fn sin(v: f32) -> f32;

    #[wasm_bindgen(js_namespace = Math)]
    fn cos(v: f32) -> f32;

    #[wasm_bindgen(js_namespace = Math)]
    fn sqrt(v: f32) -> f32;

    #[wasm_bindgen(js_namespace = console)]
    fn log(name: &str);
}


#[wasm_bindgen]
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Particle {
    x: f32,
    y: f32,
    dx: f32,
    dy: f32,
}

impl fmt::Display for Particle {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "particle: ");
        write!(f, "x: {} ", self.x)?;
        write!(f, "y: {} ", self.y)?;
        write!(f, "dx: {} ", self.dx)?;
        write!(f, "dy: {} ", self.dy)?;
        write!(f, "\n")?;

        Ok(())
    }
}

#[wasm_bindgen]
pub struct ParticlesBox {
    width: u32,
    height: u32,
    particles: Vec<Particle>,
}

#[wasm_bindgen]
impl ParticlesBox {
    pub fn new(width: u32, height: u32, particles_count: u32) -> ParticlesBox {
        log(&format!("w: {}, h: {}", width, height));

        let sub_width = width as f32 / 2.0;
        let sub_height = height as f32 / 2.0;

        let particles = (0..particles_count)
            .map(|_i| {
                Particle {
                    x: random() * width as f32 - sub_width,
                    y: random() * height as f32 - sub_height,
                    dx: random() * 0.5 - 0.25,
                    dy: random() * 0.5 - 0.25,
                }
            })
            .collect();

        ParticlesBox {
            width,
            height,
            particles,
        }
    }

    pub fn particles(&self) -> *const Particle {
        self.particles.as_ptr()
    }

    pub fn tick(&mut self, dt: f32) {
        let len = self.particles.len();
        let sub_width = self.width as f32 / 2.0;
        let sub_height = self.height as f32 / 2.0;

        for i in 0..len {
            let p = &mut self.particles[i];
            p.x += p.dx * dt;
            p.y += p.dy * dt;

            if p.x < -sub_width {
                p.dx = abs(p.dx);
            }

            if p.x > sub_width as f32 {
                p.dx = -abs(p.dx);
            }

            if p.y < -sub_height {
                p.dy = abs(p.dy);
            }

            if p.y > sub_height as f32 {
                p.dy = -abs(p.dy);
            }

            p.dy -= 0.0001 * dt;
        }
    }

    pub fn trigger(&mut self, x: f32, y: f32) {
        let len = self.particles.len();
        // let sub_width = self.width as f32 / 2.0;
        // let sub_height = self.height as f32 / 2.0;

        for i in 0..len {
            let p = &mut self.particles[i];
            p.x = x;
            p.y = y;

            let amp = sqrt(random() * 0.5 - 0.25) * 0.5;
            let vec = random() * 2.0 * 3.14;
            p.dx = sin(vec) * amp;
            p.dy = cos(vec) * amp;
        }
    }
}