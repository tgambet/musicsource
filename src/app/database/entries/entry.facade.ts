import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { EntryIndex } from '@app/database/entries/entry.reducer';
import { Entry } from '@app/database/entries/entry.model';
import {
  selectEntryByKey,
  selectEntryIndexAll,
  selectEntryTotal,
} from '@app/database/entries/entry.selectors';

@Injectable()
export class EntryFacade {
  constructor(private store: Store) {}

  getByKey(key: string): Observable<Entry | undefined> {
    return this.store.select(selectEntryByKey(key));
  }

  getAll(index: EntryIndex): Observable<Entry[]> {
    return this.store.select(selectEntryIndexAll(index));
  }

  getTotal(): Observable<number> {
    return this.store.select(selectEntryTotal);
  }
}
