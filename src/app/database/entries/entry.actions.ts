import { createAction, props } from '@ngrx/store';

export const loadEntries = createAction('[Entry] Load Entries');

export const loadEntriesSuccess = createAction(
  '[Entry] Load Entries Success',
  props<{ data: any }>()
);

export const loadEntriesFailure = createAction(
  '[Entry] Load Entries Failure',
  props<{ error: any }>()
);
