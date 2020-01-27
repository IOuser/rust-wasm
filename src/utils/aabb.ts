// import { IPoint, Point } from './point';
import { Dimensions, Size, Coord } from './types';

export const enum AABBSide {
    NW,
    NE,
    SW,
    SE,
}

// AxisAlignedBoundingBox
export interface IAABB {
    readonly dimensions: Readonly<Dimensions>;

    subdivide(part: AABBSide): IAABB;
    intersects(other: IAABB): boolean;
    contains(coord: Coord): boolean;
}

export class AABB implements IAABB {
    public readonly dimensions: Readonly<Dimensions>;

    private _center: Coord;
    private _halfSize: Size;

    public constructor(center: Coord, halfSize: Size) {
        this.dimensions = {
            x: center.x - halfSize.w,
            y: center.y - halfSize.h,
            w: halfSize.w * 2.0,
            h: halfSize.h * 2.0,
        };

        this._center = center;
        this._halfSize = halfSize;
    }

    public subdivide(side: AABBSide): IAABB {
        const { x, y } = this._center;
        const { w: halfW, h: halfH } = this._halfSize;
        const quadW = halfW / 2;
        const quadH = halfH / 2;
        const halfDimension = { w: quadW, h: quadH };

        switch (true) {
            case side === AABBSide.NW:
                return new AABB({ x: x - quadW, y: y - quadH }, halfDimension);
            case side === AABBSide.NE:
                return new AABB({ x: x + quadW, y: y - quadH }, halfDimension);
            case side === AABBSide.SW:
                return new AABB({ x: x - quadW, y: y + quadH }, halfDimension);
            case side === AABBSide.SE:
                return new AABB({ x: x + quadW, y: y + quadH }, halfDimension);
            default:
                throw TypeError('side is not AABBSide');
        }
    }

    public intersects(aabb: IAABB): boolean {
        const aDims = this.dimensions;
        const bDims = aabb.dimensions;

        const aLeft = aDims.x;
        const aRight = aDims.x + aDims.w;
        const aTop = aDims.y;
        const aBottom = aDims.y + aDims.h;

        const bLeft = bDims.x;
        const bRight = bDims.x + bDims.w;
        const bTop = bDims.y;
        const bBottom = bDims.y + bDims.h;

        if (aLeft > bRight || aRight < bLeft || aTop > bBottom || aBottom < bTop) {
            return false;
        }

        return true;
    }

    public contains(coord: Coord): boolean {
        const { x, y } = coord;
        const { w: halfW, h: halfH } = this._halfSize;
        const left = this._center.x - halfW;
        const right = this._center.x + halfW;
        const top = this._center.y - halfH;
        const bottom = this._center.y + halfH;

        return !(x < left || x > right || y < top || y > bottom);
    }
}
