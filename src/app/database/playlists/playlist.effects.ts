import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map } from 'rxjs/operators';
import { EMPTY, of } from 'rxjs';
import {
  addPlaylist,
  loadPlaylists,
  loadPlaylistsFailure,
  loadPlaylistsSuccess,
  updatePlaylist,
} from './playlist.actions';
import { Playlist } from '@app/database/playlists/playlist.model';
import { DatabaseService } from '@app/database/database.service';

// noinspection JSUnusedGlobalSymbols
@Injectable()
export class PlaylistEffects {
  loadPlaylists$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadPlaylists),
      concatMap(() =>
        this.database.getAll$<Playlist>('playlists').pipe(
          map((data) => loadPlaylistsSuccess({ data })),
          catchError((error) => of(loadPlaylistsFailure({ error })))
        )
      )
    )
  );

  addPlaylist$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(addPlaylist),
        concatMap(({ playlist }) =>
          this.database
            .add$<Playlist>('playlists', playlist)
            .pipe(catchError(() => EMPTY))
        )
      ),
    { dispatch: false }
  );

  updatePlaylist$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(updatePlaylist),
        concatMap(({ update }) =>
          this.database
            .update$<Playlist>('playlists', update.changes, update.key)
            .pipe(catchError(() => EMPTY))
        )
      ),
    { dispatch: false }
  );

  constructor(private actions$: Actions, private database: DatabaseService) {}
}
