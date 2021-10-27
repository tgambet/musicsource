/// <reference lib="webworker" />

addEventListener('message', async ({ data }) => {
  const { id, imageData, width, height } = data;

  const canvas = new OffscreenCanvas(width, height);
  const ctx: OffscreenCanvasRenderingContext2D | null = canvas.getContext('2d');

  if (!ctx) {
    postMessage({ id, error: new Error('canvas not supported') });
    return;
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const b: Blob = imageData;
  const bitmap = await createImageBitmap(b);
  /*, {
    resizeHeight: height * 2,
    resizeWidth: width * 2,
    resizeQuality: 'high',
  }*/

  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await canvas.convertToBlob({
    type: 'image/webp',
    quality: 80,
  });

  const reader = new FileReader();
  reader.onload = (e) => {
    postMessage({
      id,
      result: {
        src: e.target?.result,
        width,
        height,
      },
    });
  };
  reader.onerror = (e) => postMessage({ id, error: e.target?.error });

  reader.readAsDataURL(blob);
});
