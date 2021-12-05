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
let selected = {};

document.body.addEventListener('keydown', (event) => {
  if (event.key === 'Backspace') {
    Object.keys(selected).forEach((pointOrLinkId) => {
      // TODO: Should there be a check here? Maybe results should contain a type. Or maybe they should be split?
      drawing.remove(pointOrLinkId);
      drawing.dissolve(pointOrLinkId);
      selected = {};
    });
  }

  if (event.key === 'l') {
    for (let index = 0; index < Object.keys(selected).length - 1; index++) {
      const idA = Object.keys(selected)[index];
      const idB = Object.keys(selected)[index + 1];

      drawing.link(idA, idB);
    }
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

  if (!event.shiftKey) {
    selected = {};
  }

  if (hitInfo.points.length) {
    selected[hitInfo.points[0].id] = hitInfo.points[0];
  } else if (hitInfo.links.length) {
    selected[hitInfo.links[0].id] = hitInfo.links[0];
  } else {
    selected = {};
  }
});

canvas.addEventListener('mousemove', (event) => {
  console.log(selected);

  mouse.position = mouseEventToVector(event);

  const difference = mouse.position.sub(mouse.lastPosition);

  if (Object.keys(selected).length && mouse.down) {
    Object.keys(selected).forEach((pointOrLinkId) => {
      // const point = drawing.get(pointOrLinkId);

      // drawing.move(pointOrLinkId, mouse.position);
    });
  }
;});

canvas.addEventListener('mouseup', (event) => {
  mouse.position = mouseEventToVector(event);
  mouse.down = false;
});

console.log(drawing);
