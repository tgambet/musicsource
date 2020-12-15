import { createFeatureSelector } from '@ngrx/store';
import { CoreState } from './core.state';

export const selectCoreState = createFeatureSelector<CoreState>('core');

// export const selectSpotifyToken = createSelector(
//   selectCoreState,
//   (state) => state.spotify.token
// );
