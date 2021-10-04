import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map } from 'rxjs/operators';
import { of, toArray } from 'rxjs';
import {
  loadEntries,
  loadEntriesFailure,
  loadEntriesSuccess,
} from '@app/database/entries/entry.actions';
import { DatabaseService } from '@app/database/database.service';
import { Entry } from '@app/database/entries/entry.model';

@Injectable()
export class EntryEffects {
  loadEntries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadEntries),
      concatMap(() =>
        this.database.walk$<Entry>('entries').pipe(
          map(({ value }) => value),
          // bufferTime(100),
          // filter((arr) => arr.length > 0),
          toArray(),
          map((data) => loadEntriesSuccess({ data })),
          catchError((error) => of(loadEntriesFailure({ error })))
        )
      )
    )
  );

  constructor(private actions$: Actions, private database: DatabaseService) {}
}
