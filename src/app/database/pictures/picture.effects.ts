import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map, mergeMap } from 'rxjs/operators';
import { EMPTY, of } from 'rxjs';
import {
  addPicture,
  loadPictures,
  loadPicturesFailure,
  loadPicturesSuccess,
  updatePicture,
  upsertPicture,
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
          map((data) => loadPicturesSuccess({ data })),
          catchError((error) => of(loadPicturesFailure({ error })))
        )
      )
    )
  );

  addPicture$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(addPicture),
        mergeMap(({ picture }) =>
          this.database.add$<Picture>('pictures', picture).pipe(
            catchError(() => EMPTY) // TODO
          )
        )
      ),
    { dispatch: false }
  );

  updatePicture$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(updatePicture),
        mergeMap(({ update: { changes, key } }) =>
          this.database.update$<Picture>('pictures', changes, key).pipe(
            catchError(() => EMPTY) // TODO
          )
        )
      ),
    { dispatch: false }
  );

  upsertPicture$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(upsertPicture),
        concatMap(
          ({ picture }) =>
            this.database
              .put$<Picture>('pictures', picture)
              .pipe(catchError(() => EMPTY)) // TODO
        )
      ),
    { dispatch: false }
  );

  constructor(private actions$: Actions, private database: DatabaseService) {}
}
