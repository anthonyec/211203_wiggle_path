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

  const distance = positionA.distanceTo(positionB);
  const segmentPercent = (distance / segments) / distance;
  const lineBetween = positionB.sub(positionA).scale(segmentPercent);
  const line = positionB.sub(positionA);
  const perpendicularLine = lineBetween.perpendicular().normalize();

  const total = segments + 1;

  let lastPosition = positionA;

  for (let i = 0; i < total; i++) {
    const jointPosition = positionA.add(line.scale(i / segments));
    const notEndJoints = i !== 0 && i !== segments;

    let newJointPosition = jointPosition;

    if (notEndJoints) {
      newJointPosition = jointPosition.add(perpendicularLine.scale(
        randomBetween(-wiggliness, wiggliness)
      ));
    }

    drawPoint(context, newJointPosition);
    context.fillText(`${i}`, newJointPosition.x + 10, newJointPosition.y)

    context.beginPath();
    context.moveTo(...lastPosition.components());
    context.lineTo(...newJointPosition.components());
    context.stroke();

    lastPosition = newJointPosition;

    // let nextPosition = lastPosition.add(lineBetween);
    // const isFirstLine = i === 0;
    // const isLastLine = i === (segments - 1);

    // // if (!isFirstLine) {
    // //   lastPosition = lastPosition.add(perpendicularLine.scale(-30));
    // // }

    // // if (!isLastLine) {
    // //   lastPosition = nextPosition.add(perpendicularLine.scale(-30));
    // // }


    // context.strokeStyle = 'red';
    // drawPoint(context, nextPosition);
    // context.fillText(`${i}`, nextPosition.x + 10, nextPosition.y)

    // lastPosition = nextPosition;
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
