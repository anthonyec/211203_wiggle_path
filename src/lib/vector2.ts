export class Vector2 {
  x: number;
  y: number;

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

  add(b) {
    return createVector(this.x + b.x, this.y + b.y);
  }

  sub(b) {
    return createVector(this.x - b.x, this.y - b.y);
  }

  distanceTo(b) {
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
}

export function createVector(...args) {
  return new Vector2(...args);
}

export function mouseEventToVector(event: MouseEvent) {
  return createVector(event.offsetX, event.offsetY);
}
