import { createReducer, on } from '@ngrx/store';
import * as EntryActions from './entry.actions';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Entry } from '@app/database/entries/entry.model';

export const entryFeatureKey = 'entries';

export type EntryState = EntityState<Entry>;

export const entryAdapter: EntityAdapter<Entry> = createEntityAdapter<Entry>({
  selectId: (model) => model.path,
});

export const initialState: EntryState = entryAdapter.getInitialState();

export const entryReducer = createReducer(
  initialState,

  on(EntryActions.loadEntries, (state) => state),
  on(EntryActions.loadEntriesSuccess, (state, action) => state),
  on(EntryActions.loadEntriesFailure, (state, action) => state)
);
