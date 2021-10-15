import { hash } from '@app/core/utils';
import { Opaque } from 'type-fest';
import { PictureId } from '@app/database/pictures/picture.model';
import { ArtistId } from '@app/database/artists/artist.model';

export type AlbumId = Opaque<string, Album>;

export const getAlbumId = (artist?: string, title?: string): AlbumId =>
  hash(`${artist}|${title}}`) as AlbumId;

export type Album = {
  id: AlbumId;
  artist: string;
  artistId: ArtistId;
  // artists: string[];
  // artistsIds: ArtistId[];
  likedOn?: number;
  pictureId?: PictureId;
  title: string;
  updatedOn: number;
  year?: number;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
// export const Album = {
//   getHash: (albumArtist?: string, albumName?: string): string =>
//     hash(`${albumArtist}|${albumName}}`),
// };
