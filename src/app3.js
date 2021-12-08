import { drawLine, drawPoint } from './drawing';
import createDrawingGraph from './drawing_graph';
import createSpatialStructure from './spatial_structure';
import createRenderer from './renderer';
import { createCanvas2D } from './lib/canvas';
import { createVector, mouseEventToVector } from './lib/vector2';
import { randomBetween } from './lib/random';

// TODO: Disable hot-reload in parcel so I don't need to do this.
document.body.innerHTML = '';

const [canvas, context] = createCanvas2D();
const spatial = createSpatialStructure();
const drawing = createDrawingGraph();
const renderer = createRenderer(context, drawing);

const zero = drawing.addNode(createVector(100, 100));
const one = drawing.addNode(createVector(100, 200));
const two = drawing.addNode(createVector(150, 150));
const three = drawing.addNode(createVector(200, 100));
const four = drawing.addNode(createVector(200, 200));

const a = drawing.addNode(createVector(100, 400));
const b = drawing.addNode(createVector(420, 620));
const c = drawing.addNode(createVector(650, 630));
const d = drawing.addNode(createVector(700, 300));

drawing.addEdge(zero, one);
drawing.addEdge(one, two);
drawing.addEdge(two, zero);
drawing.addEdge(zero, three);
drawing.addEdge(two, four);

drawing.addEdge(a, b);
drawing.addEdge(b, c);
drawing.addEdge(a, d);

spatial.parseFromGraph(drawing);

renderer.start();

renderer.setProperties(a, {
  line: {
    jitter: 0
  }
});

renderer.setProperties(a, {
  line: {
    jitter: 5
  }
});

// renderer.setProperties(b, {
//   jitter: 0,
//   wave: {
//     speed: 1,
//     amplitude: 10
//   }
// });

// renderer.setProperties(drawing.getDeterministicEdgeId(b, c), {
//   jitter: 0,
//   wave: {
//     speed: 1,
//     amplitude: 10
//   }
// });

// renderer.setProperties(drawing.getDeterministicEdgeId(a, b), {
//   jitter: 20,
//   taper: false
// });

const bounds = spatial.getBoundingBox([c, b, a]);
console.log(bounds);

canvas.addEventListener('mousemove', (event) => {
  const position = mouseEventToVector(event);
  const hits = spatial.hitWithinRadius(position, 12);
});

canvas.addEventListener('dblclick', (event) => {
  const position = mouseEventToVector(event);

  drawing.addNode(position);
})
