import { ActionReducer, createReducer, on } from '@ngrx/store';
import * as Actions from './scanner.actions';
import { initialState, ScannerState } from './scanner.state';

// const format = (value: number) => formatNumber(value, 'en_US');

export const scannerReducer: ActionReducer<ScannerState> = createReducer(
  initialState,

  // TODO
  on(Actions.scanStart, () => ({ ...initialState })),
  on(Actions.scanEnd, () => ({ ...initialState })),
  on(Actions.scanEnded, () => ({ ...initialState })),
  on(Actions.scanSuccess, () => ({ ...initialState })),
  on(Actions.scanFailure, () => ({ ...initialState })),

  // Step 1
  on(Actions.openDirectory, () => ({ ...initialState })),
  on(Actions.openDirectorySuccess, (state) => state),
  on(Actions.openDirectoryFailure, () => ({ ...initialState })),

  // Step 2
  on(Actions.scanEntries, (state) => ({
    ...state,
    state: 'scanning',
  })),
  on(Actions.saveEntry, (state) => ({
    ...state,
    state: 'extracting',
    scannedCount: state.scannedCount + 1,
  })),
  on(Actions.scanEntriesSuccess, (state) => ({
    ...state,
    state: 'extracting',
  })),
  on(Actions.scanEntriesFailure, (state, { error }) => ({
    ...state,
    state: 'error', // TODO
    label: error?.message || error,
  })),

  on(Actions.extractImageEntry, (state) => ({
    ...state,
    extractingCount: state.extractingCount + 1,
  })),
  on(Actions.extractMetaEntry, (state) => ({
    ...state,
    extractingCount: state.extractingCount + 1,
  })),
  on(Actions.extractSongEntry, (state) => ({
    ...state,
    extractingCount: state.extractingCount + 1,
  })),

  on(Actions.extractSuccess, (state, { label }) => ({
    ...state,
    label: label ?? state.label,
    extractedCount: state.extractedCount + 1,
    state:
      state.state === 'extracting' &&
      state.extractingCount === state.extractedCount + 1
        ? 'saving'
        : state.state,
  })),
  on(Actions.extractFailure, (state) => ({
    ...state,
    extractedCount: state.extractedCount + 1,
    state:
      state.state === 'extracting' &&
      state.extractingCount === state.extractedCount + 1
        ? 'saving'
        : state.state,
  })),

  on(Actions.saveEntry, (state) => ({
    ...state,
    savingCount: state.savingCount + 1,
  })),
  on(Actions.saveImage, (state) => ({
    ...state,
    savingCount: state.savingCount + 1,
  })),
  on(Actions.saveMeta, (state) => ({
    ...state,
    savingCount: state.savingCount + 1,
  })),
  on(Actions.saveArtist, (state) => ({
    ...state,
    savingCount: state.savingCount + 1,
  })),
  on(Actions.saveAlbum, (state) => ({
    ...state,
    savingCount: state.savingCount + 1,
  })),
  on(Actions.saveSong, (state) => ({
    ...state,
    savingCount: state.savingCount + 1,
  })),
  on(Actions.saveSuccess, (state, { count }) => ({
    ...state,
    savedCount: state.savedCount + count,
    state:
      state.state === 'saving' && state.savingCount === state.savedCount + count
        ? 'success'
        : state.state,
  })),
  on(Actions.saveFailure, (state, { count, error }) => {
    console.log(error);

    return {
      ...state,
      savedCount: state.savedCount + count,
      state:
        state.state === 'saving' &&
        state.savingCount === state.savedCount + count
          ? 'success'
          : state.state,
    };
  })
);
