import { Picture } from '@app/database/pictures/picture.model';
import { readAsDataURL } from '@app/core/utils/read-as-data-url.util';
import { firstValueFrom } from 'rxjs';

addEventListener('message', async ({ data }) => {
  const {
    id,
    picture,
    width,
    height,
  }: {
    id: number;
    picture: Picture;
    width: number;
    height: number;
  } = data;

  if (height === 0) {
    const src = await firstValueFrom(
      readAsDataURL(new Blob([picture.data], { type: picture.format }))
    );
    postMessage({ id, result: { src, width, height } });
    return;
  }

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
    // const file = await picture.entries[0].handle.getFile();
    bitmap = await createImageBitmap(
      new Blob([picture.data], { type: picture.format }),
      {
        // resizeHeight: height * 2,
        // resizeWidth: width * 2,
        resizeQuality: 'high',
      }
    );
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
