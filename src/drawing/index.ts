import { randomBetween, randomId } from "../lib/random";
import { createVector, Vector2 } from "../lib/vector2";

import EventEmitter from './events';

interface DrawingLink {
  from: string;
  to: string;
}

interface DrawingPointProperties {
  shakiness?: number;
}

interface DrawingLinkProperties {
  wiggliness?: number;
  segments?: number;
}

interface DrawingPointResult {
  id: string;
  position: Vector2;
  properties: DrawingPointProperties;
}

interface DrawingLinkResult {
  id: string;
  position: Vector2;
  size: Vector2;
  properties: DrawingLinkProperties;
}

interface DrawingHitResults {
  total: number;
  points: DrawingPointResult[];
  links: DrawingLinkResult[];
}

function getDeterministicLinkId(fromElementId: string, toElementId: string) {
  return [fromElementId, toElementId].sort().join('-')
}

// TODO: Type vectors correctly.
// http://www.jeffreythompson.org/collision-detection/line-point.php
function pointToLineCollision(lineStartPosition, lineEndPosition, pointPosition, radius = 0.1) {
  const d1 = pointPosition.distanceTo(lineStartPosition);
  const d2 = pointPosition.distanceTo(lineEndPosition);

  const lineLength = lineStartPosition.distanceTo(lineEndPosition);
  const buffer = radius;

  return (d1 + d2) >= lineLength - buffer && (d1 + d2) <= lineLength + buffer;
}

export function drawPoint(context, position, radius = 5) {
  context.beginPath();
  context.arc(position.x, position.y, radius, 0, 2 * Math.PI);
  context.stroke();
}

export function drawLine(context, positionA, positionB, properties: DrawingLinkProperties) {
  const segments = properties?.segments || 0;
  const wiggliness = properties?.wiggliness || 0;

  if (segments === 0 || wiggliness === 0) {
    context.beginPath();
    context.moveTo(positionA.x, positionA.y);
    context.lineTo(positionB.x, positionB.y);
    context.stroke();
    return;
  }

  const distance = positionA.distanceTo(positionB);
  const segmentPercent = (distance / segments) / distance;
  const lineBetween = positionB.sub(positionA).scale(segmentPercent);
  const perpendicularLine = lineBetween.perpendicular().normalize();

  let lastPosition = positionA;

  for (let i = 0; i < segments; i++) {
    const nextPosition = lastPosition
      .add(lineBetween)
      .add(perpendicularLine.scale(randomBetween(-wiggliness, wiggliness)))

    context.beginPath();
    context.moveTo(lastPosition.x, lastPosition.y);

    if (i === segments - 1) {
      context.lineTo(positionB.x, positionB.y);
    } else {
      context.lineTo(nextPosition.x, nextPosition.y);
    }

    context.stroke();

    lastPosition = nextPosition;
  };
};

class Drawing extends EventEmitter {
  context: CanvasRenderingContext2D;
  points = {};
  links = {};
  properties = {};
  baseProperties = { shakiness: 0, segments: 10, wiggliness: 0 };
  lastDrawTime = 0;
  fps = 60

  constructor({ context }: { context: CanvasRenderingContext2D }) {
    super();
    this.context = context;
  }

  add(position: Vector2, properties?: DrawingPointProperties): string {
    const id = randomId();

    this.points[id] = position;

    if (properties) {
      this.properties[id] = properties;
    }

    return id;
  }

  remove(id: string) {
    if (this.properties[id]) {
      delete this.properties[id];
    }

    Object.keys(this.links).forEach((linkId) => {
      const link = this.links[linkId];

      if (link.from === id || link.to === id) {
        this.unlink(link.from, link.to);
      }
    });

    delete this.points[id];
  }

  move(id: string, position: Vector2, relative: boolean) {
    if (relative) {
      this.points[id] = this.points[id].add(position);
    } else {
      this.points[id] = position;
    }
  }

  setProperties(pointIdOrLinkId: string, properties: DrawingPointProperties | DrawingLinkProperties) {
    const point = this.points[pointIdOrLinkId];
    const link = this.links[pointIdOrLinkId];

    if (point || link) {
      this.properties[pointIdOrLinkId] = properties;
    }
  }

