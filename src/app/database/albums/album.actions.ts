import { createAction, props } from '@ngrx/store';
import { Album } from '@app/database/albums/album.model';
import { Update } from '@creasource/ngrx-idb';

export const loadAlbums = createAction('[Album] Load Albums');

export const loadAlbumSuccess = createAction(
  '[Album] Load Album Success',
  props<{ data: Album[] }>()
);

export const loadAlbumsFailure = createAction(
  '[Album] Load Albums Failure',
  props<{ error: any }>()
);

export const updateAlbum = createAction(
  '[Album] Update Album',
  props<{ update: Update<Album> }>()
);
