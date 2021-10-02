import { createAction, props } from '@ngrx/store';

export const loadSongs = createAction(
  '[Song] Load Songs'
);

export const loadSongsSuccess = createAction(
  '[Song] Load Songs Success',
  props<{ data: any }>()
);

export const loadSongsFailure = createAction(
  '[Song] Load Songs Failure',
  props<{ error: any }>()
);
