import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  loadPictures,
  loadPicturesFailure,
  loadPicturesSuccess,
} from './picture.actions';
import { DatabaseService } from '@app/database/database.service';
import { Picture } from '@app/database/pictures/picture.model';

// noinspection JSUnusedGlobalSymbols
@Injectable()
export class PictureEffects {
  loadPictures$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadPictures),
      concatMap(() =>
        this.database.getAll$<Picture>('pictures').pipe(
          // tap((data) => data.forEach((d) => delete d.data)),
          map((data) => loadPicturesSuccess({ data })),
          catchError((error) => of(loadPicturesFailure({ error })))
        )
      )
    )
  );

  // addPicture$ = createEffect(
  //   () =>
  //     this.actions$.pipe(
  //       ofType(addPicture),
  //       mergeMap(({ picture }) =>
  //         this.database.add$<Picture>('pictures', picture).pipe(
  //           catchError(() => EMPTY) // TODO
  //         )
  //       )
  //     ),
  //   { dispatch: false }
  // );

  // updatePicture$ = createEffect(
  //   () =>
  //     this.actions$.pipe(
  //       ofType(updatePicture),
  //       mergeMap(({ update: { changes, key } }) =>
  //         this.database.update$<Picture>('pictures', changes, key).pipe(
  //           catchError(() => EMPTY) // TODO
  //         )
  //       )
  //     ),
  //   { dispatch: false }
  // );

  // upsertPicture$ = createEffect(
  //   () =>
  //     this.actions$.pipe(
  //       ofType(upsertPicture),
  //       concatMap(
  //         ({ picture }) =>
  //           this.database
  //             .put$<Picture>('pictures', picture)
  //             .pipe(catchError(() => EMPTY)) // TODO
  //       )
  //     ),
  //   { dispatch: false }
  // );

  constructor(private actions$: Actions, private database: DatabaseService) {}
}
