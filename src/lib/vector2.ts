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

  /**
   * Returns the `x` and `y` of components of the vector as an array.
   *
   * Example:
   * Arrays can be spread instead of specifying each component.
   * ```js
   * context.rect(...position.components(), ...size.components())
   * ```
   */
  components(): [number, number] {
    return [this.x, this.y]
  }

  /** Negates the vector.
   *
   * Example: `(10, 4)` becomes `(-10, -4)`
   * */
  negate() {
    return createVector(-this.x, -this.y);
  }

  /**
   * Find the length of the vector.
   */
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Multiples each component of the vector by a scaler.
   */
  scale(scalar: number) {
    return createVector(this.x * scalar, this.y * scalar);
  }

  /**
   * Changes the vectors length so that it is always `1`.
   */
  normalize() {
    const magnitude = this.magnitude();

    // TODO: Make a var describing what is 1e-9.
    if (Math.abs(magnitude) < 1e-9) {
      return createVector(0, 0);
    } else {
      return createVector(this.x / magnitude, this.y / magnitude);
    }
  }

  /**
   * Add two vectors together.
   */
  add(b: Vector2) {
    return createVector(this.x + b.x, this.y + b.y);
  }

  /**
   * Subtract two vectors from each other.
   */
  sub(b: Vector2) {
    return createVector(this.x - b.x, this.y - b.y);
  }

  /**
   * Find the distance between two vectors.
   */
  distanceTo(b: Vector2) {
    const difference = this.sub(b);
    return Math.sqrt(difference.x * difference.x + difference.y * difference.y);
  }

  /**
   * Get a vector that is perpendicular to the vector.
   */
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

  /**
   * Use a function on each of the components of the vector. The component
   * value will be the first argument.
   *
   * Example: `position.applyFunction(Math.ceil)`
   */
  applyFunction(func: any, args: any[]) {
    return createVector(
      func(this.x, ...args),
      func(this.y, ...args),
    )
  }
}

export function createVector(x: number = 0, y: number = 0) {
  return new Vector2(x, y);
}

export function mouseEventToVector(event: MouseEvent) {
  return createVector(event.offsetX, event.offsetY);
}
