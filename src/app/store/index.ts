import { ActionReducerMap } from '@ngrx/store';

import { scannerReducer, ScannerState } from './scanner';
import { libraryReducer, LibraryState } from './library';
import { CoreState } from './core.state';
import { coreReducer } from './core.reducer';

export interface State {
  core: CoreState;
  scanner: ScannerState;
  library: LibraryState;
}

export const reducers: ActionReducerMap<State> = {
  core: coreReducer,
  scanner: scannerReducer,
  library: libraryReducer,
};
