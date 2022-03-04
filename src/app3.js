import createDrawingGraph from './drawing_graph';
import createRenderer from './renderer';
import { createCanvas2D } from './lib/canvas';
import { createVector } from './lib/vector2';

// TODO: Disable hot-reload in parcel so I don't need to do this.
document.body.innerHTML = '';

const [_, context] = createCanvas2D();
const drawing = createDrawingGraph();
const renderer = createRenderer(context, drawing);

const file = {
  version: 1,
  nodes: [
    // Head square
    [40, 93],
    [187, 102],
    [180, 204],
    [35, 198],

    // Left eye
    [78, 165],
    [96, 132],
    [105, 166],

    // Right eye
    [129, 165],
    [146, 134],
    [152, 170],

    // Body
    [85, 203],
    [64, 245],
    [153, 249],
    [133, 205],

    // Left hand
    [36, 233],
    [9, 242],
    [29, 266],
    [49, 253],

    // Right hand
    [174, 241],
    [167, 264],
    [189, 273],
    [198, 244],

    // Left leg
    [84, 250],
    [82, 291],
    [63, 299],

    // Right leg
    [127, 255],
    [128, 294],
    [140, 306],

    // Left antenna
    [94, 97],
    [55, 56],
    [66, 38],
    [40, 25],
    [26, 50],
    [45, 65],

    // Right antenna
    [130, 99],
    [162, 53],
    [182, 61],
    [186, 40],
    [157, 30],
    [150, 47],
  ],
  edges: [
    [0, 1, 2, 3, 0],
    [4, 5, 6],
    [7, 8, 9],
    [10, 11, 12, 13],
    [14, 15, 16, 17, 14, 10],
    [18, 19, 20, 21, 18, 13],
    [22, 23, 24],
    [25, 26, 27],
    [28, 29, 30, 31, 32, 33, 29],
    [34, 35, 36, 37, 38, 39, 35]
  ]
};

const nodesCreatedFromFile = file.nodes.map(([x, y]) => {
  return drawing.addNode(createVector(x, y));
});

const edgesWithIds = file.edges.map((edges) => {
  return edges.map((fileNodeIndex) => {
    return nodesCreatedFromFile[fileNodeIndex];
  });
});

edgesWithIds.forEach((edges) => {
  edges.forEach((currentNodeId, index) => {
    if (index > 0) {
      const previousNodeId = edges[index - 1];
      drawing.addEdge(previousNodeId, currentNodeId);
    }
  });
});

renderer.start();
