import { IPicture } from 'music-metadata/lib/type';
import { Opaque } from 'type-fest';
import { hash } from '@app/core/utils';

export type PictureId = Opaque<string, Picture>;

export const getPictureId = (data: string): PictureId =>
  hash(data) as PictureId;

export type Picture = Omit<IPicture, 'data'> & {
  id: PictureId;
  data: string;
};

export const getCover = (picture: Picture): string =>
  `data:${picture.format};base64,${picture.data}`;
