import { createAction, props } from '@ngrx/store';
import { Artist } from '@app/database/artists/artist.model';
import { IdUpdate } from '@app/core/utils';

export const removeAllArtists = createAction('artists/remove-all');

export const loadArtists = createAction('[Artist] Load Artists');

export const loadArtistsSuccess = createAction(
  '[Artist] Load Artists Success',
  props<{ data: Artist[] }>(),
);

export const loadArtistsFailure = createAction(
  '[Artist] Load Artists Failure',
  props<{ error: any }>(),
);

export const addArtist = createAction(
  '[Artist] Add Artist',
  props<{ artist: Artist }>(),
);

export const updateArtist = createAction(
  '[Artist] Update Artist',
  props<{ update: IdUpdate<Artist> }>(),
);

export const upsertArtist = createAction(
  '[Artist] Upsert Artist',
  props<{ artist: Artist }>(),
);
