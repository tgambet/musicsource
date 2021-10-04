import { createAction, props } from '@ngrx/store';
import { Artist } from '@app/database/artists/artist.model';
import { Update } from '@creasource/ngrx-idb';

export const loadArtists = createAction('[Artist] Load Artists');

export const loadArtistsSuccess = createAction(
  '[Artist] Load Artists Success',
  props<{ data: Artist[] }>()
);

export const loadArtistsFailure = createAction(
  '[Artist] Load Artists Failure',
  props<{ error: any }>()
);

export const updateArtist = createAction(
  '[Artist] Update Artist',
  props<{ update: Update<Artist> }>()
);
