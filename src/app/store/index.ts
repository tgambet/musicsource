import { ActionReducerMap } from '@ngrx/store';

import { scannerReducer, ScannerState } from './scanner';
import { libraryReducer, LibraryState } from './library';
import { CoreState } from './core.state';
import { coreReducer } from './core.reducer';
import { PlayerState } from '@app/store/player/player.state';
import { playerReducer } from '@app/store/player/player.reducer';

export interface State {
  core: CoreState;
  scanner: ScannerState;
  library: LibraryState;
  player: PlayerState;
}

export const reducers: ActionReducerMap<State> = {
  core: coreReducer,
  scanner: scannerReducer,
  library: libraryReducer,
  player: playerReducer,
};
