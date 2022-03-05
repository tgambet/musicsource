import { createAction, props } from '@ngrx/store';
import { AlbumId } from '@app/database/albums/album.model';
import { Song, SongId } from '@app/database/songs/song.model';
import { PlaylistId } from '@app/database/playlists/playlist.model';

export const playAlbum = createAction(
  'helper/album-play',
  props<{ id: AlbumId; shuffle: boolean }>()
);

export const playPlaylist = createAction(
  'helper/playlist-play',
  props<{ id: PlaylistId; shuffle: boolean }>()
);

export const addAlbumToQueue = createAction(
  'helper/album-addToQueue',
  props<{ id: AlbumId; next: boolean }>()
);

export const addPlaylistToQueue = createAction(
  'helper/playlist-addToQueue',
  props<{ id: PlaylistId; next: boolean }>()
);

export const addSongsToPlaylist = createAction(
  'helper/songs-addToPlaylist',
  props<{ songs: SongId[] }>()
);

export const addAlbumToPlaylist = createAction(
  'helper/album-addToPlaylist',
  props<{ id: AlbumId }>()
);

export const addPlaylistToPlaylist = createAction(
  'helper/playlist-addToPlaylist',
  props<{ id: PlaylistId }>()
);

export const addSongsToQueue = createAction(
  'helper/songs-addToQueue',
  props<{ songs: SongId[]; next: boolean; message: string }>()
);

export const removeSongFromQueue = createAction(
  'helper/songs-removeFromQueue',
  props<{ song: Song }>()
);

export const openSnack = createAction(
  'helper/snack-open',
  props<{ message: string }>()
);
