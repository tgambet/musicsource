import { createFeatureSelector } from '@ngrx/store';
import {
  playlistAdapter,
  playlistFeatureKey,
  PlaylistState,
} from './playlist.reducer';

export const selectPlaylistState =
  createFeatureSelector<PlaylistState>(playlistFeatureKey);

export const {
  selectIndexKeys: selectPlaylistIndexKeys,
  selectIndexEntities: selectPlaylistIndexEntities,
  selectIndexAll: selectPlaylistIndexAll,
  selectKeys: selectPlaylistKeys,
  selectEntities: selectPlaylistEntities,
  selectAll: selectPlaylistAll,
  selectTotal: selectPlaylistTotal,
} = playlistAdapter.getSelectors(selectPlaylistState);
