import { createAction, props } from '@ngrx/store';
import { SongWithCover$ } from '@app/models/song.model';

export const show = createAction('player/show');
export const hide = createAction('player/hide');

export const setPlaylist = createAction(
  'player/set-playlist',
  props<{ playlist: SongWithCover$[]; currentIndex: number }>()
);

export const addToPlaylist = createAction(
  'player/add-to-playlist',
  props<{ playlist: SongWithCover$[]; next: boolean }>()
);

export const setCurrentIndex = createAction(
  'player/set-current-index',
  props<{ index: number }>()
);

export const setNextIndex = createAction('player/set-next-index');
export const setPrevIndex = createAction('player/set-prev-index');

export const play = createAction('player/play');
export const pause = createAction('player/pause');

export const setPlaying = createAction(
  'player/set-playing',
  props<{ playing: boolean }>()
);

export const setDuration = createAction(
  'player/set-duration',
  props<{ duration: number }>()
);

export const shuffle = createAction('player/shuffle');
