import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { loadEntries } from '@app/store/library/library.actions';
import {
  findDirectory,
  selectChildrenEntries,
  selectDirectChildrenEntries,
  selectEntries,
  selectRootFolders,
} from '@app/store/library/library.selectors';
import { DirectoryEntry, Entry } from '@app/utils/entry.util';
import { Observable } from 'rxjs';
import { concatMap } from 'rxjs/operators';

@Injectable()
export class LibraryFacade {
  entries$ = this.store.select(selectEntries);
  rootFolders$ = this.store.select(selectRootFolders);

  constructor(private store: Store) {}

  loadEntries(): void {
    this.store.dispatch(loadEntries());
  }

  getChildrenEntries = (directory: DirectoryEntry): Observable<Entry[]> =>
    this.store.select(selectChildrenEntries, directory);

  getDirectChildrenEntries = (directory: DirectoryEntry): Observable<Entry[]> =>
    this.store.select(selectDirectChildrenEntries, directory);

  findDirectory = (
    directory: DirectoryEntry
  ): Observable<DirectoryEntry | undefined> =>
    this.store.select(findDirectory, directory).pipe(concatMap((p) => p));
}
