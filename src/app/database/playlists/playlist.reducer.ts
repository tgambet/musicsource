import { createReducer, on } from '@ngrx/store';
import * as PlaylistActions from './playlist.actions';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Playlist } from '@app/database/playlists/playlist.model';

export const playlistFeatureKey = 'playlist';

export type PlaylistState = EntityState<Playlist>;

export const playlistAdapter: EntityAdapter<Playlist> =
  createEntityAdapter<Playlist>({
    selectId: (model) => model.hash,
  });

export const initialState: PlaylistState = playlistAdapter.getInitialState();

export const playlistReducer = createReducer(
  initialState,

  on(PlaylistActions.loadPlaylists, (state) => state),
  on(PlaylistActions.loadPlaylistsSuccess, (state, action) => state),
  on(PlaylistActions.loadPlaylistsFailure, (state, action) => state)
);
