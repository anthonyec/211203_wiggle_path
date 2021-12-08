import { Vector2 } from "../lib/vector2";

class SpatialStructure {
  spatialHash = new Map();

  constructor() {}

  add(id: string, position: Vector2) {

  }

  remove(id: string) {

  }

  update(id: string, position: Vector2) {

  }

  hit(position: Vector2) {

  }

  hitWithinBounds(position: Vector2, size: Vector2) {

  }
}

export default function createSpatialStructure() {
  return new SpatialStructure();
}
