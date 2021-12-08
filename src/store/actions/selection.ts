export const SELECTION_ADD = 'SELECTION_ADD';
export const SELECTION_REMOVE = 'SELECTION_REMOVE';
export const SELECTION_SET_MODE = 'SELECTION_SET_MODE';

export function addToSelection(id: string) {
  return {
    type: SELECTION_ADD,
    payload: id
  };
}

export function removeFromSelection(id: string) {
  return {
    type: SELECTION_REMOVE,
    payload: id
  };
}

export function setSelectionMode(mode: 'single' | 'multiple') {
  return {
    type: SELECTION_SET_MODE,
    payload: mode
  }
}
