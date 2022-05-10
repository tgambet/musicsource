import { createReducer, on } from '@ngrx/store';
import { Song } from '@app/database/songs/song.model';
import { createIDBEntityAdapter, IDBEntityState } from '@creasource/ngrx-idb';
import {
  addSong,
  loadSongs,
  loadSongsFailure,
  loadSongsSuccess,
  removeAllSongs,
  updateSong,
  upsertSong,
} from './song.actions';

export const songFeatureKey = 'songs';

const indexes = [
  // { name: 'artists', multiEntry: true },
  // { name: 'genre', multiEntry: true },
  { name: 'title' },
  { name: 'albumId', keySelector: (song: Song) => song.album.id },
  {
    name: 'artists',
    keySelector: (song: Song) => song.artists.map((a) => a.id),
    multiEntry: true,
  },
  { name: 'likedOn' },
  // { name: 'lastModified' },
  { name: 'updatedOn' },
] as const;

const indexNames = indexes.map((i) => i.name);

export type SongIndex = typeof indexNames[number];

export const songAdapter = createIDBEntityAdapter<Song, SongIndex>({
  keySelector: (model) => model.id,
  indexes,
});

export type SongState = IDBEntityState<Song, SongIndex>;

export const initialState: SongState = songAdapter.getInitialState();

export const songReducer = createReducer(
  initialState,

  on(removeAllSongs, (state) => songAdapter.removeAll(state)),
  on(loadSongs, (state) => state),
  on(loadSongsSuccess, (state, action) =>
    songAdapter.setAll(action.data, state)
  ),
  on(loadSongsFailure, (state) => state),
  on(updateSong, (state, action) =>
    songAdapter.updateOne(action.update, state)
  ),
  on(addSong, (state, action) => songAdapter.addOne(action.song, state)),
  on(upsertSong, (state, action) => songAdapter.upsertOne(action.song, state))
);
