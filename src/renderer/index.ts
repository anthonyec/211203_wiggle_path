import { DrawingGraph } from "../drawing_graph";
import { sinWave } from "../lib/math";
import { randomBetween } from "../lib/random";
import { createVector, Vector2 } from "../lib/vector2";

const BASE_POINT_PROPERTIES = { jitter: 2, wave: { speed: 1, amplitude: 1 } };
const BASE_LINE_PROPERTIES = { segments: 2, jitter: 0, wave: { speed: 2, amplitude: 1 }, taper: false  };

export function drawPoint(context: CanvasRenderingContext2D, position, properties?) {
  const radius = 5;
  context.beginPath();
  context.arc(position.x, position.y, radius, 0, 2 * Math.PI);
  context.stroke();
}

export function drawLine(context: CanvasRenderingContext2D, positionA: Vector2, positionB: Vector2, properties?) {
  let { segments, jitter, time, wave, taper } = properties;

  const line = positionB.sub(positionA);
  const normalizedPerpendicularLine = line.perpendicular().normalize();

  const autoSegments = Math.floor((line.magnitude() / 100) / 0.2);

  // TODO: Make controls for this?
  // segments = autoSegments;

  let lastJoinPosition = positionA;

  // Plus one to include end joint.
  context.beginPath();
  for (let i = 0; i < segments + 1; i++) {
    const percent = i / segments;
    const percentFromMiddle = taper ? 0.5 - Math.abs((percent - 0.5)) : 1;
    const originalJointPosition = positionA.add(line.scale(percent));
    const notAtEndJoints = i !== 0 && i !== segments;

    let nextJointPosition = originalJointPosition;

    if (notAtEndJoints) {
      nextJointPosition = originalJointPosition.add(normalizedPerpendicularLine.scale(
        sinWave(properties.time, wave.speed, wave.amplitude, i) * percentFromMiddle
      )).add(
        normalizedPerpendicularLine.scale(
          randomBetween(-jitter, jitter) * percentFromMiddle
        )
      );
    }

    // Debug show joints and indexes.
    // context.strokeStyle = 'red';
    // drawPoint(context, nextJointPosition);
    // context.fillText(`${percentFromMiddle.toFixed(2)}`, nextJointPosition.x + 10, nextJointPosition.y - 5)
    // context.strokeStyle = 'white';

    if (i === 0) {
      context.moveTo(...lastJoinPosition.components());
    } else {
      context.lineTo(...lastJoinPosition.components());
    }

    context.lineTo(...nextJointPosition.components());

    lastJoinPosition = nextJointPosition;
  }
  context.stroke();
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

  setProperties(nodeId, properties: object) {
    const existingProperties = this.properties.get(nodeId);

    // TODO: Do deep merge to not override wave!
    this.properties.set(nodeId, {
      ...existingProperties,
      ...properties
    })
  }

  getNodesWithEffectsApplied(nodes: Map<string, Vector2>) {
    // TODO: May not need to be reduce!
    return Array.from(nodes).reduce((mem, [nodeId, node], index) => {
      const properties = {
        ...BASE_POINT_PROPERTIES,
        ...this.properties.get(nodeId)
      };
      const randomOffset = createVector(
        randomBetween(-properties.jitter, properties.jitter),
        randomBetween(-properties.jitter, properties.jitter)
      );
      const xPercent = (node.x % 11) / 10;
      const yPercent = (node.y % 11) / 10;

      const waveOffset = createVector(
        Math.cos(this.time * (properties.wave.speed * xPercent)) * properties.wave.amplitude,
        Math.sin(this.time * (properties.wave.speed * yPercent)) * properties.wave.amplitude,
      );

      mem[nodeId] = node.add(randomOffset).add(waveOffset);

      return mem;
    }, {});
  }

  render() {
    const nodes = this.getNodesWithEffectsApplied(this.graph.nodes);

    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    this.context.imageSmoothingEnabled = false;
    this.context.lineCap = 'round';
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
    this.time += 0.16; // TODO: Add real delta time here.
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
