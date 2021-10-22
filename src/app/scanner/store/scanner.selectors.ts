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

export const selectLabel = createSelector(
  selectCoreState,
  (state) => state.label
);

export const selectExtractedProgress = createSelector(
  selectCoreState,
  (state) => Math.floor((state.extractedCount / state.extractingCount) * 100)
);

export const selectSavedProgress = createSelector(selectCoreState, (state) =>
  Math.floor((state.savedCount / state.savingCount) * 100)
);

export const selectScannedCount = createSelector(
  selectCoreState,
  (state) => state.scannedCount
);

export const selectExtractedCount = createSelector(
  selectCoreState,
  (state) => state.extractedCount
);

export const selectExtractingCount = createSelector(
  selectCoreState,
  (state) => state.extractingCount
);

export const selectSavedCount = createSelector(
  selectCoreState,
  (state) => state.savedCount
);

export const selectSavingCount = createSelector(
  selectCoreState,
  (state) => state.savingCount
);
