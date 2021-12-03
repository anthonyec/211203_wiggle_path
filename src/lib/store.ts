const DEFAULT_STORE_OPTIONS = {
  maxHistorySize: 10,
  serialize: (value) => value,
  deserialize: (value) => value
};

export function createStore(name, defaultValue, storeOptions = {}) {
  const options = {
    ...DEFAULT_STORE_OPTIONS,
    ...storeOptions
  };
  let internalStore = defaultValue;
  const localStorageValue = window.localStorage.getItem(`store.${name}`);

  if (localStorageValue) {
    internalStore = options.deserialize(JSON.parse(localStorageValue));
  }

  const history = [internalStore];
  let currentHistoryIndex = 0;

  function writeToLocalStorage() {
    window.localStorage.setItem(`store.${name}`, JSON.stringify(options.serialize(internalStore)));
  }

  return {
    write: (callback) => {
      const newStoreValue = callback(internalStore);
      internalStore = newStoreValue;

      // Check if in undo state.
      if (history.length !== 0 && history.length - 1 !== currentHistoryIndex) {
        // Delete everything after historyIndex.
        history.splice(currentHistoryIndex + 1, history.length);
      }

      if (history.length > options.maxHistorySize) {
        history.splice(history.length - options.maxHistorySize, history.length);
      }

      history.push(newStoreValue);
      currentHistoryIndex = history.length - 1;
      writeToLocalStorage();
    },
    read: () => {
      return internalStore;
    },
    clear: () => {
      internalStore = defaultValue;
      writeToLocalStorage();
    },
    // TODO: Fix undo broken after max history reached!
    undo: () => {
      if (currentHistoryIndex === 0) {
        console.warn('No history!')
        return;
      }

      currentHistoryIndex = currentHistoryIndex - 1;
      internalStore = history[currentHistoryIndex];
    },
    redo: () => {}
  };
}
