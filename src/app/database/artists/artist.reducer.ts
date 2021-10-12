import { createReducer, on } from '@ngrx/store';
import { Artist } from '@app/database/artists/artist.model';
import { createIDBEntityAdapter, IDBEntityState } from '@creasource/ngrx-idb';
import {
  loadArtists,
  loadArtistsFailure,
  loadArtistsSuccess,
  removeAllArtists,
  updateArtist,
  upsertArtist,
} from './artist.actions';

export const artistFeatureKey = 'artists';

export const artistIndexes = [
  { name: 'name' },
  { name: 'likedOn' },
  { name: 'listenedOn' },
  { name: 'updatedOn' },
] as const;

const indexNames = artistIndexes.map((i) => i.name);

export type ArtistIndex = typeof indexNames[number];

export const artistAdapter = createIDBEntityAdapter({
  keySelector: (artist: Artist) => artist.id,
  indexes: artistIndexes,
});

export type ArtistState = IDBEntityState<Artist, ArtistIndex>;

export const initialState = artistAdapter.getInitialState();

export const artistReducer = createReducer(
  initialState,

  on(removeAllArtists, (state) => artistAdapter.removeAll(state)),
  on(loadArtists, (state) => state),
  on(loadArtistsSuccess, (state, action) =>
    artistAdapter.addMany(action.data, state)
  ),
  on(loadArtistsFailure, (state) => state),
  on(updateArtist, (state, action) =>
    artistAdapter.updateOne(action.update, state)
  ),
  on(upsertArtist, (state, action) =>
    artistAdapter.upsertOne(action.artist, state)
  )
);
