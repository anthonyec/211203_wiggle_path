import { DrawingGraph } from "../drawing_graph";
import { createVector, Vector2 } from "../lib/vector2";

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class SpatialStructure {
  spatial = {};

  // TODO: Implement real spatial hashing when performance becomes a problem.
  cellSize = 400;

  constructor() {}

  add(id: string, position: Vector2) {

  }

  remove(id: string) {

  }

  update(id: string, position: Vector2) {

  }

  getHashKey(position: Vector2) {
    const x = Math.round(position.x / this.cellSize) * this.cellSize;
    const y = Math.round(position.y / this.cellSize) * this.cellSize;

    return `${x}:${y}`;
  }

  parseFromGraph(graph: DrawingGraph) {
    this.spatial = [];

    graph.nodes.forEach((position, nodeId) => {
      this.spatial[nodeId] = position;
    });
  }

  hitWithinRadius(position: Vector2, radius: number) {
    // TODO: Use reduce instead to avoid extra .map?
    const nodes = Object.entries(this.spatial).filter(([_, nodePosition]) => {
      // TODO: Fix type.
      return position.distanceTo(nodePosition) < radius;
    });

    return nodes.map((node) => {
      return node[0];
    });
  }

  hitWithinBounds(position: Vector2, size: Vector2) {
    // TODO: Use reduce instead to avoid extra .map?
    const nodes = Object.entries(this.spatial).filter(([_, nodePosition]) => {
      // TODO: Fix type.
      const withinX = nodePosition.x > position.x && nodePosition.x < position.x + size.x;
      const withinY = nodePosition.y > position.y && nodePosition.y < position.y + size.y;

      return withinX && withinY;
    });

    return nodes.map((node) => {
      return node[0];
    });
  }

  getBoundingBox(nodeIds: string[]): Rect {
    const x = nodeIds.map(nodeId => this.spatial[nodeId].x);
    const y = nodeIds.map(nodeId => this.spatial[nodeId].y);

    const minX = Math.min(...x);
    const maxX = Math.max(...x);
    const minY = Math.min(...y);
    const maxY = Math.max(...y);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  }
}

export default function createSpatialStructure() {
  return new SpatialStructure();
}
