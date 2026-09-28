import type Mtk from "gi://Mtk";

export class Area {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    isWithin(other: Area): boolean {
        return (
            this.x >= other.x &&
            this.y >= other.y &&
            this.x + this.width <= other.x + other.width &&
            this.y + this.height <= other.y + other.height
        );
    }

    isEqual(other: Area): boolean {
        return this.x == other.x && this.y == other.y && this.width == other.width && this.height == other.height;
    }

    isEqualHorizontally(other: Area): boolean {
        return this.x == other.x && this.width == other.width;
    }

    isEqualVertically(other: Area): boolean {
        return this.y == other.y && this.height == other.height;
    }

    static fromRectangle(rect: Mtk.Rectangle): Area {
        return new Area(rect.x, rect.y, rect.width, rect.height);
    }
}
