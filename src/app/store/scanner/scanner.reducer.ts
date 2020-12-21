import { ActionReducer, createReducer, on } from '@ngrx/store';
import * as Actions from './scanner.actions';
import { initialState, ScannerState, ScannerStateEnum } from './scanner.state';

export const scannerReducer: ActionReducer<ScannerState> = createReducer(
  initialState,

  on(Actions.scanAborted, () => ({ ...initialState })),
  on(Actions.scanSuccess, () => ({ ...initialState })),

  // Step 1
  on(Actions.openDirectory, () => ({ ...initialState })),
  on(Actions.openDirectorySuccess, (state) => ({ ...state })),
  on(Actions.openDirectoryFailure, (state, { error }) => ({
    ...state,
    state: ScannerStateEnum.error,
    error,
  })),

  // Step 2
  on(Actions.scanEntries, (state) => ({
    ...state,
    state: ScannerStateEnum.scanning,
  })),
  on(Actions.scanEntrySuccess, (state, { entry }) => ({
    ...state,
    log: entry.path,
    scannedCount: state.scannedCount + 1,
  })),
  on(Actions.scanEntryFailure, (state) => ({
    ...state,
    scannedCount: state.scannedCount + 1,
    // TODO log, error
  })),
  on(Actions.scanEntriesSuccess, (state) => ({
    ...state,
    // TODO scannedCount
    // TODO log
  })),
  on(Actions.scanEntriesFailure, (state) => ({
    ...state,
    state: ScannerStateEnum.error,
    // TODO error,
  })),

  // Step 3
  on(Actions.extractEntries, (state) => ({
    ...state,
    state: ScannerStateEnum.extracting,
  })),
  on(Actions.extractEntrySuccess, (state, { song }) => ({
    ...state,
    extractedCount: state.extractedCount + 1,
    log: (song.albumartist || song.artist) + ' - ' + song.title,
  })),
  on(Actions.extractEntryFailure, (state) => ({
    ...state,
    extractedCount: state.extractedCount + 1,
    // TODO error + log
  })),
  on(Actions.extractEntriesFailure, (state, { error }) => ({
    ...state,
    state: ScannerStateEnum.error,
    error,
  })),
  on(Actions.extractEntriesSuccess, (state) => ({
    ...state,
    // TODO log count
  }))

  // Step 4
);
