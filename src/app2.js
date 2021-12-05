import createDrawing, { drawPoint } from './drawing';
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

const mouse = { position: createVector(), down: false, lastPosition: createVector(), delta: createVector(), lastMovePosition: createVector(), brokeThreshold: false };
let selected = {};

drawing.on('after-draw', () => {

  Object.keys(selected).forEach((id) => {
    const selectedPointOrLink = selected[id];

    context.strokeStyle = 'cyan';
    drawPoint(context, selectedPointOrLink.position, 8);
  });
  // context.beginPath();
  // context.moveTo(0, 0);
  // context.lineTo(10, 10);
  // context.stroke();
});

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

    selected = {};
  }
});

canvas.addEventListener('dblclick', (event) => {
  const id = drawing.add(mouseEventToVector(event));

  selected[id] = drawing.get(id);

  if (event.shiftKey) {
    console.log('oooo')
  }
});

canvas.addEventListener('mousedown', (event) => {
  mouse.position = mouseEventToVector(event);
  mouse.lastPosition = mouseEventToVector(event);
  mouse.lastMovePosition = mouseEventToVector(event);
  mouse.down = true;
  mouse.brokeThreshold = false;

  const hitInfo = drawing.hit(mouse.position, 15);
  const isNotInSelection = hitInfo.points.length && !Object.keys(selected).includes(hitInfo.points[0].id);

  if (!event.shiftKey && isNotInSelection) {
    selected = {}
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
  mouse.position = mouseEventToVector(event);
  mouse.delta = mouse.position.sub(mouse.lastMovePosition);

  const threshold = mouse.lastPosition.distanceTo(mouse.position);

  // TODO: Messy!
  if (Object.keys(selected).length && mouse.down && (mouse.brokeThreshold || threshold > 3)) {
    Object.keys(selected).forEach((pointOrLinkId) => {
      if (!mouse.brokeThreshold) {
        drawing.move(pointOrLinkId, mouse.position.sub(mouse.lastPosition), true);
      }

      drawing.move(pointOrLinkId, mouse.delta, true);
      selected[pointOrLinkId] = drawing.get(pointOrLinkId); // TODO: Yuck.
    });

    mouse.brokeThreshold = true;
  }

  mouse.lastMovePosition = mouseEventToVector(event);
;});

canvas.addEventListener('mouseup', (event) => {
  mouse.position = mouseEventToVector(event);
  mouse.down = false;
});

console.log(drawing);
