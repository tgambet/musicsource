import { createAction, props } from '@ngrx/store';
import { Album } from '@app/database/albums/album.model';
import { IdUpdate } from '@app/core/utils';

export const loadAlbums = createAction('[Album] Load Albums');

export const loadAlbumsSuccess = createAction(
  '[Album] Load Album Success',
  props<{ data: Album[] }>()
);

export const loadAlbumsFailure = createAction(
  '[Album] Load Albums Failure',
  props<{ error: any }>()
);

export const updateAlbum = createAction(
  '[Album] Update Album',
  props<{ update: IdUpdate<Album> }>()
);
