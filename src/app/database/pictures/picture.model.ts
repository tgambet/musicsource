import { Opaque } from 'type-fest';
import { hash } from '@app/core/utils';

export type PictureId = Opaque<string, Picture>;

export const getPictureId = (data: string): PictureId =>
  hash(data) as PictureId;

export type Picture = {
  id: PictureId;
  src: string;
  entries: string[];
  name?: string;
  description?: string;
};

// export const getCover = (picture: Picture): string =>
//   `data:${picture.type};base64,${picture.data}`;
