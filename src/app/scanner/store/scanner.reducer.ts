import { ActionReducer, createReducer, on } from '@ngrx/store';
import * as Actions from './scanner.actions';
import { initialState, ScannerState } from './scanner.state';

export const scannerReducer: ActionReducer<ScannerState> = createReducer(
  initialState,

  on(Actions.scanStart, (state) => ({ ...state, state: 'scanning' })),
  on(Actions.scanEnd, (state) => ({ ...state, state: 'idle' })),
  on(Actions.setLabel, (state, { label }) => ({ ...state, label })),
  on(Actions.scanSuccess, (state) => ({ ...state, state: 'success' })),
  on(Actions.scanFailure, (state, { error }) => ({
    ...state,
    error,
    state: 'error',
  }))
);
