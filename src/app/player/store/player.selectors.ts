import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PlayerState } from '@app/player/store/player.state';

export const selectPlayerState = createFeatureSelector<PlayerState>('player');

export const selectShow = createSelector(
  selectPlayerState,
  (state) => state.show
);

export const selectQueue = createSelector(
  selectPlayerState,
  (state) => state.queue
);

export const selectCurrentIndex = createSelector(
  selectPlayerState,
  (state) => state.currentIndex
);

export const selectCurrentSong = createSelector(
  selectQueue,
  selectCurrentIndex,
  (playlist, index) => playlist[index]
);

export const selectHasNextSong = createSelector(
  selectQueue,
  selectCurrentIndex,
  (playlist, index) => playlist[index + 1] !== undefined
);

export const selectHasPrevSong = createSelector(
  selectQueue,
  selectCurrentIndex,
  (playlist, index) => playlist[index - 1] !== undefined
);

export const selectPlaying = createSelector(
  selectPlayerState,
  (state) => state.playing
);

export const selectLoading = createSelector(
  selectPlayerState,
  (state) => state.loading
);

export const selectDuration = createSelector(
  selectPlayerState,
  (state) => state.duration || 0
);

export const selectMuted = createSelector(
  selectPlayerState,
  (state) => state.muted
);

export const selectVolume = createSelector(
  selectPlayerState,
  (state) => state.volume
);

export const selectRepeat = createSelector(
  selectPlayerState,
  (state) => state.repeat
);
