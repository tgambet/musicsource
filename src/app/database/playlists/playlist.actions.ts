import { createAction, props } from '@ngrx/store';

export const loadPlaylists = createAction(
  '[Playlist] Load Playlists'
);

export const loadPlaylistsSuccess = createAction(
  '[Playlist] Load Playlists Success',
  props<{ data: any }>()
);

export const loadPlaylistsFailure = createAction(
  '[Playlist] Load Playlists Failure',
  props<{ error: any }>()
);
