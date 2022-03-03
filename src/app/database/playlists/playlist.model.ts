import { Opaque } from 'type-fest';
import { hash } from '@app/core/utils';
import { PictureId } from '@app/database/pictures/picture.model';
import { SongId } from '@app/database/songs/song.model';

export type PlaylistId = Opaque<string, Playlist>;

export const getPlaylistId = (data: string): PlaylistId =>
  hash(data) as PlaylistId;

export interface Playlist {
  id: PlaylistId;
  title: string;
  description?: string;
  songs: SongId[];
  pictureKey?: PictureId;
  createdOn: number; // TODO updatedOn
  likedOn?: number;
}
