import { ICommonTagsResult, IFormat } from 'music-metadata/lib/type';
import { AlbumId } from '@app/database/albums/album.model';
import { PictureId } from '@app/database/pictures/picture.model';
import { ArtistId } from '@app/database/artists/artist.model';
import { Opaque } from 'type-fest';
import { EntryId } from '@app/database/entries/entry.model';
import { hash } from '@app/core/utils';

export type SongId = Opaque<string, Song>;

export const getSongId = (path: string): SongId => hash(path) as SongId;

export type Song = {
  id: SongId;
  entries: EntryId[];
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
