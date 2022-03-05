import { createAction, props } from '@ngrx/store';
import { AlbumId } from '@app/database/albums/album.model';

export const playAlbum = createAction(
  'player/album-play',
  props<{ id: AlbumId; shuffle: boolean }>()
);

export const addAlbumToQueue = createAction(
  'player/album-addToQueue',
  props<{ id: AlbumId; next: boolean }>()
);
