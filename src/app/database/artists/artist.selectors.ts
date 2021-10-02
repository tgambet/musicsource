import { createFeatureSelector } from '@ngrx/store';
import { artistFeatureKey, ArtistState } from './artist.reducer';

export const selectArtistState =
  createFeatureSelector<ArtistState>(artistFeatureKey);
