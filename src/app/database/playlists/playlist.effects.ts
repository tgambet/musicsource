import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map } from 'rxjs/operators';
import { EMPTY, of } from 'rxjs';

import * as PlaylistActions from './playlist.actions';

@Injectable()
export class PlaylistEffects {
  loadPlaylists$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlaylistActions.loadPlaylists),
      concatMap(() =>
        /** An EMPTY observable only emits completion. Replace with your own observable API request */
        EMPTY.pipe(
          map((data) => PlaylistActions.loadPlaylistsSuccess({ data })),
          catchError((error) =>
            of(PlaylistActions.loadPlaylistsFailure({ error }))
          )
        )
      )
    )
  );

  constructor(private actions$: Actions) {}
}
