import { ActionReducer, createReducer, on } from '@ngrx/store';
import * as Actions from './scanner.actions';
import { initialState, ScannerState, ScannerStateEnum } from './scanner.state';
import { isFile } from '@app/utils/entry.util';

export const scannerReducer: ActionReducer<ScannerState> = createReducer(
  initialState,
  on(Actions.openDirectory, (state) => ({
    ...state,
    ...initialState,
    state: ScannerStateEnum.prompted,
  })),
  on(Actions.scannedFile, (state, { entry }) => ({
    ...state,
    state: ScannerStateEnum.scanning,
    scannedCount: isFile(entry) ? state.scannedCount + 1 : state.scannedCount,
    latestScanned: entry.path,
  })),
  on(Actions.scanSucceeded, (state) => ({
    ...state,
    // scannedCount: count,
  })),
  on(Actions.scanFailed, (state, { error }) => ({
    ...state,
    state: ScannerStateEnum.error,
    error,
  })),
  on(Actions.scanAborted, (state) => ({
    ...state,
    state: ScannerStateEnum.aborted,
  })),
  on(Actions.startParsing, (state) => ({
    ...state,
    state: ScannerStateEnum.parsing,
  })),
  on(Actions.parseEntrySucceeded, (state, { song }) => ({
    ...state,
    parsedCount: state.parsedCount + 1,
    latestParsed: (song.albumartist || song.artist) + ' - ' + song.title,
  })),
  on(Actions.parseEntryFailed, (state) => ({
    ...state,
    parsedCount: state.parsedCount + 1,
  })),
  on(Actions.parseEntriesSucceeded, (state) => ({
    ...state,
    state: ScannerStateEnum.success,
  })),
  on(Actions.parseEntriesFailed, (state, { error }) => ({
    ...state,
    state: ScannerStateEnum.error,
    error,
  }))
);
