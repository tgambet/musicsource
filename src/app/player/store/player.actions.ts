import { createAction, props } from '@ngrx/store';
import { Song } from '@app/database/songs/song.model';

export const show = createAction('player/show');
export const hide = createAction('player/hide');

export const setPlaylist = createAction(
  'player/set-playlist',
  props<{ playlist: Song[]; currentIndex: number }>()
);

export const addToPlaylist = createAction(
  'player/add-to-playlist',
  props<{ playlist: Song[]; next: boolean }>()
);

export const setCurrentIndex = createAction(
  'player/set-current-index',
  props<{ index: number }>()
);

export const setNextIndex = createAction('player/set-next-index');
export const setPrevIndex = createAction('player/set-prev-index');

export const resume = createAction('player/resume');
export const pause = createAction('player/pause');

export const setPlaying = createAction(
  'player/set-playing',
  props<{ playing: boolean }>()
);

export const setLoading = createAction(
  'player/set-loading',
  props<{ loading: boolean }>()
);

export const setDuration = createAction(
  'player/set-duration',
  props<{ duration: number }>()
);

export const shuffle = createAction('player/shuffle');

export const toggleMute = createAction('player/toggleMute');

export const setVolume = createAction(
  'player/volume',
  props<{ volume: number }>()
);
