import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  playlistAdapter,
  playlistFeatureKey,
  PlaylistIndex,
  PlaylistState,
} from './playlist.reducer';
import { Playlist, PlaylistId } from '@app/database/playlists/playlist.model';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

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

export const selectPlaylistByKey = (key: PlaylistId) =>
  createSelector(selectPlaylistEntities, (entities) => entities[key]);

export const selectPlaylistsByIndexKey = (
  key: PlaylistId,
  index: PlaylistIndex
) =>
  createSelector(
    selectPlaylistEntities,
    selectPlaylistIndexEntities(index),
    (entities, indexKeys) =>
      (indexKeys[key] || []).map((k) => entities[k as any] as Playlist)
  );
