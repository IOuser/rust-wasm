extern crate cfg_if;

use std::fmt;
use wasm_bindgen::prelude::*;

// * from ./timer.rs
use super::timer::*;
// use super::utils::*;

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

    #[wasm_bindgen(js_namespace = Math)]
    fn floor(v: f32) -> f32;

    #[wasm_bindgen(js_namespace = console)]
    fn log(name: &str);
}

#[wasm_bindgen]
#[derive(Clone, Copy)]
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
        log(&format!("w: {}, h: {}, l: {}", width, height, particles_count));

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

        // log(&format!("{}", self.particles[0]));
        // log(&format!("{}",
        //     (
        //         (
        //             sqrt(self.particles[0].dx.powi(2) + self.particles[0].dy.powi(2)) * 200.0
        //         ).max(5.0)
        //     ).min(20.0))
        // );

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

            let k = 0.0007 * dt;
            p.dx -= p.dx * k;
            p.dy -= p.dy * k;


            // https://www.wolframalpha.com/input/?i=plot+sqrt(x+*+0.4+%2B+0.1))+*+0.5,++0+%3C+x+%3C+1
            let amp = sqrt(random() * 0.3 + 0.1) * 0.5 - 0.3;
            let vec = random() * 2.0 * 3.14;
            p.dx += sin(vec) * amp * 0.003 * dt;
            p.dy += cos(vec) * amp * 0.003 * dt;


            // p.dy -= 0.0001 * dt;
        }
    }

    pub fn trigger(&mut self, x: f32, y: f32) {
        // set_panic_hook();
        // log(&format!("{} {}", len, self.particles[0]));
        // panic!("{}, {}", x, y);
        let _timer = Timer::new("Trigger");
        let len = self.particles.len();

        for i in 0..len {
            let p = &mut self.particles[i];
            p.x = x;
            p.y = y;

            let amp = sqrt(random() * 0.35) * 0.5;
            let vec = random() * 2.0 * 3.14;
            p.dx = sin(vec) * amp;
            p.dy = cos(vec) * amp;
        }
    }
}

