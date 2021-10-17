import { ICommonTagsResult, IFormat } from 'music-metadata/lib/type';
import { AlbumId } from '@app/database/albums/album.model';
import { PictureId } from '@app/database/pictures/picture.model';
import { ArtistId } from '@app/database/artists/artist.model';

export type Song = {
  entryPath: string;
  folder: string;
  title?: string;
  album: { title: string; id: AlbumId };
  artists: { name: string; id: ArtistId }[];
  duration?: number;
  lastModified?: number;
  likedOn?: number;
  pictureId?: PictureId;
  tags: Omit<ICommonTagsResult, 'picture'>;
  updatedOn: number;
  format: Omit<IFormat, 'audioMD5'>;
};
