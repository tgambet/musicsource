import { Injectable } from '@angular/core';
import { DirectoryEntry, Entry } from '@app/utils/entry.util';
import { Observable } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { StorageService } from '@app/services/storage.service';

@Injectable()
export class LibraryFacade {
  rootFolders$ = this.storage.getAll$<DirectoryEntry>('entries_root');

  constructor(private storage: StorageService) {}

  getEntry = (path: string): Observable<Entry | undefined> =>
    this.storage.getOne('entries', path);

  getRootEntry = (path: string): Observable<Entry | undefined> =>
    this.storage.getOne('entries_root', path);

  getChildrenEntries = (directory: DirectoryEntry): Observable<Entry[]> =>
    this.storage
      .open(['entries'])
      .pipe(
        concatMap((t) =>
          this.storage.exec(
            t.objectStore('entries').index('parents').getAll(directory.path)
          )
        )
      );
}
