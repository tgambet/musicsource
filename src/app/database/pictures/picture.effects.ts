import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map } from 'rxjs/operators';
import { of, toArray } from 'rxjs';

import {
  loadPictures,
  loadPicturesFailure,
  loadPicturesSuccess,
} from './picture.actions';
import { DatabaseService } from '@app/database/database.service';
import { Picture } from '@app/database/pictures/picture.model';

@Injectable()
export class PictureEffects {
  loadPictures$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadPictures),
      concatMap(() =>
        this.database.walk$<Picture>('pictures').pipe(
          map(({ value }) => value),
          // bufferTime(100),
          // filter((arr) => arr.length > 0),
          toArray(),
          map((data) => loadPicturesSuccess({ data })),
          catchError((error) => of(loadPicturesFailure({ error })))
        )
      )
    )
  );

  constructor(private actions$: Actions, private database: DatabaseService) {}
}
