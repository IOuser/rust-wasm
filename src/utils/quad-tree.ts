import { IAABB, AABBSide } from './aabb';
import { Coord } from './types';

const enum Constants {
    NodeCapacity = 8,
}

export class QuadTree<T extends Coord> {
    private _boundary: IAABB;
    private _items: T[] = [];

    private _nw: QuadTree<T> | null = null;
    private _ne: QuadTree<T> | null = null;
    private _sw: QuadTree<T> | null = null;
    private _se: QuadTree<T> | null = null;

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
        this._items = [];
        this._nw = null;
        this._ne = null;
        this._sw = null;
        this._se = null;
    }

    public insert(item: T): boolean {
        if (!this._boundary.contains(item)) {
            return false;
        }

        const items = this._items;

        if (items.length < Constants.NodeCapacity) {
            items.push(item);
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

        while (true) {
            const tempItem = items.shift();
            if (tempItem === undefined) {
                break;
            }

            if (
                this._nw.insert(tempItem) ||
                this._ne.insert(tempItem) ||
                this._sw.insert(tempItem) ||
                this._se.insert(tempItem)
            ) {
                continue;
            }

            throw Error('Wrong sub tree range');
        }

        return (
            this._nw.insert(item) ||
            this._ne.insert(item) ||
            this._sw.insert(item) ||
            this._se.insert(item)
        );
    }

    public traverse(callback: (items: T[]) => void): void {
        if (this._items.length > 0) {
            callback(this._items);
        }

        if (this._nw === null) {
            return;
        }

        this._nw!.traverse(callback);
        this._ne!.traverse(callback);
        this._sw!.traverse(callback);
        this._se!.traverse(callback);
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
