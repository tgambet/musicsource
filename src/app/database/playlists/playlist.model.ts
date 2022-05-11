import { Opaque } from 'type-fest';
import { hash } from '@app/core/utils';
import { SongId } from '@app/database/songs/song.model';
import { AlbumId } from '@app/database/albums/album.model';
import { ArtistId } from '@app/database/artists/artist.model';

export type PlaylistId = Opaque<string, Playlist>;

export const getPlaylistId = (data: string): PlaylistId =>
  hash(data) as PlaylistId;

export interface Playlist {
  id: PlaylistId;
  title: string;
  description?: string;
  songs: SongId[];
  albums: AlbumId[];
  artists: ArtistId[];
  createdOn: number; // TODO updatedOn
  likedOn?: number;
}
