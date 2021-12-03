export function createCanvas2D(width, height) {
  const canvas = document.createElement('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;

  canvas.width = width * 2;
  canvas.height = height * 2;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  context.scale(2, 2);

  document.body.append(canvas);

  return [canvas, context]
}
