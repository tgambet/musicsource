import { createFeatureSelector } from '@ngrx/store';
import { entryFeatureKey, EntryState } from './entry.reducer';

export const selectEntryState =
  createFeatureSelector<EntryState>(entryFeatureKey);
