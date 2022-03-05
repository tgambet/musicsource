import { createAction, props } from '@ngrx/store';
import { AlbumId } from '@app/database/albums/album.model';
import { Song } from '@app/database/songs/song.model';

export const playAlbum = createAction(
  'player/album-play',
  props<{ id: AlbumId; shuffle: boolean }>()
);

export const addAlbumToQueue = createAction(
  'player/album-addToQueue',
  props<{ id: AlbumId; next: boolean }>()
);

export const addSongsToPlaylist = createAction(
  'player/songs-addToPlaylist',
  props<{ songs: Song[] }>()
);

export const addAlbumToPlaylist = createAction(
  'player/album-addToPlaylist',
  props<{ id: AlbumId }>()
);
