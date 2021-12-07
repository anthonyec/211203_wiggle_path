import { drawLine, drawPoint } from './drawing';
import createDrawingGraph from './drawing_graph';
import { createCanvas2D } from './lib/canvas';
import { createVector } from './lib/vector2';

// TODO: Disable hot-reload in parcel so I don't need to do this.
document.body.innerHTML = '';

const [canvas, context] = createCanvas2D();
const drawing = createDrawingGraph(context);

const zero = drawing.addNode(createVector(100, 100));
const one = drawing.addNode(createVector(100, 200));
const two = drawing.addNode(createVector(150, 150));
const three = drawing.addNode(createVector(200, 100));
const four = drawing.addNode(createVector(200, 200));

const a = drawing.addNode(createVector(600, 600));
const b = drawing.addNode(createVector(620, 620));
const c = drawing.addNode(createVector(630, 630));

drawing.addEdge(zero, one);
drawing.addEdge(one, two);
drawing.addEdge(two, zero);
drawing.addEdge(zero, three);
drawing.addEdge(two, four);

drawing.addEdge(a, b);
drawing.addEdge(b, c);

drawing.getAllConnectedNodes(a);

drawing.nodes.forEach((position, nodeId) => {
  context.strokeStyle = 'white';
  context.lineWidth = 3;
  context.fillStyle = 'white';
  context.fillText(nodeId, position.x + 10, position.y - 10);
  drawPoint(context, position);
});

drawing.edges.forEach(([fromNodeId, toNodeId]) => {
  context.strokeStyle = 'white';
  context.lineWidth = 3;
  drawLine(context, drawing.getNode(fromNodeId), drawing.getNode(toNodeId))
});
