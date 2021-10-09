import { hash } from '@app/core/utils';
import { Opaque } from 'type-fest';
import { PictureId } from '@app/database/pictures/picture.model';

export type AlbumId = Opaque<string, Album>;

export const getAlbumId = (albumArtist?: string, albumName?: string): AlbumId =>
  hash(`${albumArtist}|${albumName}}`) as AlbumId;

export type Album = {
  id: AlbumId;
  name: string;
  albumArtist?: string;
  artists: string[];
  year?: number;
  pictureKey?: PictureId;
  lastModified: Date;
  likedOn?: Date;
  listenedOn?: Date;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
// export const Album = {
//   getHash: (albumArtist?: string, albumName?: string): string =>
//     hash(`${albumArtist}|${albumName}}`),
// };
