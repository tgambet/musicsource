import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map } from 'rxjs/operators';
import { EMPTY, of } from 'rxjs';
import {
  loadAlbums,
  loadAlbumsFailure,
  loadAlbumsSuccess,
  updateAlbum,
} from './album.actions';
import { Album } from '@app/database/albums/album.model';
import { DatabaseService } from '@app/database/database.service';

// noinspection JSUnusedGlobalSymbols
@Injectable()
export class AlbumEffects {
  loadAlbums$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAlbums),
      concatMap(() =>
        this.database.getAll$<Album>('albums').pipe(
          map((data) => loadAlbumsSuccess({ data })),
          catchError((error) => of(loadAlbumsFailure({ error })))
        )
      )
    )
  );

  // upsertAlbum$ = createEffect(
  //   () =>
  //     this.actions$.pipe(
  //       ofType(upsertAlbum),
  //       concatMap(({ album }) =>
  //         this.database.put$<Album>('albums', album).pipe(
  //           catchError(() => EMPTY) // TODO
  //         )
  //       )
  //     ),
  //   { dispatch: false }
  // );

  updateAlbum$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(updateAlbum),
        concatMap(({ update: { changes, key } }) =>
          this.database
            .update$<Album>('albums', changes, key)
            .pipe(catchError(() => EMPTY))
        )
      ),
    { dispatch: false }
  );

  constructor(private actions$: Actions, private database: DatabaseService) {}
}
