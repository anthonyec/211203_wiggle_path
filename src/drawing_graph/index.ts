import { randomId } from "../lib/random";
import { check, splice, unique } from '../lib/array';
import { Vector2 } from "../lib/vector2";

function getDeterministicEdgeId(fromElementId: string, toElementId: string) {
  return [fromElementId, toElementId].sort().join('-')
}

class DrawingGraph {
  edges = new Map();
  adjacencyList = new Map();
  nodes = new Map();
  properties = new Map();

  constructor() {}

  addNode(position: Vector2, properties?: object) {
    const id = randomId();

    this.nodes.set(id, position);

    if (properties) {
      this.properties.set(id, properties);
    }

    return id;
  }

  getNode(nodeId: string) {
    return this.nodes.get(nodeId);
  }

  getNodeProperties(nodeId: string) {
    // TODO: noop;
    return {};
  }

  getNodeResult(nodeId: string) {
    return {
      id: nodeId,
      position: this.getNode(nodeId),
      properties: this.getNodeProperties(nodeId)
    }
  }

  removeNode(nodeId: string) {
    this.nodes.delete(nodeId);

    if (this.adjacencyList.has(nodeId)) {
      const connectedNodeIds = this.adjacencyList.get(nodeId);

      connectedNodeIds.forEach((toNodeId) => {
        this.removeEdge(nodeId, toNodeId);
      });
    }

    if (this.properties.has(nodeId)) {
      this.properties.delete(nodeId);
    }
  }

  addEdge(fromNodeId: string, toNodeId: string) {
    const deterministicEdgeId = getDeterministicEdgeId(fromNodeId, toNodeId);
    const adjacentNodesA = this.adjacencyList.get(fromNodeId) || [];
    const adjacentNodesB = this.adjacencyList.get(toNodeId) || [];

    this.edges.set(deterministicEdgeId, [fromNodeId, toNodeId]);

    if (!adjacentNodesA.includes(toNodeId)) {
      this.adjacencyList.set(fromNodeId, [...adjacentNodesA, toNodeId]);
    }

    if (!adjacentNodesB.includes(fromNodeId)) {
      this.adjacencyList.set(toNodeId, [...adjacentNodesB, fromNodeId]);
    }

    return deterministicEdgeId;
  }

  getEdge(fromNodeId: string, toNodeId: string) {
    const deterministicEdgeId = getDeterministicEdgeId(fromNodeId, toNodeId);

    return this.edges.get(deterministicEdgeId);
  }

  removeEdge(fromNodeId: string, toNodeId: string) {
    const deterministicEdgeId = getDeterministicEdgeId(fromNodeId, toNodeId);

    this.edges.delete(deterministicEdgeId);
    this.adjacencyList.delete(fromNodeId);

    this.adjacencyList.forEach((edgeDestinations, nodeId) => {
      const indexOfFromNodeId = edgeDestinations.indexOf(fromNodeId);

      if (indexOfFromNodeId !== -1) {
        this.adjacencyList.set(nodeId, splice(edgeDestinations, indexOfFromNodeId));

        // This is clean up for when the node only has 1 edge to the node being
        // removed (fromNode). Just remove the node otherwise its edge
        // destinations will be an empty array.
        if (edgeDestinations.length === 1) {
          this.adjacencyList.delete(nodeId);
        }
      }
    });
  }

  getNodeEdges(nodeId: string) {
    const edgeDestinations = this.adjacencyList.get(nodeId);

    return edgeDestinations.map((toNodeId) => {
      return this.getEdge(nodeId, toNodeId);
    });
  }

  // https://www.programiz.com/dsa/graph-dfs
  getAllConnectedNodes(initialNodeId: string) {
    let visited = [];
    let stack = [];

    const visit = (nodeId: string) => {
      const adjacent = this.adjacencyList.get(nodeId) || [];

      if (stack.length) {
        stack = splice(stack, 0);
      }

      const filteredAdjacent = adjacent.filter((x) => {
        return !visited.includes(x) && !stack.includes(x);
      });

      visited = [...visited, nodeId];
      stack = [...stack, ...filteredAdjacent];

      if (stack.length) {
        visit(stack[0]);
      }
    };

    visit(initialNodeId);

    console.log('visited', visited);
  }
};

export default function createDrawingGraph() {
  return new DrawingGraph();
}
