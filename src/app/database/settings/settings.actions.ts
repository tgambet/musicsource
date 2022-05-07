import { createAction } from '@ngrx/store';

export const synchronizeLibrary = createAction('settings/synchronize');
export const clearDatabase = createAction('settings/clear-database');
