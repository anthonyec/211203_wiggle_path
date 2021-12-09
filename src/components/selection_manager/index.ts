import { createVector, mouseEventToVector, Vector2 } from "../../lib/vector2";
import { SpatialStructure } from "../../spatial_structure";
import { addMultipleToSelection, addToSelection, setSelectionMode, setSelectionTool } from "../../store/actions/selection";

export default class SelectionManager {
  spatial: SpatialStructure;
  canvas: HTMLCanvasElement;
  store;

  mouse = {
    down: false,
    leave: false,
    startDownPosition: Vector2.ZERO
  }

  constructor(spatial: SpatialStructure, canvas: HTMLCanvasElement, store) {
    this.spatial = spatial;
    this.canvas = canvas;
    this.store = store;

    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));

    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    this.canvas.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
    this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
  }

  handleKeyDown(event) {
    if (event.key === 'Shift') {
      this.store.dispatch(setSelectionMode('multiple'));
    }
  }

  handleKeyUp(event) {
    if (event.key === 'Shift') {
      this.store.dispatch(setSelectionMode('single'));
    }
  }

  handleMouseLeave(event) {
    this.mouse.leave = true;
  }

  handleMouseEnter(event) {
    this.mouse.leave = false;
  }

  handleMouseDown(event) {
    this.mouse.down = true;
    this.mouse.startDownPosition = mouseEventToVector(event);
  }

  handleMouseMove(event) {
    const position = mouseEventToVector(event);

    if (this.mouse.down) {
      this.store.getState().selection.tool !== 'box-select' && this.store.dispatch(setSelectionTool('box-select'));

      const size = position.sub(this.mouse.startDownPosition);
      const hits = this.spatial.hitWithinBounds(this.mouse.startDownPosition, size);

      this.store.dispatch(addMultipleToSelection(hits));
    }
  }

  handleMouseUp() {
    this.mouse.down = false;
  }

  handleCanvasClick(event) {
    const position = mouseEventToVector(event);
    const hits = this.spatial.hitWithinRadius(position, 12);

    this.store.dispatch(addToSelection(hits));
  }
}
