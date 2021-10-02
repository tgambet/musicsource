import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map } from 'rxjs/operators';
import { EMPTY, of } from 'rxjs';

import * as ArtistActions from './artist.actions';

@Injectable()
export class ArtistEffects {
  loadArtists$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ArtistActions.loadArtists),
      concatMap(() =>
        /** An EMPTY observable only emits completion. Replace with your own observable API request */
        EMPTY.pipe(
          map((data) => ArtistActions.loadArtistsSuccess({ data })),
          catchError((error) => of(ArtistActions.loadArtistsFailure({ error })))
        )
      )
    )
  );

  constructor(private actions$: Actions) {}
}
