use rust::point::Point;
use rust::point::Point as HalfSize;
use rust::aabb::*;

#[test]
fn aabb_subdivide_nw() {
    let aabb = AABB::new(Point::new(0.0, 0.0), HalfSize::new(1.0, 1.0));
    let nw_aabb = aabb.subdivide(AABBSide::NW);

    assert_eq!(-0.5, nw_aabb.center.x);
    assert_eq!(-0.5, nw_aabb.center.y);
    assert_eq!(1.0, nw_aabb.dimensions.width);
    assert_eq!(1.0, nw_aabb.dimensions.height);
}

#[test]
fn aabb_subdivide_ne() {
    let aabb = AABB::new(Point::new(0.0, 0.0), HalfSize::new(1.0, 1.0));
    let ne_aabb = aabb.subdivide(AABBSide::NE);

    assert_eq!(0.5, ne_aabb.center.x);
    assert_eq!(-0.5, ne_aabb.center.y);
    assert_eq!(1.0, ne_aabb.dimensions.width);
    assert_eq!(1.0, ne_aabb.dimensions.height);
}

#[test]
fn aabb_subdivide_sw() {
    let aabb = AABB::new(Point::new(0.0, 0.0), HalfSize::new(1.0, 1.0));
    let sw_aabb = aabb.subdivide(AABBSide::SW);

    assert_eq!(-0.5, sw_aabb.center.x);
    assert_eq!(0.5, sw_aabb.center.y);
    assert_eq!(1.0, sw_aabb.dimensions.width);
    assert_eq!(1.0, sw_aabb.dimensions.height);
}

#[test]
fn aabb_subdivide_se() {
    let aabb = AABB::new(Point::new(0.0, 0.0), HalfSize::new(1.0, 1.0));
    let se_aabb = aabb.subdivide(AABBSide::SE);

    assert_eq!(0.5, se_aabb.center.x);
    assert_eq!(0.5, se_aabb.center.y);
    assert_eq!(1.0, se_aabb.dimensions.width);
    assert_eq!(1.0, se_aabb.dimensions.height);
}
