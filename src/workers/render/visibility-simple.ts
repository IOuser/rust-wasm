interface IPoint {
    x: number;
    y: number;
}

interface ISegment {
    toPoints(): [IPoint, IPoint];
}

interface IGeometry {
    toSegments(): ISegment[];
}

class Visibility {
    private _checkRadius: number = 200;

    private _origin: IPoint;

    private _segments: ISegment[];
    private _points: IPoint[]; // TODO: Filter equal points;

    private static _getIntersection(p1: IPoint, p2: IPoint, p3: IPoint, p4: IPoint): (IPoint & { param: number }) | null {
            // RAY in parametric: Point + Delta*T1
            const r_px = p1.x;
            const r_py = p1.y;
            const r_dx = p2.x - p1.x;
            const r_dy = p2.y - p1.y;

            // SEGMENT in parametric: Point + Delta*T2
            const s_px = p3.x;
            const s_py = p3.y;
            const s_dx = p4.x - p3.x;
            const s_dy = p4.y - p3.y;

            // Are they parallel? If so, no intersect
            // Droped Math.sqrt
            var r_mag_squared = r_dx * r_dx + r_dy * r_dy;
            var s_mag_squared = s_dx * s_dx + s_dy * s_dy;
            if (r_dx / r_mag_squared == s_dx / s_mag_squared && r_dy / r_mag_squared == s_dy / s_mag_squared) {
                // Unit vectors are the same.
                return null;
            }

            // SOLVE FOR T1 & T2
            // r_px+r_dx*T1 = s_px+s_dx*T2 && r_py+r_dy*T1 = s_py+s_dy*T2
            // ==> T1 = (s_px+s_dx*T2-r_px)/r_dx = (s_py+s_dy*T2-r_py)/r_dy
            // ==> s_px*r_dy + s_dx*T2*r_dy - r_px*r_dy = s_py*r_dx + s_dy*T2*r_dx - r_py*r_dx
            // ==> T2 = (r_dx*(s_py-r_py) + r_dy*(r_px-s_px))/(s_dx*r_dy - s_dy*r_dx)
            var T2 = (r_dx * (s_py - r_py) + r_dy * (r_px - s_px)) / (s_dx * r_dy - s_dy * r_dx);
            var T1 = (s_px + s_dx * T2 - r_px) / r_dx;

            // Must be within parametic whatevers for RAY/SEGMENT
            if (T1 < 0) return null;
            if (T2 < 0 || T2 > 1) return null;

            // Return the POINT OF INTERSECTION
            return {
                x: r_px + r_dx * T1,
                y: r_py + r_dy * T1,
                param: T1
            };
        }

    public sweep(): any[] {
        const angles = this._getAngles();
        const { x, y } = this._origin

        // RAYS IN ALL DIRECTIONS
        let intersects = [];
        for (const angle of angles) {
            // Calculate dx & dy from angle
            const dx = Math.cos(angle);
            const dy = Math.sin(angle);

            // Ray from light coord to point coord
            const p1 = { x, y };
            const p2 = { x: x + dx, y: y + dy };

                // b: { x: sightX + dx, y: sightY + dy }
            // };

            // Find CLOSEST intersection
            let closestIntersect = null;
            for (const segment of this._segments) {
                const intersect = Visibility._getIntersection(p1, p2, ...segment.toPoints());
                if (intersect === null) {
                    continue;
                }

                // param (aka distance)
                if (!closestIntersect || intersect.param < closestIntersect.param) {
                    closestIntersect = intersect;
                }
            }

            // Intersect angle
            if (closestIntersect === null) {
                continue;
            }

            closestIntersect.angle = angle;

            // Add to list of intersects
            intersects.push(closestIntersect);
        }

        // Sort intersects by angle
        intersects = intersects.sort((a: any, b: any) => a.angle - b.angle);

        // Polygon is intersects, in order of angle
        return intersects;
    }

    public setOrigin(p: IPoint): void {
        this._origin = p;
    }

    public loadMap(geometry: IGeometry[]): void {
        for (const el of geometry) {
            this._addSegments(el.toSegments());
        }
    }

    private _addSegments(segments: ISegment[]): void {
        for (const segment of segments) {
            this._addSegment(segment);
        }
    }

    private _addSegment(segment: ISegment): void {
        this._segments.push(segment)
        this._points.push(...segment.toPoints());
    }

    // TODO: cache
    private _getAngles(): number[] {
        const angles = [];

        const { x: sightX, y: sightY } = this._origin;
        for (const { x, y } of this._points) {
            const angle = Math.atan2(y - sightY, x - sightX);
            angles.push(angle - 0.00001, angle, angle + 0.00001);
        }

        return angles;
    }
}