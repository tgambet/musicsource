import { createAction, props } from '@ngrx/store';
import { SongWithCover$ } from '@app/models/song.model';
import { Album } from '@app/models/album.model';

export const show = createAction('player/show');

export const setPlaylist = createAction(
  'player/set-playlist',
  props<{ playlist: SongWithCover$[]; currentIndex: number }>()
);

export const setNextSong = createAction(
  'player/set-next-song',
  props<{ song: SongWithCover$ }>()
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

export const playAlbum = createAction(
  'player/play-album',
  props<{ album: Album; index: number }>()
);
