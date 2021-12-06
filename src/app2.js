import createDrawing, { drawPoint } from './drawing';
import { createCanvas2D } from './lib/canvas';
import { createVector, mouseEventToVector } from './lib/vector2';

// TODO: Disable hot-reload in parcel so I don't need to do this.
document.body.innerHTML = '';

const [canvas, context] = createCanvas2D();
const drawing = createDrawing(context);

const elementA = drawing.add(createVector(100, 10));
const elementB = drawing.add(createVector(400, 300), { shakiness: 5 });
const elementC = drawing.add(createVector(200, 400));
const elementD = drawing.add(createVector(400, 100));

drawing.setProperties(elementA, { wiggliness: 10 });

drawing.link(elementA, elementC);
drawing.link(elementC, elementB);
drawing.link(elementD, elementC, { wiggliness: 2, segments: 20 });

const mouse = { position: createVector(), down: false, lastPosition: createVector(), delta: createVector(), lastMovePosition: createVector(), brokeThreshold: false };
let selected = {};
let selection = { position: createVector(), size: createVector() }

drawing.on('after-draw', () => {
  Object.keys(selected).forEach((id) => {
    const selectedPointOrLink = selected[id];

    context.strokeStyle = 'cyan';

    drawPoint(context, selectedPointOrLink.position, 8);
  });

  if (selection.active) {
    context.strokeStyle = 'cyan';

    context.beginPath();
    context.rect(
      selection.position.x,
      selection.position.y,
      selection.size.x,
      selection.size.y
    );
    context.stroke();
  }
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

    selection = { ...selection, active: false };
    selected = {};
  }

  if (event.key === 'm') {
    if (Object.keys(selected).length == 2) {
      const selectedItems = Object.values(selected);
      const difference = selectedItems[1].position.sub(selectedItems[0].position);
      const midpoint = selectedItems[0].position.add(difference.scale(0.5));

      drawing.add(midpoint);
      drawing.remove(selectedItems[0].id);
      drawing.remove(selectedItems[1].id);

      // get links to point 1
        // add all links to new midpoint
      // get links to point 2
        // add all links to new midpoint

      selected = {};
    }
  }
});

canvas.addEventListener('dblclick', (event) => {
  const id = drawing.add(mouseEventToVector(event));

  selected = {};
  selected[id] = drawing.get(id);
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
    selection = { ...selection, size: createVector(), position: mouse.position, active: true }
  }
});

canvas.addEventListener('mousemove', (event) => {
  mouse.position = mouseEventToVector(event);
  mouse.delta = mouse.position.sub(mouse.lastMovePosition);

  const threshold = mouse.lastPosition.distanceTo(mouse.position);

  // TODO: Messy!
  if (Object.keys(selected).length && mouse.down && !selection.active && (mouse.brokeThreshold || threshold > 3)) {
    Object.keys(selected).forEach((pointOrLinkId) => {
      if (!mouse.brokeThreshold) {
        drawing.move(pointOrLinkId, mouse.position.sub(mouse.lastPosition), true);
      }

      drawing.move(pointOrLinkId, mouse.delta, true);
      selected[pointOrLinkId] = drawing.get(pointOrLinkId); // TODO: Yuck.
    });

    mouse.brokeThreshold = true;
  }

  if (mouse.down) {
    selection = { ...selection, size: mouse.position.sub(selection.position) }
  }

  if (selection.active) {
    const hitBoundPoints = drawing.hitWithinBounds(selection.position, selection.size);

    selected = {};

    hitBoundPoints.forEach((point) => {
      selected[point.id] = point;
    });
  }

  mouse.lastMovePosition = mouseEventToVector(event);
;});

canvas.addEventListener('mouseup', (event) => {
  mouse.position = mouseEventToVector(event);
  mouse.down = false;

  selection = { ...selection, active: false };
});

console.log(drawing);
