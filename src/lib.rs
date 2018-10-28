struct Coord {
    x: f32,
    y: f32,
}

impl Coord {
    fn sum(&self) -> f32 {
        self.x + self.y
    }
}

#[no_mangle]
pub fn add_one(n: f32) -> f32 {
    let p1 = Coord { x: n, y: n };
    p1.sum()
}
