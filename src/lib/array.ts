export function splice<T>(array: T[], indexToRemove: number, size: number = 1) {
  return array.slice(0, indexToRemove).concat(array.slice(indexToRemove + size));
}
