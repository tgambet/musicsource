import { createAction, props } from '@ngrx/store';

export const openDirectory = createAction('scanner/open');
export const scanStart = createAction('scanner/start');
export const scanEnd = createAction('scanner/end');
export const setLabel = createAction(
  'scanner/label',
  props<{ label: string }>()
);
export const scanSuccess = createAction('scanner/success');
export const scanFailure = createAction(
  'scanner/failure',
  props<{ error: any }>()
);
