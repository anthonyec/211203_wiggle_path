import { DrawingGraph } from "../drawing_graph";
import { randomBetween } from "../lib/random";
import { createVector, Vector2 } from "../lib/vector2";

const BASE_POINT_PROPERTIES = { offset: 0, wave: { speed: 1, amplitude: 5 } };
const BASE_LINE_PROPERTIES = { segments: 100, wiggliness: 0, wave: { speed: 1, amplitude: 5 }  };

export function drawPoint(context: CanvasRenderingContext2D, position, properties?) {
  const radius = 5;
  context.beginPath();
  context.arc(position.x, position.y, radius, 0, 2 * Math.PI);
  context.stroke();
}

export function drawLine(context: CanvasRenderingContext2D, positionA: Vector2, positionB: Vector2, properties?) {
  // context.beginPath();
  // context.moveTo(positionA.x, positionA.y);
  // context.lineTo(positionB.x, positionB.y);
  // context.stroke();

  const segments = properties.segments;
  const wiggliness = properties.wiggliness;

  // if (segments === 0 || wiggliness === 0) {
  //   context.beginPath();
  //   context.moveTo(positionA.x, positionA.y);
  //   context.lineTo(positionB.x, positionB.y);
  //   context.stroke();
  //   return;
  // }

  const distance = positionA.distanceTo(positionB);
  const segmentPercent = (distance / segments) / distance;
  const lineBetween = positionB.sub(positionA).scale(segmentPercent);
  const perpendicularLine = lineBetween.perpendicular().normalize();

  let lastPosition = positionA;

  for (let i = 0; i < segments; i++) {
    const sin = Math.sin((properties.time * 1) + (i / 2)) * 10
    const sin2 = Math.sin((properties.time * 1) + ((i + 1) / 2)) * 10
    // context.strokeStyle = 'red';
    // context.beginPath();
    // context.moveTo(lastPosition.x, lastPosition.y);
    // context.lineTo(...lastPosition.add(perpendicularLine.scale(sin)).components());
    // context.stroke();

    const nextPosition = lastPosition
      .add(lineBetween)
      .add(perpendicularLine.scale(randomBetween(-wiggliness, wiggliness)))

    context.beginPath();
    context.moveTo(...lastPosition.add(perpendicularLine.scale(sin)).components());

    if (i === segments - 1) {
      context.lineTo(...positionB.components());
    } else {
      context.lineTo(...nextPosition.add(perpendicularLine.scale(sin2)).components());
    }

    context.stroke();

    lastPosition = nextPosition;
  };
};

class Renderer {
  time: number = 0;
  graph: DrawingGraph;
  context: CanvasRenderingContext2D;
  properties = new Map();

  constructor(context: CanvasRenderingContext2D, graph: DrawingGraph) {
    this.context = context;
    this.graph = graph;
  }

  getNodesWithEffectsApplied(nodes: Map<string, Vector2>) {
    // TODO: May not need to be reduce!
    return Array.from(nodes).reduce((mem, [nodeId, node], index) => {
      const properties = {
        ...BASE_POINT_PROPERTIES,
        ...this.properties.get(nodeId)
      };
      const randomOffset = createVector(
        randomBetween(-properties.offset, properties.offset),
        randomBetween(-properties.offset, properties.offset)
      );
      const xPercent = (node.x % 11) / 10;
      const yPercent = (node.y % 11) / 10;

      const waveOffset = createVector(
        Math.cos(this.time * (properties.wave.speed * xPercent)) * properties.wave.amplitude,
        Math.sin(this.time * (properties.wave.speed * yPercent)) * properties.wave.amplitude,
      );

      // console.log(Math.sin(this.time / 1000));

      mem[nodeId] = node.add(randomOffset).add(waveOffset);

      return mem;
    }, {});
  }

  render() {
    const nodes = this.getNodesWithEffectsApplied(this.graph.nodes);

    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    // this.context.fillStyle = 'rgba(0, 0, 0, 0.4)';
    // this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);

    const drawNodeAsPoint = ([_, position]) => {
      this.context.strokeStyle = 'white';
      this.context.lineWidth = 3;
      this.context.fillStyle = 'white';

      drawPoint(this.context, position);
    };

    const drawEdgeAsLine = ([fromNodeId, toNodeId]) => {
      const deterministicEdgeId = this.graph.getDeterministicEdgeId(fromNodeId, toNodeId);
      const properties = this.properties.get(deterministicEdgeId);

      this.context.strokeStyle = 'white';
      this.context.lineWidth = 3;
      drawLine(this.context, nodes[fromNodeId], nodes[toNodeId], {...BASE_LINE_PROPERTIES, time: this.time, ...properties});
    };

    Object.entries(nodes).forEach(drawNodeAsPoint);
    this.graph.edges.forEach(drawEdgeAsLine);
  }

  update() {
    this.time += 0.16;
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
