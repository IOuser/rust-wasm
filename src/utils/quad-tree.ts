import { IPoint } from './point';
import { IAABB, AABBSide } from './aabb';

const enum Constants {
    NodeCapacity = 8,
}

export class QuadTree {
    private _boundary: IAABB;
    private _points: IPoint[] = [];

    private _nw: QuadTree | null = null;
    private _ne: QuadTree | null = null;
    private _sw: QuadTree | null = null;
    private _se: QuadTree | null = null;

    public constructor(boundary: IAABB) {
        this._boundary = boundary;
    }

    public renderNodes(buffer: Float32Array, bufferLength: number, getOffset: () => number, setOffset: (v: number) => void): void {
        if (process.env.NODE_ENV !== 'development') {
            return;
        }

        const offset = getOffset();
        if (offset + 16 > bufferLength) {
            console.log('linesBuffer overflow');
            return;
        }

        if (this._nw === null) {
            const { x, w, h } = this._boundary.dimensions;
            // TODO: Figureout
            let y = this._boundary.dimensions.y + h;

            // top line
            buffer[offset]      = x;
            buffer[offset + 1]  = y;
            buffer[offset + 2]  = x + w;
            buffer[offset + 3]  = y;

            // right line
            buffer[offset + 4]  = x + w;
            buffer[offset + 5]  = y;
            buffer[offset + 6]  = x + w;
            buffer[offset + 7]  = y - h;

            // bottom line
            buffer[offset + 8]  = x + w;
            buffer[offset + 9]  = y - h;
            buffer[offset + 10] = x;
            buffer[offset + 11] = y - h;

            // left line
            buffer[offset + 12] = x ;
            buffer[offset + 13] = y - h;
            buffer[offset + 14] = x;
            buffer[offset + 15] = y;

            setOffset(offset + 16);
            return;
        }

        this._nw!.renderNodes(buffer, bufferLength, getOffset, setOffset);
        this._ne!.renderNodes(buffer, bufferLength, getOffset, setOffset);
        this._sw!.renderNodes(buffer, bufferLength, getOffset, setOffset);
        this._se!.renderNodes(buffer, bufferLength, getOffset, setOffset);
    }

    public reset(): void {
        this._points = [];
        this._nw = null;
        this._ne = null;
        this._sw = null;
        this._se = null;
    }

    public insert(point: IPoint): boolean {
        if (!this._boundary.contains(point)) {
            return false;
        }

        const points = this._points;

        if (points.length < Constants.NodeCapacity) {
            points.push(point);
            return true;
        }

        if (
            this._nw === null ||
            this._ne === null ||
            this._sw === null ||
            this._se === null
        ) {
            this._nw = new QuadTree(this._boundary.subdivide(AABBSide.NW));
            this._ne = new QuadTree(this._boundary.subdivide(AABBSide.NE));
            this._sw = new QuadTree(this._boundary.subdivide(AABBSide.SW));
            this._se = new QuadTree(this._boundary.subdivide(AABBSide.SE));
        }

        while (points.length) {
            const currentPoint = points.shift();
            if (currentPoint === undefined) {
                break;
            }

            if (
                this._nw.insert(currentPoint) ||
                this._ne.insert(currentPoint) ||
                this._sw.insert(currentPoint) ||
                this._se.insert(currentPoint)
            ) {
                continue;
            }

            throw Error('Wrong sub tree range');
        }

        return (
            this._nw.insert(point) ||
            this._ne.insert(point) ||
            this._sw.insert(point) ||
            this._se.insert(point)
        );
    }

    // public queryRange(range: IAABB): IPoint[] {
    //     // debugger
    //     const result: IPoint[] = [];

    //     if (!this._boundary.intersectsAABB(range)) {
    //         return result;
    //     }

    //     for (const point of this._points) {
    //         if (range.containsPoint(point)) {
    //             result.push(point);
    //         }
    //     }

    //     if (this._northWest === null) {
    //         return result;
    //     }

    //     return [
    //         ...result,
    //         ...this._northWest!.queryRange(range),
    //         ...this._northEast!.queryRange(range),
    //         ...this._southWest!.queryRange(range),
    //         ...this._southEast!.queryRange(range),
    //     ];
    // }

    // public outerRange(range: IAABB): IPoint[] {
    //     const result: IPoint[] = [];

    //     // Add "isSubBound" method to AABB
    //     // if (this._boundary.intersectsAABB(range)) {
    //     //     return result;
    //     // }

    //     for (const point of this._points) {
    //         if (!range.containsPoint(point)) {
    //             result.push(point);
    //         }
    //     }

    //     if (this._northWest === null) {
    //         return result;
    //     }

    //     return [
    //         ...result,
    //         ...this._northWest!.outerRange(range),
    //         ...this._northEast!.outerRange(range),
    //         ...this._southWest!.outerRange(range),
    //         ...this._southEast!.outerRange(range),
    //     ];
    // }
}
