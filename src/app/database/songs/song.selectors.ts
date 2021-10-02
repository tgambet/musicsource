import { createFeatureSelector } from '@ngrx/store';
import { songFeatureKey, SongState } from './song.reducer';

export const selectSongState = createFeatureSelector<SongState>(songFeatureKey);
