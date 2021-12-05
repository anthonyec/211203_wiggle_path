import { randomId } from "../lib/random";
import { createVector, Vector2 } from "../lib/vector2";

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

function drawPoint(context, position, radius = 5) {
  context.beginPath();
  context.arc(position.x, position.y, radius, 0, 2 * Math.PI);
  context.stroke();
}

function drawLine(context, positionA, positionB) {
  context.beginPath();
  context.moveTo(positionA.x, positionA.y);
  context.lineTo(positionB.x, positionB.y);
  context.stroke();
};

class Drawing {
  context: CanvasRenderingContext2D;
  points = {};
  links = {};
  properties = {};

  constructor({ context }: { context: CanvasRenderingContext2D }) {
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

  draw() {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    this.context.strokeStyle = 'white';
    this.context.lineWidth = 2;

    Object.keys(this.points).forEach((id) => {
      const point = this.points[id];

      drawPoint(this.context, point)
    });


    Object.keys(this.links).forEach((id) => {
      const link = this.links[id];

      drawLine(this.context, this.points[link.from], this.points[link.to]);
    });

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
      // TODO: Implement!
      return {
        id: pointIdOrLinkId,
        position: createVector(0, 0),
        size: createVector(0, 0),
        properties: this.properties[pointIdOrLinkId]
      } as DrawingLinkResult;
    }
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
}

export default function createDrawing(context: CanvasRenderingContext2D) {
  const drawing = new Drawing({ context });

  drawing.draw();

  return drawing;
}
