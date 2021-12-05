import createDrawing from './drawing';
import { createCanvas2D } from './lib/canvas';
import { createVector, mouseEventToVector } from './lib/vector2';

// TODO: Disable hot-reload in parcel so I don't need to do this.
document.body.innerHTML = '';

const [canvas, context] = createCanvas2D(500, 500);
const drawing = createDrawing(context);

const elementA = drawing.add(createVector(100, 10));
const elementB = drawing.add(createVector(400, 300), { shakiness: 5 });
const elementC = drawing.add(createVector(200, 400));
const elementD = drawing.add(createVector(400, 100));

drawing.setProperties(elementA, { wiggliness: 10 });

drawing.link(elementA, elementC, { wiggliness: 5, segments: 10 });
drawing.link(elementC, elementB, { wiggliness: 5, segments: 10 });
drawing.link(elementD, elementC, { wiggliness: 5, segments: 10 });

const mouse = { position: createVector(), down: false, lastPosition: createVector() };
let selectedPoints = [];

document.body.addEventListener('keydown', (event) => {
  if (selectedPoints.length > 1 && event.key === 'l') {
    drawing.link(selectedPoints[0].id, selectedPoints[1].id);
  }
});

canvas.addEventListener('dblclick', (event) => {
  drawing.add(mouseEventToVector(event));
});

canvas.addEventListener('mousedown', (event) => {
  mouse.position = mouseEventToVector(event);
  mouse.lastPosition = mouseEventToVector(event);
  mouse.down = true;

  const hitInfo = drawing.hit(mouse.position, 15);

  console.log(hitInfo);

  if (hitInfo.length && selectedPoints.length > 1 && !event.shiftKey) {
    return;
  }

  if (hitInfo.length && selectedPoints.length > 1 && event.shiftKey) {
    selectedPoints = [...selectedPoints, hitInfo.points[0]];
  }

  if (hitInfo.total === 0) {
    selectedPoints = [];
  } else if (hitInfo.total !== 0 && event.shiftKey) {
    selectedPoints = [...selectedPoints, hitInfo.points[0]];
  } else {
    selectedPoints = [hitInfo.points[0]];
  }
});

canvas.addEventListener('mousemove', (event) => {
  mouse.position = mouseEventToVector(event);

  const difference = mouse.position.sub(mouse.lastPosition);

  if (selectedPoints.length && mouse.down) {
    selectedPoints.forEach((point) => {
      drawing.move(point.id, point.position.add(difference));
    });
  }
;});

canvas.addEventListener('mouseup', (event) => {
  mouse.position = mouseEventToVector(event);
  mouse.down = false;
});

console.log(drawing);
