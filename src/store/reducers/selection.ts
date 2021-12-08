import {
  SELECTION_ADD,
  SELECTION_REMOVE,
  SELECTION_SET_MODE
} from '../actions/selection';
import { splice } from '../../lib/array';

const initialState = {
  mode: 'single',
  selected: [],
};

export default function selectionReducer(state = initialState, action) {
  if (action.type === SELECTION_SET_MODE) {
    return {
      ...state,
      mode: action.payload
    }
  }

  if (action.type === SELECTION_ADD) {
    if (state.mode === 'multiple') {
      const existingIndex = state.selected.indexOf(action.payload);
      const alreadyExistsInSelection = existingIndex !== -1;

      // Don't do anything if nothing is selected.
      if (action.payload === undefined) {
        return state;
      }

      // If it already exists in selection, remove it from the selection.
      if (alreadyExistsInSelection) {
        return {
          ...state,
          selected: splice(state.selected, existingIndex)
        }
      }

      // Add it to the selection.
      return {
        ...state,
        selected: [
          ...state.selected,
          action.payload
        ]
      }
    }

    if (state.mode === 'single') {
      if (action.payload === undefined) {
        return {
          ...state,
          selected: []
        }
      }

      return {
        ...state,
        selected: [action.payload]
      }
    }
  }

  if (action.type === SELECTION_REMOVE) {
    return {
      ...state,
      selected: []
    }
  }

  return state;
}
