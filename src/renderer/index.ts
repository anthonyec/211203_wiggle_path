import { DrawingGraph } from "../drawing_graph";
import { randomBetween } from "../lib/random";
import { createVector, Vector2 } from "../lib/vector2";

export function drawPoint(context: CanvasRenderingContext2D, position, radius = 5) {
  context.beginPath();
  context.arc(position.x, position.y, radius, 0, 2 * Math.PI);
  context.stroke();
}

export function drawLine(context: CanvasRenderingContext2D, positionA: Vector2, positionB: Vector2, properties?: object) {
  context.beginPath();
  context.moveTo(positionA.x, positionA.y);
  context.lineTo(positionB.x, positionB.y);
  context.stroke();
};

class Renderer {
  graph: DrawingGraph;
  context: CanvasRenderingContext2D;
  properties = {};

  constructor(context: CanvasRenderingContext2D, graph: DrawingGraph) {
    this.context = context;
    this.graph = graph;
  }

  getNodesWithEffectsApplied(nodes: Map<string, Vector2>) {
    return Array.from(nodes).reduce((mem, [nodeId, node]) => {
      const offset = 5;

      const randomOffset = createVector(
        randomBetween(-offset, offset),
        randomBetween(-offset, offset)
      );

      mem[nodeId] = node.add(randomOffset);

      return mem;
    }, {});
  }

  render() {
    const nodes = this.getNodesWithEffectsApplied(this.graph.nodes);

    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);

    const drawNodeAsPoint = (position) => {
      this.context.strokeStyle = 'white';
      this.context.lineWidth = 3;
      this.context.fillStyle = 'white';
      drawPoint(this.context, position);
    };

    const drawEdgeAsLine = ([fromNodeId, toNodeId], index) => {
      this.context.strokeStyle = 'white';
      this.context.lineWidth = 3;
      drawLine(this.context, nodes[fromNodeId], nodes[toNodeId]);
    };

    Object.values(nodes).forEach(drawNodeAsPoint);
    this.graph.edges.forEach(drawEdgeAsLine);
  }

  update() {
    this.render();
    window.requestAnimationFrame(this.update.bind(this));
  }

  start() {
    this.update();
  }
}

export default function createRenderer(
  context: CanvasRenderingContext2D,
  graph: DrawingGraph
) {
  const renderer = new Renderer(context, graph);

  return renderer;
}
