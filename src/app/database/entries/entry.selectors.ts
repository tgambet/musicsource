import { createFeatureSelector } from '@ngrx/store';
import { entryAdapter, entryFeatureKey, EntryState } from './entry.reducer';

export const selectEntryState =
  createFeatureSelector<EntryState>(entryFeatureKey);

export const {
  selectIndexKeys: selectEntryIndexKeys,
  selectIndexEntities: selectEntryIndexEntities,
  selectIndexAll: selectEntryIndexAll,
  selectKeys: selectEntryKeys,
  selectEntities: selectEntryEntities,
  selectAll: selectEntryAll,
  selectTotal: selectEntryTotal,
} = entryAdapter.getSelectors(selectEntryState);
