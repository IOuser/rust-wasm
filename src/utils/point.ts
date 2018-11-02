import { Coord } from './types';

export interface IPoint extends Coord {

    distance(point: Point): number;
    // TODO: Add more points methods;
}

export class Point implements IPoint {
    public x: number;
    public y: number;

    public constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public distance(point: IPoint): number {
        return Math.sqrt((point.x - this.x) ** 2 + (point.y - this.y) ** 2);
    }
}
