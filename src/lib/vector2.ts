export class Vector2 {
  x: number;
  y: number;

  static ZERO = createVector(0, 0);
  static UP = createVector(0, -1);
  static DOWN = createVector(0, 1);
  static LEFT = createVector(-1, 0);
  static RIGHT = createVector(1, 0);

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  components(): [number, number] {
    return [this.x, this.y]
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  scale(scalar: number) {
    return createVector(this.x * scalar, this.y * scalar);
  }

  normalize() {
    const magnitude = this.magnitude();

    // TODO: Make a var describing what is 1e-9.
    if (Math.abs(magnitude) < 1e-9) {
      return createVector(0, 0);
    } else {
      return createVector(this.x / magnitude, this.y / magnitude);
    }
  }

  add(b: Vector2) {
    return createVector(this.x + b.x, this.y + b.y);
  }

  sub(b: Vector2) {
    return createVector(this.x - b.x, this.y - b.y);
  }

  distanceTo(b: Vector2) {
    const difference = this.sub(b);
    return Math.sqrt(difference.x * difference.x + difference.y * difference.y);
  }

  perpendicular() {
    return createVector(
      this.y, -this.x
    );
  }

  abs() {
    return createVector(Math.abs(this.x), Math.abs(this.y));
  }

  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  angleTo(b: Vector2) {
    return b.sub(this).angle();
  }

  floor() {
    return createVector(
      Math.floor(this.x),
      Math.floor(this.y)
    )
  }
}

export function createVector(x: number = 0, y: number = 0) {
  return new Vector2(x, y);
}

export function mouseEventToVector(event: MouseEvent) {
  return createVector(event.offsetX, event.offsetY);
}
