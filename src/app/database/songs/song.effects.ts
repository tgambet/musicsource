import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map } from 'rxjs/operators';
import { of, toArray } from 'rxjs';
import { loadSongs, loadSongsFailure, loadSongsSuccess } from './song.actions';
import { DatabaseService } from '@app/database/database.service';
import { Song } from '@app/database/songs/song.model';

@Injectable()
export class SongEffects {
  loadSongs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadSongs),
      concatMap(() =>
        this.database.walk$<Song>('songs').pipe(
          map(({ value }) => value),
          // bufferTime(100),
          // filter((arr) => arr.length > 0),
          toArray(),
          map((data) => loadSongsSuccess({ data })),
          catchError((error) => of(loadSongsFailure({ error })))
        )
      )
    )
  );

  constructor(private actions$: Actions, private database: DatabaseService) {}
}
