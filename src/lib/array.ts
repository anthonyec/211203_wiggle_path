export function splice<T>(array: T[], indexToRemove: number, size: number = 1) {
  return array.slice(0, indexToRemove).concat(array.slice(indexToRemove + size));
}

export function unique<T>(array: T[]) {
  return array.filter((value, index, self) => {
    return self.indexOf(value) === index;
  });
}

export function check(arrayA, arrayB) {
  return arrayB.every(v => arrayA.includes(v));
}
