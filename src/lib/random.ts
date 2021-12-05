export function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function randomId() {
  return Math.random().toString(36).replace('0.', '');
}
