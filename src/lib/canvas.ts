export function createCanvas2D(width, height) {
  const canvas = document.createElement('canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;

  document.body.append(canvas);

  function resizeFullscreen() {
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    const bounds = canvas.getBoundingClientRect();

    canvas.width = bounds.width * 2;
    canvas.height = bounds.height * 2;

    context.scale(2, 2);
  }

  if (!width && !height) {
    resizeFullscreen();

    window.addEventListener('resize', resizeFullscreen);
  } else {
    canvas.width = width * 2;
    canvas.height = height * 2;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    context.scale(2, 2);
  }



  return [canvas, context]
}
