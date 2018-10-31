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

#[test]
fn aabb_intersects() {
    let hs = HalfSize::new(1.0, 1.0);
    let aabb = AABB::new(Point::new(1.0, 1.0), hs);

    // basic cases
    let aabb1 = AABB::new(Point::new(0.0, 1.0), hs);
    assert!(aabb.intersects(&aabb1) == true);

    let aabb2 = AABB::new(Point::new(0.0, 4.0), hs);
    assert!(aabb.intersects(&aabb2) == false);

    // Y edge cases
    let aabb3 = AABB::new(Point::new(0.0, 3.0), hs);
    assert!(aabb.intersects(&aabb3) == true);

    let aabb4 = AABB::new(Point::new(0.0, -1.0), hs);
    assert!(aabb.intersects(&aabb4) == true);

    // X edge cases
    let aabb5 = AABB::new(Point::new(3.0, 0.0), hs);
    assert!(aabb.intersects(&aabb5) == true);

    let aabb6 = AABB::new(Point::new(-1.0, 0.0), hs);
    assert!(aabb.intersects(&aabb6) == true);

    // XY edge cases
    let aabb7 = AABB::new(Point::new(-1.0, 3.0), hs);
    assert!(aabb.intersects(&aabb7) == true);

    let aabb8 = AABB::new(Point::new(3.0, 3.0), hs);
    assert!(aabb.intersects(&aabb8) == true);

    let aabb9 = AABB::new(Point::new(-1.0, -1.0), hs);
    assert!(aabb.intersects(&aabb9) == true);

    let aabb10 = AABB::new(Point::new(3.0, -1.0), hs);
    assert!(aabb.intersects(&aabb10) == true);
}

#[test]
fn aabb_contains() {
    let aabb = AABB::new(Point::new(1.0, 1.0), HalfSize::new(1.0, 1.0));

    // inside
    assert!(aabb.contains(&Point::new(1.0, 1.0)) == true);
    assert!(aabb.contains(&Point::new(0.5, 0.5)) == true);

    // outside
    assert!(aabb.contains(&Point::new(-1.0, -1.0)) == false);

    // edge cases
    assert!(aabb.contains(&Point::new(0.0, 3.0)) == false);
    assert!(aabb.contains(&Point::new(0.0, 2.0)) == true);
    assert!(aabb.contains(&Point::new(0.0, 1.0)) == true);
    assert!(aabb.contains(&Point::new(0.0, 0.0)) == true);
    assert!(aabb.contains(&Point::new(3.0, 0.0)) == false);
    assert!(aabb.contains(&Point::new(2.0, 0.0)) == true);
    assert!(aabb.contains(&Point::new(1.0, 0.0)) == true);
    assert!(aabb.contains(&Point::new(0.0, 0.0)) == true);
}