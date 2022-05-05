import { FileEntry } from '@app/database/entries/entry.model';

addEventListener('message', async ({ data }) => {
  const {
    id,
    entry,
    width,
    height,
  }: { id: number; entry: FileEntry; width: number; height: number } = data;

  const canvas = new OffscreenCanvas(width, height);
  const ctx: OffscreenCanvasRenderingContext2D | null = canvas.getContext('2d');

  if (!ctx) {
    postMessage({ id, error: new Error('canvas not supported') });
    return;
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  let bitmap;
  try {
    const file = await entry.handle.getFile();
    bitmap = await createImageBitmap(file, {
      resizeHeight: height * 2,
      resizeWidth: width * 2,
      resizeQuality: 'high',
    });
    ctx.drawImage(bitmap, 0, 0, width, height);
  } catch (e) {
    postMessage({ id, error: e });
    return;
  }

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

  await canvas
    .convertToBlob({
      type: 'image/webp',
      quality: 80,
    })
    .then((blob) => {
      reader.readAsDataURL(blob);
    })
    .catch((error) => postMessage({ id, error }));
});
