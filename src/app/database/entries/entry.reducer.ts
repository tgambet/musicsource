import { createReducer, on } from '@ngrx/store';
import { Entry } from '@app/database/entries/entry.model';
import { createIDBEntityAdapter, IDBEntityState } from '@creasource/ngrx-idb';
import {
  addEntry,
  loadEntries,
  loadEntriesFailure,
  loadEntriesSuccess,
} from '@app/database/entries/entry.actions';

export const entryFeatureKey = 'entries';

export const indexes = ['parent'] as const;

export type EntryIndex = typeof indexes[number];

export type EntryState = IDBEntityState<Entry, EntryIndex>;

export const entryAdapter = createIDBEntityAdapter<Entry, EntryIndex>({
  keySelector: (model) => model.path,
  indexes,
});

export const initialState: EntryState = entryAdapter.getInitialState();

export const entryReducer = createReducer(
  initialState,

  on(loadEntries, (state) => state),
  on(loadEntriesSuccess, (state, action) =>
    entryAdapter.addMany(action.data, state)
  ),
  on(loadEntriesFailure, (state) => state),
  on(addEntry, (state, { entry }) => entryAdapter.addOne(entry, state))
);
