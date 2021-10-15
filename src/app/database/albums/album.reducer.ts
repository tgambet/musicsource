import { createReducer, on } from '@ngrx/store';
import { Album } from '@app/database/albums/album.model';
import { createIDBEntityAdapter, IDBEntityState } from '@creasource/ngrx-idb';
import {
  loadAlbums,
  loadAlbumsFailure,
  loadAlbumsSuccess,
  removeAllAlbums,
  updateAlbum,
  upsertAlbum,
} from '@app/database/albums/album.actions';

export const albumFeatureKey = 'albums';

const indexes = [
  { name: 'title' },
  { name: 'year' },
  { name: 'artistId' },
  // { name: 'artists', multiEntry: true },
  { name: 'likedOn' },
  { name: 'updatedOn' },
] as const;

const indexNames = indexes.map((i) => i.name);

export type AlbumIndex = typeof indexNames[number];

export const albumAdapter = createIDBEntityAdapter({
  keySelector: (album: Album) => album.id,
  indexes,
});

export type AlbumState = IDBEntityState<Album, AlbumIndex>;

export const initialState = albumAdapter.getInitialState();

export const albumReducer = createReducer(
  initialState,

  on(removeAllAlbums, (state) => albumAdapter.removeAll(state)),
  on(loadAlbums, (state) => state),
  on(loadAlbumsSuccess, (state, action) =>
    albumAdapter.addMany(action.data, state)
  ),
  on(loadAlbumsFailure, (state) => state),
  on(updateAlbum, (state, action) =>
    albumAdapter.updateOne(action.update, state)
  ),
  on(upsertAlbum, (state, action) =>
    albumAdapter.upsertOne(action.album, state)
  )
);
