import { createStore } from './lib/store';
import { createCanvas2D } from './lib/canvas';
import { createVector, mouseEventToVector } from './lib/vector2';
import { createButton } from './lib/controls';
import { randomBetween } from './lib/random';

// TODO: Disable hot-reload in parcel so I don't need to do this.
document.body.innerHTML = '';

const drawing = createStore('drawing', [], {
  deserialize: (serializedDrawing) => {
    return serializedDrawing.map((serializedElement) => {
      if (serializedElement.type === 'point') {
        return {
          ...serializedElement,
          position: createVector(serializedElement.position.x, serializedElement.position.y)
        }
      }

      return serializedElement;
    });
  }
});
const [canvas, ctx] = createCanvas2D(800, 800);

function drawPoint(context, point, radius = 5) {
  context.beginPath();
  context.arc(point.x, point.y, radius, 0, 2 * Math.PI);
  context.stroke();
}

function drawLine(context, pointA, pointB) {
  context.beginPath();
  context.moveTo(pointA.x, pointA.y);
  context.lineTo(pointB.x, pointB.y);
  context.stroke();
};

function processDrawing(rawDrawing) {
  return rawDrawing.reduce((mem, element) => {
    if (element.type === 'point') {
      mem.push({
        ...element,
        position: element.position.add(
          createVector(
            randomBetween(-element.properties.shakiness, element.properties.shakiness),
            randomBetween(-element.properties.shakiness, element.properties.shakiness)
          )
        )
      });
    }

    if (element.type === 'link') {
      const startPoint = mem[element.from];
      const endPoint = mem[element.to];

      // TODO: Make sure we dont make lines if we cant connect them.
      // if (!(startPoint && startPoint.type !== 'point') || !(endPoint && endPoint.type !== 'point')) {
      //   return mem;
      // }

      if (element.properties.wiggliness === 0) {
        mem.push({
          type: 'line',
          start: startPoint.position,
          end: endPoint.position
        });

        return;
      }

      const segments = 5;
      const distance = startPoint.position.distanceTo(endPoint.position);
      const segmentRatio = (distance / segments) / distance;
      const lineBetween = endPoint.position.sub(startPoint.position).scale(segmentRatio);
      const perpendicularLine = lineBetween.perpendicular().normalize();

      let lastPosition = startPoint.position;

      for (let i = 0; i < segments; i++) {
        const nextPosition = lastPosition
          .add(lineBetween)
          .add(perpendicularLine.scale(randomBetween(-element.properties.wiggliness, element.properties.wiggliness)))
        const isEnd = (i === segments - 1);

        mem.push({
          type: 'line',
          start: lastPosition,
          end: isEnd ? endPoint.position : nextPosition
        });

        lastPosition = nextPosition;
      };
    }

    return mem;
  }, []);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2

  const rawDrawing = drawing.read();
  const processedDrawing = processDrawing(rawDrawing);

  processedDrawing.forEach((element) => {
    if (element.type === 'point') {
      drawPoint(ctx, element.position);
    }

    if (element.type === 'line') {
      drawLine(ctx, element.start, element.end);
    }
  });

  window.requestAnimationFrame(draw);
}

draw();

canvas.addEventListener('click', (event) => {
  const position = mouseEventToVector(event);

  if (event.shiftKey) {
    drawing.write((store) => {
      return [...store, { type: 'link', from: 0, to: 1, properties: { wiggliness: 5} }]
    });

    return;
  }

  drawing.write((store) => {
    return [...store, { type: 'point', position, properties: { shakiness: 5 } }]
  });
});

createButton('Undo', () => {
  drawing.undo();
});

createButton('Clear', () => {
  drawing.clear();
});
