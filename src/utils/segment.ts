import { IPoint } from './point';

export interface ISegment {
    getPoints(): [IPoint, IPoint];
}

export class Segment implements ISegment {
    private _p1: IPoint;
    private _p2: IPoint;

    public constructor(p1: IPoint, p2: IPoint) {
        this._p1 = p1;
        this._p2 = p2;

        this._p1.setSegment(this);
        this._p2.setSegment(this);
    }

    public getPoints(): [IPoint, IPoint] {
        return [
            this._p1,
            this._p2,
        ];
    }
}
