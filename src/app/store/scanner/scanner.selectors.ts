import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ScannerState } from './scanner.state';

export const selectCoreState = createFeatureSelector<ScannerState>('scanner');

export const selectScannedCount = createSelector(
  selectCoreState,
  (state) => state.scannedCount
);

export const selectParsedCount = createSelector(
  selectCoreState,
  (state) => state.parsedCount
);

export const selectLatestScanned = createSelector(
  selectCoreState,
  (state) => state.latestScanned
);

export const selectLatestParsed = createSelector(
  selectCoreState,
  (state) => state.latestParsed
);

export const selectProgressRatio = createSelector(selectCoreState, (state) =>
  state.scannedCount === 0 ? 0 : state.parsedCount / state.scannedCount
);

export const selectProgress = createSelector(selectProgressRatio, (ratio) =>
  Math.ceil(ratio * 100)
);

export const selectScannerState = createSelector(
  selectCoreState,
  (state) => state.state
);

export const selectError = createSelector(
  selectCoreState,
  (state) => state.error
);
