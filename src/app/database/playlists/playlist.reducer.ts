import { createReducer, on } from '@ngrx/store';
import {
  addPlaylist,
  deletePlaylist,
  loadPlaylists,
  loadPlaylistsFailure,
  loadPlaylistsSuccess,
  removeAllPlaylists,
  updatePlaylist,
} from './playlist.actions';
import { Playlist } from '@app/database/playlists/playlist.model';
import { createIDBEntityAdapter, IDBEntityState } from '@creasource/ngrx-idb';

export const playlistFeatureKey = 'playlists';

const indexes = ['title', 'createdOn'] as const;

export type PlaylistIndex = typeof indexes[number];

export type PlaylistState = IDBEntityState<Playlist, PlaylistIndex>;

export const playlistAdapter = createIDBEntityAdapter({
  keySelector: (model: Playlist) => model.id,
  indexes,
});

export const initialState: PlaylistState = playlistAdapter.getInitialState();

export const playlistReducer = createReducer(
  initialState,

  on(removeAllPlaylists, (state) => playlistAdapter.removeAll(state)),
  on(loadPlaylists, (state) => state),
  on(loadPlaylistsSuccess, (state, action) =>
    playlistAdapter.addMany(action.data, state)
  ),
  on(loadPlaylistsFailure, (state) => state),
  on(updatePlaylist, (state, action) =>
    playlistAdapter.updateOne(action.update, state)
  ),
  on(addPlaylist, (state, action) =>
    playlistAdapter.addOne(action.playlist, state)
  ),
  on(deletePlaylist, (state, action) =>
    playlistAdapter.removeOne(action.id, state)
  )
);
