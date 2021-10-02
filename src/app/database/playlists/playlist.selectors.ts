import { createFeatureSelector } from '@ngrx/store';
import { playlistFeatureKey, PlaylistState } from './playlist.reducer';

export const selectPlaylistState =
  createFeatureSelector<PlaylistState>(playlistFeatureKey);
