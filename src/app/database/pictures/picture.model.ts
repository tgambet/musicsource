import { Opaque } from 'type-fest';
import { hash } from '@app/core/utils';
import { SongId } from '@app/database/songs/song.model';
import { AlbumId } from '@app/database/albums/album.model';
import { ArtistId } from '@app/database/artists/artist.model';

export type PictureId = Opaque<string, Picture>;

export const getPictureId = (data: string): PictureId =>
  hash(data) as PictureId;

export type Picture = {
  id: PictureId;
  name?: string;
  original?: string;
  sources: { src: string; height: number; width?: number }[];
  entries: string[];
  songs: SongId[];
  albums: AlbumId[];
  artists: ArtistId[];
};
