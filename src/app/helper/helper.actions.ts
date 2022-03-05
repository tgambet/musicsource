import { createAction, props } from '@ngrx/store';
import { AlbumId } from '@app/database/albums/album.model';
import { Song } from '@app/database/songs/song.model';

export const playAlbum = createAction(
  'helper/album-play',
  props<{ id: AlbumId; shuffle: boolean }>()
);

export const addAlbumToQueue = createAction(
  'helper/album-addToQueue',
  props<{ id: AlbumId; next: boolean }>()
);

export const addSongsToPlaylist = createAction(
  'helper/songs-addToPlaylist',
  props<{ songs: Song[] }>()
);

export const addAlbumToPlaylist = createAction(
  'helper/album-addToPlaylist',
  props<{ id: AlbumId }>()
);

export const addSongsToQueue = createAction(
  'helper/songs-addToQueue',
  props<{ songs: Song[]; next: boolean; message: string }>()
);

export const removeSongFromQueue = createAction(
  'helper/songs-removeFromQueue',
  props<{ song: Song }>()
);

export const openSnack = createAction(
  'helper/snack-open',
  props<{ message: string }>()
);
