import { createStore } from './lib/store';
import { createCanvas2D } from './lib/canvas';
import { createVector, mouseEventToVector } from './lib/vector2';
import { createButton } from './lib/controls';
import { randomBetween } from './lib/random';
import { uuid } from './lib/uuid';

// TODO: Disable hot-reload in parcel so I don't need to do this.
document.body.innerHTML = '';

const mouse = {
  down: false
};
const tool = createStore('tool', {
  current: 'select',
  selectedElementIds: []
}, { maxHistorySize: 1});
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

function findClosestPoint(rawDrawing = [], mousePosition) {
  return rawDrawing.find((element) => {
    if (element.type === 'point') {
      return element.position.distanceTo(mousePosition) < 10;
    }
  });
}

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
            randomBetween(-5, 5),
            randomBetween(-5, 5)
          )
        )
      });
    }

    if (element.type === 'link') {
      const startPoint = mem.find((findElement) => findElement.id === element.from);
      const endPoint = mem.find((findElement) => findElement.id === element.to);

      // TODO: Make sure we dont make lines if we cant connect them.
      // if (!(startPoint && startPoint.type !== 'point') || !(endPoint && endPoint.type !== 'point')) {
      //   return mem;
      // }

      // mem.push({
      //   type: 'line',
      //   start: startPoint.position,
      //   end: endPoint.position
      // });

      // return mem;

      const segments = 15;
      const distance = startPoint.position.distanceTo(endPoint.position);
      const segmentRatio = (distance / segments) / distance;
      const lineBetween = endPoint.position.sub(startPoint.position).scale(segmentRatio);
      const perpendicularLine = lineBetween.perpendicular().normalize();

      let lastPosition = startPoint.position;

      for (let i = 0; i < segments; i++) {
        const nextPosition = lastPosition
          .add(lineBetween)
          .add(perpendicularLine.scale(randomBetween(-5, 5)))
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

  processedDrawing.forEach((element, index) => {
    if (element.type === 'point') {
      drawPoint(ctx, element.position);
    }

    if (element.type === 'line') {
      drawLine(ctx, element.start, element.end);
    }
  });

  rawDrawing.forEach((element) => {
    if (tool.read().selectedElementIds.includes(element.id)) {
      ctx.strokeStyle = 'cyan';
      ctx.lineWidth = 2
      ctx.beginPath();
      ctx.rect(element.position.x - 10, element.position.y - 10, 20, 20);
      ctx.stroke();
    }
  });

  window.requestAnimationFrame(draw);
}

draw();

canvas.addEventListener('click', (event) => {
  const mousePosition = mouseEventToVector(event);

  if (tool.read().current === 'select') {
    const element = findClosestPoint(drawing.read(), mousePosition);

    if (!element) {
      tool.write((store) => {
        return {
          ...store,
          selectedElementIds: []
        }
      });

      return;
    }

    if (event.shiftKey) {
      tool.write((store) => {
        return {
          ...store,
          selectedElementIds: [...store.selectedElementIds, element.id]
        }
      });
    } else {
      tool.write((store) => {
        return {
          ...store,
          selectedElementIds: [element.id]
        }
      });
    }

  }

  if (tool.read().current === 'point') {
    drawing.write((store) => {
      return [...store, { id: uuid(), type: 'point', position: mousePosition }]
    });

    tool.write((store) => {
      return {
        ...store,
        selectedElementIds: []
      }
    });
  }
});

canvas.addEventListener('mousedown', (event) => {
  mouse.down = true;
});

canvas.addEventListener('mouseup', (event) => {
  mouse.down = false;
});

canvas.addEventListener('mousemove', (event) => {
  if (mouse.down) {
    console.log('do something');
  }
});

createButton('Select', () => {
  tool.write((store) => {
    return {
      ...store,
      current: 'select'
    }
  });
});

createButton('Point', () => {
  tool.write((store) => {
    return {
      ...store,
      current: 'point'
    }
  });
});

createButton('Link', () => {
  const selectedElementIds = tool.read().selectedElementIds;

  for (let index = 0; index < selectedElementIds.length - 1; index++) {
    drawing.write((store) => {
      return [...store, { type: 'link', from: selectedElementIds[index], to: selectedElementIds[index + 1] }]
    });
  }
});

createButton('Delete', () => {
  const selectedElementIds = tool.read().selectedElementIds;

  selectedElementIds.forEach((id) => {
    const rawDrawing = drawing.read();

    const index = rawDrawing.findIndex(element => element.id === id);
    const drawingWithoutElement = [...rawDrawing.slice(0, index), ...rawDrawing.slice(index + 1)];

    // const foundLinks = drawingWithoutElement.filter(element => element.from === id || element.to === id).map((element) => {
    //   return drawingWithoutElement.indexOf()
    // });
    // console.log(foundLinks);
    // const drawingWithoutLinks = foundLinks.reduce((mem, element) => {
    //   if (!drawingWithoutElement) {
    //     mem.push(element);
    //   }

    //   return mem;
    // }, []);

    // drawing.write(() => {
    //   return drawingWithoutLinks;
    // });
  });
});

createButton('Undo', () => {
  drawing.undo();
});

createButton('Clear', () => {
  drawing.clear();
});