  link(fromElementId: string, toElementId: string, properties?: DrawingLinkProperties): string {
    const linkId = getDeterministicLinkId(fromElementId, toElementId);

    if (!this.points[fromElementId] || !this.points[toElementId]) {
      console.warn('"from" or "to" point does not exist');
      return;
    }

    this.links[linkId] = { from: fromElementId, to: toElementId } as DrawingLink;

    if (properties) {
      this.properties[linkId] = properties;
    }

    return linkId;
  }

  unlink(fromElementId: string, toElementId: string) {
    const linkId = getDeterministicLinkId(fromElementId, toElementId);

    if (this.properties[linkId]) {
      delete this.properties[linkId];
    }

    delete this.links[linkId];
  }

  dissolve(linkId: string) {
    delete this.links[linkId];
  }

  getPointsWithEffects() {
    return Object.keys(this.points).reduce((mem, id) => {
      const point = this.points[id];
      const properties = {...this.baseProperties, ...this.properties[id]};
      const offsetScalar = properties?.shakiness || 0;
      const offset = createVector(
        randomBetween(-offsetScalar, offsetScalar),
        randomBetween(-offsetScalar, offsetScalar)
      );

      mem[id] = point.add(offset);

      return mem;
    }, {});
  }

  draw() {
    const frameDelta = Date.now() - this.lastDrawTime;
    if (frameDelta > 1000 / this.fps) {
      this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
      this.context.strokeStyle = 'white';
      this.context.lineWidth = 2;

      const pointsWithEffects = this.getPointsWithEffects();

      Object.keys(pointsWithEffects).forEach((id) => {
        const point = pointsWithEffects[id];
        drawPoint(this.context, point)
      });

      Object.keys(this.links).forEach((id) => {
        const link = this.links[id];
        drawLine(
          this.context,
          pointsWithEffects[link.from],
          pointsWithEffects[link.to],
          {
            ...this.baseProperties,
            ...this.properties[id]
          }
        );
      });

      this.lastDrawTime = Date.now();
      this.emit('after-draw');
    }

    window.requestAnimationFrame(this.draw.bind(this));
  }

  get(pointIdOrLinkId: string): DrawingPointResult | DrawingLinkResult {
    const point = this.points[pointIdOrLinkId];
    const link = this.links[pointIdOrLinkId];

    if (point) {
      return {
        id: pointIdOrLinkId,
        position: point,
        properties: this.properties[pointIdOrLinkId]
      } as DrawingPointResult;
    }

    if (link) {
      return {
        id: pointIdOrLinkId,
        // TODO: Implement!
        position: createVector(0, 0),
        // TODO: Implement!
        size: createVector(0, 0),
        properties: this.properties[pointIdOrLinkId]
      } as DrawingLinkResult;
    }
  }

  getAllPoints() {
    return Object.keys(this.points).map((id) => {
      return this.get(id);
    });
  }

  hit(position: Vector2, radius: number = 5): DrawingHitResults {
    const pointIds = Object.keys(this.points).filter((id) => {
      const point = this.points[id];
      const distance = point.distanceTo(position);

      return distance < radius;
    });

    const linkIds = Object.keys(this.links).filter((id) => {
      const link = this.links[id];
      const fromPoint = this.points[link.from];
      const toPoint = this.points[link.to];

      return pointToLineCollision(fromPoint, toPoint, position, radius / 50);
    });

    // TODO: Fix types for this.points and this.links.
    const points = pointIds.map(this.get.bind(this)) as DrawingPointResult[];
    const links = linkIds.map(this.get.bind(this)) as DrawingLinkResult[];

    return {
      total: points.length,
      points,
      links
    }
  }

  hitWithinBounds(position: Vector2, size: Vector2): DrawingPointResult[] {
    let boundsPosition = position;
    let boundsSize = size;

    // TODO: Should this be done in drawing lib or outside of it?
    // TODO: Fix this to work for negative Y but positive X.
    if (size.x < 0 || size.y < 0) {
      boundsPosition = boundsPosition.sub(size.abs());
      boundsSize = size.abs();
    }

    const pointIds = Object.keys(this.points).filter((id) => {
      const point = this.points[id];
      const withinX = point.x > boundsPosition.x && point.x < boundsPosition.x + boundsSize.x;
      const withinY = point.y > boundsPosition.y && point.y < boundsPosition.y + boundsSize.y;

      return withinX && withinY;
    });

    const points = pointIds.map(this.get.bind(this)) as DrawingPointResult[];

    return points;
  }
}

export default function createDrawing(context: CanvasRenderingContext2D) {
  const drawing = new Drawing({ context });

  drawing.draw();

  return drawing;
}
