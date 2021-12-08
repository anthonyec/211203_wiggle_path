import { mouseEventToVector } from "../../lib/vector2";
import { SpatialStructure } from "../../spatial_structure";
import { addToSelection, setSelectionMode } from "../../store/actions/selection";

export default class SelectionManager {
  spatial: SpatialStructure;
  canvas: HTMLCanvasElement;
  store;

  constructor(spatial: SpatialStructure, canvas: HTMLCanvasElement, store) {
    this.spatial = spatial;
    this.canvas = canvas;
    this.store = store;

    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));

    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
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

  handleMouseDown() {

  }

  handleMouseMove() {

  }

  handleMouseUp() {

  }


  handleCanvasClick(event) {
    const position = mouseEventToVector(event);
    const hits = this.spatial.hitWithinRadius(position, 12);

    this.store.dispatch(addToSelection(hits[0]));

    // console.log('handleCanvasClick', hits);
  }
}
