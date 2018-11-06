import { Coord } from './types';
import { ISegment } from './segment';

export interface IPoint extends Coord {
    distance(point: IPoint): number;
    distanceSquared(point: IPoint): number;
    getSegment(): ISegment | null;
    setSegment(segment: ISegment): void;
    getPhi(): number;
}

export class Point implements IPoint {
    public x: number;
    public y: number;

    private _segment: ISegment | null = null;

    public constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public distance(point: IPoint): number {
        return Math.sqrt(this.distanceSquared(point));
    }

    public distanceSquared(point: IPoint): number {
        return (point.x - this.x) ** 2 + (point.y - this.y) ** 2;
    }

    public getSegment(): ISegment | null {
        return this._segment;
    }

    public setSegment(segment: ISegment): void {
        this._segment = segment;
    }

    public getPhi(): number {
        const { x, y } = this;
        const phi = Math.atan(y / x) || 0;

        if (x < 0) {
            return phi + Math.PI;
        }

        if (y < 0) {
            return phi + 2 * Math.PI;
        }

        return phi;
    }
}
