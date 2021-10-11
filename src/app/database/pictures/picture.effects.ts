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
          map((data) => loadPicturesSuccess({ data })),
          catchError((error) => of(loadPicturesFailure({ error })))
        )
      )
    )
  );

  constructor(private actions$: Actions, private database: DatabaseService) {}
}
