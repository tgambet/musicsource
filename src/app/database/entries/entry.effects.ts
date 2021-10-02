import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map } from 'rxjs/operators';
import { EMPTY, of } from 'rxjs';

import * as EntryActions from './entry.actions';

@Injectable()
export class EntryEffects {
  loadEntries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EntryActions.loadEntries),
      concatMap(() =>
        /** An EMPTY observable only emits completion. Replace with your own observable API request */
        EMPTY.pipe(
          map((data) => EntryActions.loadEntriesSuccess({ data })),
          catchError((error) => of(EntryActions.loadEntriesFailure({ error })))
        )
      )
    )
  );

  constructor(private actions$: Actions) {}
}
