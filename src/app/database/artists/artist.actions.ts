import { createAction, props } from '@ngrx/store';

export const loadArtists = createAction(
  '[Artist] Load Artists'
);

export const loadArtistsSuccess = createAction(
  '[Artist] Load Artists Success',
  props<{ data: any }>()
);

export const loadArtistsFailure = createAction(
  '[Artist] Load Artists Failure',
  props<{ error: any }>()
);
