export function deg2rad(degrees: number): number {
  return degrees * Math.PI / 180;
}

export function rad2deg(radians: number): number {
  return radians * 180 / Math.PI;
}

export function sinWave(t: number, speed: number, amplitude: number, offset?: number = 0) {
  return Math.sin((t * speed) + offset) * amplitude;
}

export function cosWave(t: number, speed: number, amplitude: number, offset?: number = 0) {
  return Math.sin((t * speed) + offset) * amplitude;
}
