import { createReducer, on } from '@ngrx/store';
import * as AlbumActions from './album.actions';
import { Album } from '@app/database/albums/album.model';
import {
  createIDBEntityAdapter,
  IDBEntityAdapter,
  IDBEntityState,
} from '@creasource/ngrx-idb';

export const albumFeatureKey = 'albums';

export const albumAdapter: IDBEntityAdapter<Album> =
  createIDBEntityAdapter<Album>({
    autoIncrement: true,
    indexes: ['name', 'year', 'hash', 'albumArtist', 'likedOn'],
  });

export type AlbumState = IDBEntityState<Album>; /* & {
  index: { [key: string]: string };
};*/

export const initialState: AlbumState = albumAdapter.getInitialState();

export const albumReducer = createReducer(
  initialState,

  on(AlbumActions.loadAlbums, (state) => state),
  on(AlbumActions.loadAlbumSuccess, (state, action) =>
    albumAdapter.addMany(action.data, state)
  ),
  on(AlbumActions.loadAlbumsFailure, (state, action) => state),
  on(AlbumActions.updateAlbum, (state, action) =>
    albumAdapter.updateOne(action.update, state)
  )
);
