import { DrawingGraph } from "../drawing_graph";
import { randomBetween } from "../lib/random";
import { createVector, Vector2 } from "../lib/vector2";

const BASE_POINT_PROPERTIES = { offset: 0, wave: { speed: 1, amplitude: 5 } };
const BASE_LINE_PROPERTIES = { segments: 10, wiggliness: 5, wave: { speed: 1, amplitude: 5 }  };

export function drawPoint(context: CanvasRenderingContext2D, position, properties?) {
  const radius = 5;
  context.beginPath();
  context.arc(position.x, position.y, radius, 0, 2 * Math.PI);
  context.stroke();
}

export function drawLine(context: CanvasRenderingContext2D, positionA: Vector2, positionB: Vector2, properties?) {
  const { segments, wiggliness, time } = properties;

  const line = positionB.sub(positionA);
  const normalizedPerpendicularLine = line.perpendicular().normalize();

  let lastJoinPosition = positionA;

  // Plus one to include end joint.
  for (let i = 0; i < segments + 1; i++) {
    const originalJointPosition = positionA.add(line.scale(i / segments));
    const notAtEndJoints = i !== 0 && i !== segments;

    let nextJointPosition = originalJointPosition;

    if (notAtEndJoints) {
      nextJointPosition = originalJointPosition.add(normalizedPerpendicularLine.scale(
        randomBetween(-wiggliness, wiggliness)
      ));
    }

    // Debug show joints and indexes.
    context.strokeStyle = 'red';
    drawPoint(context, nextJointPosition);
    context.fillText(`${i}`, nextJointPosition.x + 10, nextJointPosition.y - 5)
    context.strokeStyle = 'white';

    context.beginPath();
    context.moveTo(...lastJoinPosition.components());
    context.lineTo(...nextJointPosition.components());
    context.stroke();

    lastJoinPosition = nextJointPosition;
  }
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
