import { ActionReducer, createReducer } from '@ngrx/store';
import { CoreState, initialState } from '@app/store/core.state';

export const coreReducer: ActionReducer<CoreState> = createReducer(
  initialState
  // on(setSpotifyToken, (state, { token, expiresAt }) => ({
  //   ...state,
  //   spotify: { token, expiresAt },
  // })),
  // on(loadSpotifyTokenSuccess, (state, { token, expiresAt }) => ({
  //   ...state,
  //   spotify: { token, expiresAt },
  // }))
);
