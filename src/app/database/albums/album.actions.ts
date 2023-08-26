import { createAction, props } from '@ngrx/store';
import { Album } from '@app/database/albums/album.model';
import { IdUpdate } from '@app/core/utils';

export const removeAllAlbums = createAction('albums/remove-all');

export const loadAlbums = createAction('[Album] Load Albums');

export const loadAlbumsSuccess = createAction(
  '[Album] Load Album Success',
  props<{ data: Album[] }>(),
);

export const loadAlbumsFailure = createAction(
  '[Album] Load Albums Failure',
  props<{ error: any }>(),
);

export const addAlbum = createAction(
  '[Album] Add Album',
  props<{ album: Album }>(),
);

export const updateAlbum = createAction(
  '[Album] Update Album',
  props<{ update: IdUpdate<Album> }>(),
);

export const upsertAlbum = createAction(
  '[Album] Upsert Album',
  props<{ album: Album }>(),
);
