import { createAction, props } from '@ngrx/store';
import { Playlist } from '@app/database/playlists/playlist.model';
import { IdUpdate } from '@app/core/utils';

export const removeAllPlaylists = createAction('playlists/remove-all');

export const loadPlaylists = createAction('[Playlist] Load Playlists');

export const loadPlaylistsSuccess = createAction(
  '[Playlist] Load Playlists Success',
  props<{ data: Playlist[] }>()
);

export const loadPlaylistsFailure = createAction(
  '[Playlist] Load Playlists Failure',
  props<{ error: any }>()
);

export const updatePlaylist = createAction(
  '[Playlist] Update Playlist',
  props<{ update: IdUpdate<Playlist> }>()
);

export const addPlaylist = createAction(
  '[Playlist] Create Playlist',
  props<{ playlist: Playlist }>()
);
