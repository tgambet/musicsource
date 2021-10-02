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
  selectIndex,
  selectIndexKeys,
  selectIndexAll,
  selectKeys,
  selectEntities,
  selectAll,
  selectTotal,
} = albumAdapter.getSelectors();

export const selectAllAlbums = createSelector(selectAlbumState, selectAll);

export const selectAlbumEntities = createSelector(
  selectAlbumState,
  selectEntities
);

export const selectAllAlbumsWithKey = createSelector(
  selectAlbumEntities,
  (entities) => Object.keys(entities).map((key) => ({ ...entities[key], key }))
);

export const selectAlbumIndex = (index: string) =>
  createSelector(selectAlbumState, selectIndex(index));

export const selectAlbumIds = createSelector(selectAlbumState, selectKeys);

export const selectAlbumTotal = createSelector(selectAlbumState, selectTotal);

export const selectAlbumByHash = (hash: string) =>
  createSelector(selectAlbumEntities, (entities: any) => entities[hash]);

// export const selectYears = createSelector(
//   selectAlbumState,
//   selectIndexKeys('year')
// );

// const empty: readonly [] = [];
//
// export const selectYearIndex = (year: number) =>
//   createSelector(
//     selectAlbumIndex('year'),
//     (index) => (index && index[year]) || empty
//   );
//
// export const selectYearIndex2 = createSelector(
//   selectAlbumIndex('albumArtist'),
//   selectAlbumEntities,
//   (index, entities) =>
//     (index &&
//       Object.keys(index)
//         .sort()
//         .map((i) => index[i])
//         .reduce((acc, curr) => [...acc, ...curr] as any, [])
//         .map((key) => entities[key])) ||
//     empty
// );

export const selectAllByIndex = (index: string) =>
  createSelector(selectAlbumState, selectIndexAll(index));

// export const selectByYear = (year: number) =>
//   createSelector(
//     selectYearIndex(year),
//     selectAlbumEntities,
//     (index, entities) => index.map((y) => entities[y] as Album)
//   );
