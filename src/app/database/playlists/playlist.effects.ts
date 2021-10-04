import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map } from 'rxjs/operators';
import { of, toArray } from 'rxjs';
import {
  loadPlaylists,
  loadPlaylistsFailure,
  loadPlaylistsSuccess,
} from './playlist.actions';
import { Playlist } from '@app/database/playlists/playlist.model';
import { DatabaseService } from '@app/database/database.service';

@Injectable()
export class PlaylistEffects {
  loadPlaylists$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadPlaylists),
      concatMap(() =>
        this.database.walk$<Playlist>('playlists').pipe(
          map(({ value }) => value),
          // bufferTime(100),
          // filter((arr) => arr.length > 0),
          toArray(),
          map((data) => loadPlaylistsSuccess({ data })),
          catchError((error) => of(loadPlaylistsFailure({ error })))
        )
      )
    )
  );

  constructor(private actions$: Actions, private database: DatabaseService) {}
}
