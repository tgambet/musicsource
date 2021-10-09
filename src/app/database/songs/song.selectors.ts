import { createFeatureSelector, createSelector } from '@ngrx/store';
import { songAdapter, songFeatureKey, SongState } from './song.reducer';
import { Song } from '@app/database/songs/song.model';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

export const selectSongState = createFeatureSelector<SongState>(songFeatureKey);

export const {
  selectIndexKeys: selectSongIndexKeys,
  selectIndexEntities: selectSongIndexEntities,
  selectIndexAll: selectSongIndexAll,
  selectKeys: selectSongKeys,
  selectEntities: selectSongEntities,
  selectAll: selectSongAll,
  selectTotal: selectSongTotal,
} = songAdapter.getSelectors(selectSongState);

export const selectSongByKey = (key: string) =>
  createSelector(selectSongEntities, (entities) => entities[key]);

export const selectSongByKeys = (keys: string[]) =>
  createSelector(selectSongEntities, (entities) =>
    keys.map((k) => entities[k]).filter((s): s is Song => !!s)
  );

export const selectSongByAlbumKey = (key: string) =>
  createSelector(
    selectSongEntities,
    selectSongIndexEntities('albumId'),
    (entities, index) => index[key]?.map((k) => entities[k as any] as Song)
  );

export const selectSongByArtistKey = (key: string) =>
  createSelector(
    selectSongEntities,
    selectSongIndexEntities('artists'),
    (entities, index) => index[key]?.map((k) => entities[k as any] as Song)
  );
