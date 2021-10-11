import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map } from 'rxjs/operators';
import { EMPTY, of, toArray } from 'rxjs';
import {
  addSong,
  loadSongs,
  loadSongsFailure,
  loadSongsSuccess,
  updateSong,
} from './song.actions';
import { DatabaseService } from '@app/database/database.service';
import { Song } from '@app/database/songs/song.model';

// noinspection JSUnusedGlobalSymbols
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

  addSong$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(addSong),
        concatMap(({ song }) => this.database.add$<Song>('songs', song)),
        catchError(() => EMPTY) // TODO
      ),
    { dispatch: false }
  );

  updateSong$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(updateSong),
        concatMap(({ update: { changes, key } }) =>
          this.database.update$<Song>('songs', changes, key)
        ),
        catchError(() => EMPTY) // TODO
      ),
    { dispatch: false }
  );

  constructor(private actions$: Actions, private database: DatabaseService) {}
}
