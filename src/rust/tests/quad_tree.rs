use rust::point::Point;
use rust::point::Point as HalfSize;
use rust::aabb::*;
use rust::quad_tree::*;

#[test]
fn quad_tree_0() {

    let p0 = Point::new(0.5, 0.5);
    let p1 = Point::new(0.5, 0.5);
    let p2 = Point::new(0.5, 0.5);
    let p3 = Point::new(0.5, 0.5);
    let p4 = Point::new(0.7, 0.7);

    let aabb = AABB::new(Point::new(0.0, 0.0), HalfSize::new(1.0, 1.0));
    let mut qt = QuadTree::new(aabb);


    assert_eq!(true, qt.insert(&p0));
    assert_eq!(true, qt.insert(&p1));
    assert_eq!(true, qt.insert(&p2));
    assert_eq!(true, qt.insert(&p3));
    assert_eq!(true, qt.insert(&p4));
    // assert_eq!(0, qt.len());
    // assert_eq!(0, qt.nw_len());
    // assert_eq!(0, qt.ne_len());
    // assert_eq!(0, qt.sw_len());
    // assert_eq!(0, qt.se_len());

    // assert_eq!(0.5, p0.x);



    println!("{}", qt);

}