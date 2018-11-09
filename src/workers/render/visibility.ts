const { cos, sin, PI, atan2 } = Math;

export interface IPoint {
    x: number;
    y: number;
}

export class Point implements IPoint {
    public static readonly SIZE: number = 2;

    public x: number;
    public y: number;

    public constructor(x: number = 0.0, y: number = 0.0) {
        this.x = x;
        this.y = y;
    }
}

export interface IEndPoint extends IPoint {
    visualize: boolean;
    angle: number;
    segment: ISegment | null;
    begin: boolean;
}

export class EndPoint extends Point implements IEndPoint {
    public static readonly SIZE: number = 2;

    public x: number;
    public y: number;

    public visualize: boolean = false;
    public angle: number = 0.0;
    public segment: ISegment | null = null;
    public begin: boolean = false;

    public constructor(x: number = 0.0, y: number = 0.0) {
        super(x, y);
    }
}

export interface ISegment {
    p1: IEndPoint;
    p2: IEndPoint;
    // squared distance to light point
    d: number;
}

export class Segment implements ISegment {
    public static readonly SIZE: number = 4;

    public p1: IEndPoint;
    public p2: IEndPoint;
    public d: number = 0.0;

    public constructor(p1: IEndPoint, p2: IEndPoint) {
        this.p1 = p1;
        this.p2 = p2;

        p1.segment = this;
        p2.segment = this;
    }
}

type BlockSegments = [ISegment, ISegment, ISegment, ISegment];

export interface IBlock extends IPoint {
    r: number;

    getSegments(): BlockSegments;
    toBuffer(buffer: Float32Array, offset: number): void;
}

export class Block extends Point implements IBlock {
    public static readonly SIZE: number = 16;

    public x: number;
    public y: number;
    public r: number;

    private _segments: BlockSegments | null = null;

    public constructor(x: number = 0.0, y: number = 0.0, r: number = 50.0) {
        super(x, y);
        this.r = r;
    }

    public getSegments(): BlockSegments {
        if (this._segments === null) {
            const { x, y, r } = this;
            this._segments = [
                new Segment(new EndPoint(x - r, y - r), new EndPoint(x - r, y + r)),
                new Segment(new EndPoint(x - r, y + r), new EndPoint(x + r, y + r)),
                new Segment(new EndPoint(x + r, y + r), new EndPoint(x + r, y - r)),
                new Segment(new EndPoint(x + r, y - r), new EndPoint(x - r, y - r)),
            ];
        }

        return this._segments;
    }

    public toBuffer(buffer: Float32Array, offset: number): void {
        const segments = this.getSegments();

        segments.forEach((segment: ISegment, i: number) => {
            const segmentOffset = offset + i * Segment.SIZE;
            const { p1, p2 } = segment;
            buffer.fill(p1.x, segmentOffset + 0);
            buffer.fill(p1.y, segmentOffset + 1);
            buffer.fill(p2.x, segmentOffset + 2);
            buffer.fill(p2.y, segmentOffset + 3);
        });
    }
}

export class Visibility {
    private _segments: ISegment[] = [];
    private _endpoints: IEndPoint[] = [];
    private _open: ISegment[] = [];

    private _center: IPoint = new Point(0.0, 0.0);

    private _output: IPoint[] = [];
    private _intersections: [IPoint, IPoint, IPoint, IPoint][] = [];

    private static _endpointsCompare(a: IEndPoint, b: IEndPoint): number {
        if (a.angle > b.angle) return 1;
        if (a.angle < b.angle) return -1;
        if (!a.begin && b.begin) return 1;
        if (a.begin && !b.begin) return -1;
        return 0;
    }

    private static _leftOf(s: ISegment, p: IPoint): boolean {
        const cross = (s.p2.x - s.p1.x) * (p.y - s.p1.y) - (s.p2.y - s.p1.y) * (p.x - s.p1.x);
        return cross < 0;
    }

    private static _interpolate(p1: IPoint, p2: IPoint, f: number): IPoint {
        return new Point(
            p1.x * (1 - f) + p2.x * f,
            p1.y * (1 - f) + p2.y * f
        );
    }

    private static _lineIntersection(p1: IPoint, p2: IPoint, p3: IPoint, p4: IPoint): IPoint {
        var s = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / ((p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y));
        return new Point(p1.x + s * (p2.x - p1.x), p1.y + s * (p2.y - p1.y));
    }

    public loadMap(edgeOfMap: IBlock, blocks: IBlock[], walls: ISegment[]): void {
        this._segments = [];
        this._endpoints = [];

        for (const block of [edgeOfMap, ...blocks]) {
            const [s1, s2, s3, s4] = block.getSegments();
            this._addSegment(s1);
            this._addSegment(s2);
            this._addSegment(s3);
            this._addSegment(s4);
        }

        for (const wall of walls) {
            this._addSegment(wall);
        }
    }

