import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  albumAdapter,
  albumFeatureKey,
  AlbumState,
} from '@app/database/albums/album.reducer';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

export const selectAlbumState =
  createFeatureSelector<AlbumState>(albumFeatureKey);

export const {
  selectIndexKeys: selectAlbumIndexKeys,
  selectIndexEntities: selectAlbumIndexEntities,
  selectIndexAll: selectAlbumIndexAll,
  selectKeys: selectAlbumKeys,
  selectEntities: selectAlbumEntities,
  selectAll: selectAlbumAll,
  selectTotal: selectAlbumTotal,
} = albumAdapter.getSelectors(selectAlbumState);

export const selectAlbumByKey = (key: string) =>
  createSelector(selectAlbumEntities, (entities) => entities[key]);
