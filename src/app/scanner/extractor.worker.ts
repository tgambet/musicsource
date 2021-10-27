/// <reference lib="webworker" />

import * as _buffer from 'buffer';
import * as process from 'process';

Object.assign(self, {
  process,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Buffer: _buffer.Buffer,
});

import * as mm from 'music-metadata-browser';
import { getPictureId } from '@app/database/pictures/picture.model';

addEventListener('message', async ({ data }) => {
  const { id, file }: { id: number; file: File } = data;

  await mm
    .parseBlob(file /*{duration: true}*/)
    .then(({ common, format }) => {
      const pictures = (common.picture || []).map((picture) => {
        const blob = new Blob([picture.data], { type: picture.format });
        return {
          id: getPictureId(picture.data.toString()),
          name: picture.name || picture.description,
          blob,
        };
      });
      delete common.picture;
      return {
        common,
        format,
        lastModified: file.lastModified,
        pictures,
      };
    })
    .then((result) => {
      postMessage({ id, result });
    })
    .catch((error) => {
      postMessage({ id, error });
    });
});
