import { createReducer, on } from '@ngrx/store';
import {
  loadPlaylists,
  loadPlaylistsFailure,
  loadPlaylistsSuccess,
  updatePlaylist,
} from './playlist.actions';
import { Playlist } from '@app/database/playlists/playlist.model';
import { createIDBEntityAdapter, IDBEntityState } from '@creasource/ngrx-idb';

export const playlistFeatureKey = 'playlists';

const indexes = ['title', 'createdOn', 'listenedOn'] as const;

export type PlaylistIndex = typeof indexes[number];

export type PlaylistState = IDBEntityState<Playlist, PlaylistIndex>;

export const playlistAdapter = createIDBEntityAdapter<Playlist, PlaylistIndex>({
  keySelector: (model) => model.hash,
  indexes,
});

export const initialState: PlaylistState = playlistAdapter.getInitialState();

export const playlistReducer = createReducer(
  initialState,

  on(loadPlaylists, (state) => state),
  on(loadPlaylistsSuccess, (state, action) =>
    playlistAdapter.addMany(action.data, state)
  ),
  on(loadPlaylistsFailure, (state, action) => state),
  on(updatePlaylist, (state, action) =>
    playlistAdapter.updateOne(action.update, state)
  )
);
