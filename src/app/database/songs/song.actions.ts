import { createAction, props } from '@ngrx/store';
import { Song } from '@app/database/songs/song.model';
import { Update } from '@creasource/ngrx-idb';

export const removeAllSongs = createAction('songs/remove-all');

export const loadSongs = createAction('[Song] Load Songs');

export const loadSongsSuccess = createAction(
  '[Song] Load Songs Success',
  props<{ data: Song[] }>()
);

export const loadSongsFailure = createAction(
  '[Song] Load Songs Failure',
  props<{ error: any }>()
);

export const updateSong = createAction(
  '[Song] Update Song',
  props<{ update: Update<Song> }>()
);

export const addSong = createAction('[Song] Add Song', props<{ song: Song }>());
