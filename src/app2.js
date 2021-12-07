import createDrawing, { drawPoint } from './drawing';
import { createCanvas2D } from './lib/canvas';
import { deg2rad, rad2deg } from './lib/math';
import { randomBetween } from './lib/random';
import { rotatePointAroundPivot } from './lib/transform';
import { createVector, mouseEventToVector, Vector2 } from './lib/vector2';

// TODO: Disable hot-reload in parcel so I don't need to do this.
document.body.innerHTML = '';

const [canvas, context] = createCanvas2D();
const drawing = createDrawing(context);

const elementA = drawing.add(createVector(150, 150));
const elementB = drawing.add(createVector(400, 300));
const elementC = drawing.add(createVector(200, 400));
const elementD = drawing.add(createVector(400, 100));
const elementE = drawing.add(createVector(155, 95));

const elementF = drawing.add(createVector(300, 40));
const elementG = drawing.add(createVector(310, 50));

drawing.setProperties(elementA);

drawing.link(elementA, elementC);
drawing.link(elementC, elementB);
drawing.link(elementD, elementC);
drawing.link(elementA, elementE);

drawing.link(elementF, elementG);

console.log(b);

const mouse = { position: createVector(), down: false, lastPosition: createVector(), delta: createVector(), lastMovePosition: createVector(), brokeThreshold: false };
let selected = {};
let selection = { position: createVector(), size: createVector(), bounds: { min: createVector(), max: createVector() } }
let mode = 'default';
let modeState = { rotation: 0, scale: createVector(0, 0), move: createVector(0, 0) };

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

  if (!selection.active) {
    context.strokeStyle = 'red';
    drawPoint(
      context,
      selection.bounds.min.add(selection.bounds.max.sub(selection.bounds.min).scale(0.5))
    );
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

  if (event.key === 'a') {
    selected = drawing.getAllPoints().reduce((mem, point) => {
      mem[point.id] = point;
      return mem;
    }, {});
  }

  if (event.key === 'r' && mode !== 'rotate') {
    mode = 'rotate';
    modeState.mouseStartPosition = mouse.position;
    modeState.pivot = selection.bounds.min.add(selection.bounds.max.sub(selection.bounds.min).scale(0.5));
  }

  if (event.key === 'Escape' && mode !== 'default') {
    mode = 'default';
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

  mode = 'default';
});

canvas.addEventListener('mousemove', (event) => {
  mouse.position = mouseEventToVector(event);
  mouse.delta = mouse.position.sub(mouse.lastMovePosition);

  // Object.keys(selected).forEach((pointOrLinkId) => {
  //   console.log('move');
  //   const point = drawing.get(pointOrLinkId);
  //   const rotatedPoint = rotatePointAroundPivot(point.position, createVector(300, 300), deg2rad(mouse.delta.y));

  //   drawing.move(pointOrLinkId, rotatedPoint);
  // });

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

  if (mode === 'rotate') {
    const angle = modeState.mouseStartPosition.angleTo(mouse.position);

    Object.keys(selected).forEach((id) => {
      const point = selected[id];
      const rotated = rotatePointAroundPivot(point.position, modeState.pivot, angle);
      drawing.move(point.id, rotated);
    });
  }

  mouse.lastMovePosition = mouseEventToVector(event);
;});

canvas.addEventListener('mouseup', (event) => {
  mouse.position = mouseEventToVector(event);
  mouse.down = false;

  const xs = Object.keys(selected).map(id => drawing.get(id).position.x);
  const ys = Object.keys(selected).map(id => drawing.get(id).position.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  selection = { ...selection, bounds: { min: createVector(minX, minY), max: createVector(maxX, maxY) }, active: false };
});

console.log(drawing);
