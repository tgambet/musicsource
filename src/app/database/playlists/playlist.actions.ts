import { createAction, props } from '@ngrx/store';
import { Playlist } from '@app/database/playlists/playlist.model';
import { Update } from '@creasource/ngrx-idb';

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
  props<{ update: Update<Playlist> }>()
);
