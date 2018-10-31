use rust::point::Point;

#[test]
fn point_distance_0() {
    let p1 = Point::new(-1.0, -1.0);
    let p2 = Point::new(2.0, 3.0);
    assert_eq!(5.0, p1.distance(&p2));
}

#[test]
fn point_distance_1() {
    let p1 = Point::new(0.0, 0.0);
    let p2 = Point::new(3.0, 4.0);
    assert_eq!(5.0, p1.distance(&p2));
}

#[test]
fn point_distance_2() {
    let p1 = Point::new(0.0, 0.0);
    let p2 = Point::new(0.0, 0.0);
    assert_eq!(0.0, p1.distance(&p2));
}
