import { ICommonTagsResult, IFormat } from 'music-metadata/lib/type';
import { AlbumId } from '@app/database/albums/album.model';
import { PictureId } from '@app/database/pictures/picture.model';
import { ArtistId } from '@app/database/artists/artist.model';

export type Song = {
  entryPath: string;
  title?: string;
  album: string;
  artist: string;
  albumId: AlbumId;
  artistId: ArtistId;
  duration?: number;
  lastModified?: number;
  likedOn?: number;
  pictureId?: PictureId;
  tags: Omit<ICommonTagsResult, 'picture'>;
  updatedOn: number;
  format: Omit<IFormat, 'audioMD5'>;
};
