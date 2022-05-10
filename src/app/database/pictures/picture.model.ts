import { Opaque } from 'type-fest';
import { hash } from '@app/core/utils';
import { SongId } from '@app/database/songs/song.model';
import { AlbumId } from '@app/database/albums/album.model';
import { ArtistId } from '@app/database/artists/artist.model';
import { EntryId } from '@app/database/entries/entry.model';

export type PictureId = Opaque<string, Picture>;

export const getPictureId = (data: string): PictureId =>
  hash(data) as PictureId;

export type Picture = {
  id: PictureId;
  name?: string;
  data: Buffer;
  format: string;
  sources: { src: string; height: number; width?: number }[];
  entries: EntryId[];
  songs: SongId[];
  albums: AlbumId[];
  artists: ArtistId[];
};
