import { createAction, props } from '@ngrx/store';
import { Entry } from '@app/database/entries/entry.model';

export const loadEntries = createAction('[Entry] Load Entries');

export const loadEntriesSuccess = createAction(
  '[Entry] Load Entries Success',
  props<{ data: Entry[] }>()
);

export const loadEntriesFailure = createAction(
  '[Entry] Load Entries Failure',
  props<{ error: any }>()
);
