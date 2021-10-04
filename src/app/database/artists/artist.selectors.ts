import { createFeatureSelector } from '@ngrx/store';
import { artistAdapter, artistFeatureKey, ArtistState } from './artist.reducer';

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
