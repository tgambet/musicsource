import { hash } from '@app/core/utils';

export type Album = {
  name: string;
  hash: string;
  albumArtist?: string;
  artists: string[];
  year?: number;
  pictureKey?: string;
  lastModified: Date;
  likedOn?: Date;
  listenedOn?: Date;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Album = {
  getHash: (albumArtist?: string, albumName?: string): string =>
    hash(`${albumArtist}|${albumName}}`),
};