    public setLightLocation(p: IPoint): void {
        const { x, y } = p;
        this._center = new Point(x, y);

        for (const segment of this._segments) {
            const dx = 0.5 * (segment.p1.x + segment.p2.x) - x;
            const dy = 0.5 * (segment.p1.y + segment.p2.y) - y;

            segment.d = dx * dx + dy * dy;

            const { p1, p2 } = segment;
            p1.angle = atan2(p1.y - y, p1.x - x);
            p2.angle = atan2(p2.y - y, p2.x - x);

            let dAngle = p2.angle - p1.angle;
            if (dAngle <= -PI) {
                dAngle += 2 * PI;
            }

            if (dAngle > PI) {
                dAngle -= 2 * PI;
            }

            p1.begin = dAngle > 0.0;
            p2.begin = !p1.begin;
        }
    }

    // loop over endpoints:
    //     remember which wall is nearest
    //     add any walls that BEGIN at this endpoint to 'walls'
    //     remove any walls that END at this endpoint from 'walls'

    //     figure out which wall is now nearest
    //     if the nearest wall changed:
    //         fill the current triangle and begin a new one
    public sweep(maxAngle: number = 999.0): void {
        // clear output
        this._output = [];
        this._intersections = [];

        // prepare tmps
        this._open = [];
        this._endpoints = this._endpoints.sort(Visibility._endpointsCompare);

        let beginAngle = 0.0;

        for (let pass = 0; pass < 2; pass++) {
            for (const p of this._endpoints) {
                if (pass === 1 && p.angle > maxAngle) {
                    break;
                }

                let currentOld;
                if(this._open.length === 0) {
                    currentOld = null;
                } else {
                    // current_old = this.open.head.val;
                    currentOld = this._open[this._open.length - 1];
                }

                if (p.begin) {
                    let i = 0;
                    let segment = this._open[i];
                    while(segment !== undefined && this._segmentInFrontOf(p.segment, segment, this._center)) {
                        i++;
                        segment = segment[i];
                    }

                    if (segment == null) {
                        this._open.push(p.segment);
                    } else {
                        // this.open.insertBefore(segment, p.segment);
                        this._open.splice(i, 0, p.segment);
                    }
                } else {
                    // this.open.remove(p.segment);
                    const index = this._open.indexOf(p.segment);
                    if (index > -1) {
                        this._open.splice(index, 1);
                    }
                }

                let currentNew;
                if (this._open.length === 0) {
                    currentNew = null;
                } else {
                    // current_new = this.open.head.val;
                    currentNew = this._open[this._open.length - 1];
                }

                if(currentOld !== currentNew) {
                    if (pass == 1) {
                        this._addTriangle(beginAngle, p.angle, currentOld);
                    }

                    beginAngle = p.angle;
                }
            }
        }
    }

    public getOutput(): IPoint[] {
        return [this._center, ...this._output];
    }

    public getIntersects(): IPoint[] {
        const o = [];

        for(const i of this._intersections) {
            o.push(...i);
        }

        return o;
    }

    private _addSegment(segment: ISegment): void {
        const { p1, p2 } = segment;
        p1.visualize = true;
        p2.visualize = false;
        this._segments.push(segment);
        this._endpoints.push(p1, p2);
    }

    private _segmentInFrontOf(a: ISegment, b: ISegment, relativeTo: IPoint): boolean {
        const A1 = Visibility._leftOf(a, Visibility._interpolate(b.p1, b.p2, 0.01));
        const A2 = Visibility._leftOf(a, Visibility._interpolate(b.p2, b.p1, 0.01));
        const A3 = Visibility._leftOf(a, relativeTo);
        const B1 = Visibility._leftOf(b, Visibility._interpolate(a.p1, a.p2, 0.01));
        const B2 = Visibility._leftOf(b, Visibility._interpolate(a.p2, a.p1, 0.01));
        const B3 = Visibility._leftOf(b, relativeTo);

        if (B1 == B2 && B2 != B3) return true;
        if (A1 == A2 && A2 == A3) return true;
        if (A1 == A2 && A2 != A3) return false;
        if (B1 == B2 && B2 == B3) return false;

        this._intersections.push([a.p1, a.p2, b.p1, b.p2]);

        return false;
    }

    private _addTriangle(angle1: number, angle2: number, segment: ISegment | null = null): void {
        const center = this._center;
        var p2 = new Point(center.x + Math.cos(angle1), center.y + Math.sin(angle1));
        var p3 = new Point(0.0, 0.0);
        var p4 = new Point(0.0, 0.0);

        if (segment !== null) {
            p3.x = segment.p1.x;
            p3.y = segment.p1.y;
            p4.x = segment.p2.x;
            p4.y = segment.p2.y;
        } else {
            p3.x = center.x + cos(angle1) * 500;
            p3.y = center.y + sin(angle1) * 500;
            p4.x = center.x + cos(angle2) * 500;
            p4.y = center.y + sin(angle2) * 500;
        }

        const p1 = center;
        const pBegin = Visibility._lineIntersection(p3, p4, p1, p2);

        p2.x = center.x + cos(angle2);
        p2.y = center.y + sin(angle2);
        const pEnd = Visibility._lineIntersection(p3, p4, p1, p2);

        this._output.push(pBegin, pEnd);
    }
}