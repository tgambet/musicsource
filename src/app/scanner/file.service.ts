import { Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { tapError } from '@app/core/utils/tap-error.util';
import {
  DirectoryEntry,
  Entry,
  entryFromHandle,
} from '@app/database/entries/entry.model';

@Injectable()
export class FileService {
  private readonly worker: Worker = new Worker(
    new URL('./file.worker', import.meta.url),
    { name: 'scanner' }
  );

  /**
   * Opens a directory
   */
  open(): Observable<DirectoryEntry> {
    return defer(() => showDirectoryPicker()).pipe(
      tapError((err) => console.log(err)),
      map((handle) => entryFromHandle(handle) as DirectoryEntry)
      // If user has aborted then complete
      // catchError(e => e.code === 20 ? EMPTY : throwError(e))
    );
  }

  /**
   * Walks a Directory recursively, emitting file entries
   *
   * @param directory The directory to walk
   */
  walk(directory: DirectoryEntry): Observable<Entry> {
    return new Observable((observer) => {
      this.worker.onmessage = ({ data }) => {
        if (data === 'complete') {
          observer.complete();
        }
        observer.next(data);
      };
      this.worker.postMessage(directory);
      return () => {
        this.worker.postMessage('cancel');
      };
    });
  }
}
