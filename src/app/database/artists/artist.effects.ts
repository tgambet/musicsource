import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  loadArtists,
  loadArtistsFailure,
  loadArtistsSuccess,
} from './artist.actions';
import { DatabaseService } from '@app/database/database.service';
import { Artist } from '@app/database/artists/artist.model';

// noinspection JSUnusedGlobalSymbols
@Injectable()
export class ArtistEffects {
  loadArtists$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadArtists),
      concatMap(() =>
        /** An EMPTY observable only emits completion. Replace with your own observable API request */
        this.database.getAll$<Artist>('artists').pipe(
          //map(({ value }) => value),
          // bufferTime(100),
          // filter((arr) => arr.length > 0),
          //toArray(),
          map((data) => loadArtistsSuccess({ data })),
          catchError((error) => of(loadArtistsFailure({ error })))
        )
      )
    )
  );

  // upsertArtist$ = createEffect(
  //   () =>
  //     this.actions$.pipe(
  //       ofType(upsertArtist),
  //       concatMap(({ artist }) =>
  //         this.database.put$<Artist>('artists', artist)
  //       ),
  //       catchError(() => EMPTY) // TODO
  //     ),
  //   { dispatch: false }
  // );
  //
  // updateArtist$ = createEffect(
  //   () =>
  //     this.actions$.pipe(
  //       ofType(updateArtist),
  //       concatMap(({ update: { changes, key } }) =>
  //         this.database.update$<Artist>('artists', changes, key)
  //       ),
  //       catchError(() => EMPTY) // TODO
  //     ),
  //   { dispatch: false }
  // );

  constructor(private actions$: Actions, private database: DatabaseService) {}
}
