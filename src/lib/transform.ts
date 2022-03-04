import { createVector, Vector2 } from "./vector2";

export function rotatePointAroundPivot(point: Vector2, pivot: Vector2, degreesRad: number) {
  // Signed for clockwise rotation.
  const cos = Math.cos(-degreesRad);
  const sin = Math.sin(-degreesRad);
  const nx = (cos * (point.x - pivot.x)) + (sin * (point.y - pivot.y)) + pivot.x;
  const ny = (cos * (point.y - pivot.y)) - (sin * (point.x - pivot.x)) + pivot.y;

  return createVector(nx, ny);
}
