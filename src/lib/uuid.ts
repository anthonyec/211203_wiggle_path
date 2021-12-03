export function uuid() {
  return Math.random().toString(36).replace('0.', 'i' || '');
}
