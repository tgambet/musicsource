import { ICommonTagsResult } from 'music-metadata/lib/type';
import { AlbumId } from '@app/database/albums/album.model';
import { PictureId } from '@app/database/pictures/picture.model';

export type Song = Omit<ICommonTagsResult, 'picture'> & {
  albumId: AlbumId;
  entryPath: string;
  lastModified: Date;
  pictureKey?: PictureId;
  duration?: number;
  likedOn?: Date;
};
