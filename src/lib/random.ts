export function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

let i = 0;
export function randomId() {
  i++;
  return `${i}`;
  return Math.random().toString(36).replace('0.', '');
}
