import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map } from 'rxjs/operators';
import { EMPTY, of } from 'rxjs';
import {
  addEntry,
  loadEntries,
  loadEntriesFailure,
  loadEntriesSuccess,
} from '@app/database/entries/entry.actions';
import { DatabaseService } from '@app/database/database.service';
import { Entry } from '@app/database/entries/entry.model';

// noinspection JSUnusedGlobalSymbols
@Injectable()
export class EntryEffects {
  loadEntries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadEntries),
      concatMap(() =>
        this.database.getAll$<Entry>('entries').pipe(
          map((data) => loadEntriesSuccess({ data })),
          catchError((error) => of(loadEntriesFailure({ error })))
        )
      )
    )
  );

  addEntry$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(addEntry),
        concatMap(({ entry }) => this.database.add$<Entry>('entries', entry)),
        catchError(() => EMPTY) // TODO
      ),
    { dispatch: false }
  );

  constructor(private actions$: Actions, private database: DatabaseService) {}
}
