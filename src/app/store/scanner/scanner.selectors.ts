import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ScannerState } from './scanner.state';

export const selectCoreState = createFeatureSelector<ScannerState>('scanner');

// export const selectScannerState = createSelector(
//   selectCoreState,
//   (state) => state.state
// );

export const selectState = createSelector(
  selectCoreState,
  (state) => state.state
);

export const selectError = createSelector(
  selectCoreState,
  (state) => state.error
);

export const selectStep = createSelector(
  selectCoreState,
  (state) => state.step
);

export const selectStepSub = createSelector(
  selectCoreState,
  (state) => state.stepSub
);

export const selectProgress = createSelector(
  selectCoreState,
  (state) => state.progress
);

export const selectProgressDisplay = createSelector(
  selectCoreState,
  (state) => state.progressDisplay
);

export const selectProgressDisplaySub = createSelector(
  selectCoreState,
  (state) => state.progressDisplaySub
);

// export const selectScannedCount = createSelector(
//   selectCoreState,
//   (state) => state.scannedCount
// );
//
// export const selectExtractedCount = createSelector(
//   selectCoreState,
//   (state) => state.extractedCount
// );

// export const selectProgressRatio = createSelector(
//   selectScannedCount,
//   selectExtractedCount,
//   (scannedCount, extractedCount) =>
//     scannedCount === 0 ? 0 : extractedCount / scannedCount
// );
//
// export const selectProgress = createSelector(selectProgressRatio, (ratio) =>
//   Math.ceil(ratio * 100)
// );
