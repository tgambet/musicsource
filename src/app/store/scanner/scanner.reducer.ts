import { ActionReducer, createReducer, on } from '@ngrx/store';
import * as Actions from './scanner.actions';
import { initialState, ScannerState, ScannerStateEnum } from './scanner.state';
import { isFile } from '@app/utils/entry.util';

export const scannerReducer: ActionReducer<ScannerState> = createReducer(
  initialState,

  on(Actions.openDirectory, (state) => ({
    ...state,
    ...initialState,
  })),

  on(Actions.scannedEntry, (state, { entry }) => ({
    ...state,
    state: ScannerStateEnum.scanning,
    scannedCount: isFile(entry) ? state.scannedCount + 1 : state.scannedCount,
    latestScanned: entry.path,
    scannedEntries: [...state.scannedEntries, entry],
  })),

  on(Actions.scanSucceeded, (state) => ({
    ...state,
    state: ScannerStateEnum.parsing,
    // scannedCount: count,
  })),

  on(Actions.scanFailed, (state, { error }) => ({
    ...state,
    state: ScannerStateEnum.error,
    error,
  })),

  on(Actions.parseEntrySucceeded, (state, { song, pictures }) => ({
    ...state,
    parsedCount: state.parsedCount + 1,
    latestParsed: (song.albumartist || song.artist) + ' - ' + song.title,
    parsedEntries: [...state.parsedEntries, { song, pictures }],
  })),

  on(Actions.parseEntryFailed, (state) => ({
    ...state,
    parsedCount: state.parsedCount + 1,
  })),

  on(Actions.parseEntriesSucceeded, (state) => ({
    ...state,
    state: ScannerStateEnum.building,
  })),

  on(Actions.parseEntriesFailed, (state, { error }) => ({
    ...state,
    state: ScannerStateEnum.error,
    error,
  })),

  on(Actions.saveParsedEntriesSuccess, (state) => ({
    ...state,
    ...initialState,
  })),

  on(Actions.scanAborted, (state) => ({
    ...state,
    ...initialState,
  })),

  on(Actions.saveParsedEntriesFailure, (state, { error }) => ({
    ...state,
    state: ScannerStateEnum.error,
    error,
  }))
);
