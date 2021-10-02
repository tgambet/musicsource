import { createReducer, on } from '@ngrx/store';
import * as ArtistActions from './artist.actions';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Artist } from '@app/database/artists/artist.model';

export const artistFeatureKey = 'artists';

export const artistAdapter: EntityAdapter<Artist> = createEntityAdapter<Artist>(
  {
    selectId: (model) => model.hash,
  }
);

export type ArtistState = EntityState<Artist>;

export const initialState: ArtistState = artistAdapter.getInitialState();

export const artistReducer = createReducer(
  initialState,

  on(ArtistActions.loadArtists, (state) => state),
  on(ArtistActions.loadArtistsSuccess, (state, action) => state),
  on(ArtistActions.loadArtistsFailure, (state, action) => state)
);
