import { createReducer, on } from '@ngrx/store';
import * as SongActions from './song.actions';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Song } from '@app/database/songs/song.model';

export const songFeatureKey = 'song';

export type SongState = EntityState<Song>;

export const songAdapter: EntityAdapter<Song> = createEntityAdapter<Song>({
  selectId: (model) => model.entryPath,
});

export const initialState: SongState = songAdapter.getInitialState();

export const songReducer = createReducer(
  initialState,

  on(SongActions.loadSongs, (state) => state),
  on(SongActions.loadSongsSuccess, (state, action) => state),
  on(SongActions.loadSongsFailure, (state, action) => state)
);
