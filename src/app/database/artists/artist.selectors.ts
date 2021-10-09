import { createFeatureSelector, createSelector } from '@ngrx/store';
import { artistAdapter, artistFeatureKey, ArtistState } from './artist.reducer';
import { ArtistId } from '@app/database/artists/artist.model';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

export const selectArtistState =
  createFeatureSelector<ArtistState>(artistFeatureKey);

export const {
  selectIndexKeys: selectArtistIndexKeys,
  selectIndexEntities: selectArtistIndexEntities,
  selectIndexAll: selectArtistIndexAll,
  selectKeys: selectArtistKeys,
  selectEntities: selectArtistEntities,
  selectAll: selectArtistAll,
  selectTotal: selectArtistTotal,
} = artistAdapter.getSelectors(selectArtistState);

export const selectArtistByKey = (key: ArtistId) =>
  createSelector(selectArtistEntities, (entities) => entities[key]);
