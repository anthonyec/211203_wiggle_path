import { drawLine, drawPoint } from './drawing';
import createDrawingGraph from './drawing_graph';
import { createCanvas2D } from './lib/canvas';
import { createVector } from './lib/vector2';

// TODO: Disable hot-reload in parcel so I don't need to do this.
document.body.innerHTML = '';

const [canvas, context] = createCanvas2D();
const drawing = createDrawingGraph(context);

const a = drawing.addNode(createVector(30, 30));
const b = drawing.addNode(createVector(100, 100));
const c = drawing.addNode(createVector(300, 50));
const d = drawing.addNode(createVector(200, 500));

const one = drawing.addNode(createVector(600, 600));
const two = drawing.addNode(createVector(620, 610));
const three = drawing.addNode(createVector(640, 630));

const rocket = drawing.addNode(createVector(400, 600));
const r1 = drawing.addNode(createVector(450, 600));
const r2 = drawing.addNode(createVector(400, 650));
const r3 = drawing.addNode(createVector(350, 650));
const r4 = drawing.addNode(createVector(450, 650));
const r5 = drawing.addNode(createVector(500, 650));

drawing.addEdge(rocket, r1);
drawing.addEdge(r1, r4);
drawing.addEdge(r4, r5);
drawing.addEdge(r4, r2);
drawing.addEdge(r2, r3);
drawing.addEdge(rocket, r3);
drawing.addEdge(rocket, r2);

drawing.addEdge(a, b);
drawing.addEdge(b, c);
drawing.addEdge(c, a);

drawing.addEdge(b, d);
drawing.addEdge(d, b);

// drawing.removeNode(d);
// drawing.removeEdge(b, d);

drawing.addEdge(one, two);
drawing.addEdge(two, three);

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
