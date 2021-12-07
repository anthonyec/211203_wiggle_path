import { createVector, Vector2 } from "./vector2";

export function rotatePointAroundPivot(point: Vector2, pivot: Vector2, rotation: number) {
  // Signed for clockwise rotation.
  const cos = Math.cos(-rotation);
  const sin = Math.sin(-rotation);
  const nx = (cos * (point.x - pivot.x)) + (sin * (point.y - pivot.y)) + pivot.x;
  const ny = (cos * (point.y - pivot.y)) - (sin * (point.x - pivot.x)) + pivot.y;

  return createVector(nx, ny);
}
