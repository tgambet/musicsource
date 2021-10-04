import { createFeatureSelector } from '@ngrx/store';
import { songAdapter, songFeatureKey, SongState } from './song.reducer';

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
