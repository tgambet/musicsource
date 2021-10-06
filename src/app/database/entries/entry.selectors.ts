import { createFeatureSelector, createSelector } from '@ngrx/store';
import { entryAdapter, entryFeatureKey, EntryState } from './entry.reducer';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

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

export const selectEntryByKey = (key: string) =>
  createSelector(selectEntryEntities, (entities) => entities[key]);
