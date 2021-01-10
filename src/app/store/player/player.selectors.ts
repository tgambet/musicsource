import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PlayerState } from '@app/store/player/player.state';

export const selectPlayerState = createFeatureSelector<PlayerState>('player');

export const selectShow = createSelector(
  selectPlayerState,
  (state) => state.show
);

export const selectPlaylist = createSelector(
  selectPlayerState,
  (state) => state.playlist
);

export const selectCurrentIndex = createSelector(
  selectPlayerState,
  (state) => state.currentIndex || 0
);

export const selectCurrentSong = createSelector(
  selectPlaylist,
  selectCurrentIndex,
  (playlist, index) => playlist[index]
);

export const selectHasNextSong = createSelector(
  selectPlaylist,
  selectCurrentIndex,
  (playlist, index) => playlist[index + 1] !== undefined
);

export const selectHasPrevSong = createSelector(
  selectPlaylist,
  selectCurrentIndex,
  (playlist, index) => playlist[index - 1] !== undefined
);

export const selectPlaying = createSelector(
  selectPlayerState,
  (state) => state.playing
);

export const selectDuration = createSelector(
  selectPlayerState,
  (state) => state.duration || 0
);
