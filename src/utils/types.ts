export interface Coord {
    x: number;
    y: number;
};

export interface Size {
    w: number;
    h: number;
}

export type Dimensions = Coord & Size;
