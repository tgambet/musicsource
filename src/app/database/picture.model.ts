import { IPicture } from 'music-metadata/lib/type';

export type Picture = Omit<IPicture, 'data'> & {
  data: string;
  hash: string;
};

export const getCover = (picture: Picture): string =>
  `data:${picture.format};base64,${picture.data}`;
