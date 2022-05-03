import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { EntryIndex } from '@app/database/entries/entry.reducer';
import { Entry } from '@app/database/entries/entry.model';
import {
  selectEntryAll,
  selectEntryByKey,
  selectEntryIndexAll,
  selectEntryTotal,
} from '@app/database/entries/entry.selectors';
import { addEntry } from '@app/database/entries/entry.actions';
import { DatabaseService } from '@app/database/database.service';
import { tap } from 'rxjs/operators';

@Injectable()
export class EntryFacade {
  constructor(private store: Store, private database: DatabaseService) {}

  put(entry: Entry): Observable<IDBValidKey> {
    return this.database
      .put$<Entry>('entries', entry)
      .pipe(tap(() => this.store.dispatch(addEntry({ entry }))));
  }

  getByKey(key: string): Observable<Entry | undefined> {
    return this.store.select(selectEntryByKey(key));
  }

  getAll(index?: EntryIndex): Observable<Entry[]> {
    return index
      ? this.store.select(selectEntryIndexAll(index))
      : this.store.select(selectEntryAll);
  }

  getTotal(): Observable<number> {
    return this.store.select(selectEntryTotal);
  }
}
