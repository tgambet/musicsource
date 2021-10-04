import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map } from 'rxjs/operators';
import { of, toArray } from 'rxjs';
import {
  loadAlbums,
  loadAlbumsFailure,
  loadAlbumsSuccess,
} from './album.actions';
import { Album } from '@app/database/albums/album.model';
import { DatabaseService } from '@app/database/database.service';

@Injectable()
export class AlbumEffects {
  loadAlbums$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAlbums),
      concatMap(() =>
        this.database.walk$<Album>('albums').pipe(
          map(({ value }) => value),
          // bufferTime(100),
          // filter((arr) => arr.length > 0),
          toArray(),
          map((data) => loadAlbumsSuccess({ data })),
          catchError((error) => of(loadAlbumsFailure({ error })))
        )
      )
    )
  );

  constructor(private actions$: Actions, private database: DatabaseService) {}
}
