import { createReducer, on } from '@ngrx/store';
import { Song } from '@app/database/songs/song.model';
import { createIDBEntityAdapter, IDBEntityState } from '@creasource/ngrx-idb';
import {
  addSong,
  loadSongs,
  loadSongsFailure,
  loadSongsSuccess,
  updateSong,
} from './song.actions';

export const songFeatureKey = 'songs';

const indexes = [
  // { name: 'artists', multiEntry: true },
  // { name: 'genre', multiEntry: true },
  { name: 'title' },
  { name: 'albumId' },
  { name: 'artistId' },
  { name: 'likedOn' },
  { name: 'lastModified' },
  { name: 'updatedOn' },
] as const;

const indexNames = indexes.map((i) => i.name);

export type SongIndex = typeof indexNames[number];

export const songAdapter = createIDBEntityAdapter<Song, SongIndex>({
  keySelector: (model) => model.entryPath,
  indexes,
});

export type SongState = IDBEntityState<Song, SongIndex>;

export const initialState: SongState = songAdapter.getInitialState();

export const songReducer = createReducer(
  initialState,

  on(loadSongs, (state) => state),
  on(loadSongsSuccess, (state, action) =>
    songAdapter.addMany(action.data, state)
  ),
  on(loadSongsFailure, (state) => state),
  on(updateSong, (state, action) =>
    songAdapter.updateOne(action.update, state)
  ),
  on(addSong, (state, action) => songAdapter.addOne(action.song, state))
);
