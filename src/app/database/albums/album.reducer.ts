import { createReducer, on } from '@ngrx/store';
import { Album } from '@app/database/albums/album.model';
import { createIDBEntityAdapter, IDBEntityState } from '@creasource/ngrx-idb';
import {
  loadAlbums,
  loadAlbumsFailure,
  loadAlbumsSuccess,
  updateAlbum,
} from '@app/database/albums/album.actions';

export const albumFeatureKey = 'albums';

const indexes = [
  { name: 'name' },
  { name: 'year' },
  { name: 'albumArtist' },
  { name: 'artists', multiEntry: true },
  { name: 'likedOn' },
  { name: 'listenedOn' },
  { name: 'lastModified' },
] as const;

const indexNames = indexes.map((i) => i.name);

export type AlbumIndex = typeof indexNames[number];

export const albumAdapter = createIDBEntityAdapter<Album, AlbumIndex>({
  keySelector: (album: Album) => album.hash,
  indexes,
});

export type AlbumState = IDBEntityState<Album, AlbumIndex>;

export const initialState = albumAdapter.getInitialState();

export const albumReducer = createReducer(
  initialState,

  on(loadAlbums, (state) => state),
  on(loadAlbumsSuccess, (state, action) =>
    albumAdapter.addMany(action.data, state)
  ),
  on(loadAlbumsFailure, (state, action) => state),
  on(updateAlbum, (state, action) =>
    albumAdapter.updateOne(action.update, state)
  )
);
