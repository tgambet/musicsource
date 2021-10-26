/// <reference lib="webworker" />

import { merge, Observable, of, Subscription } from 'rxjs';
import {
  DirectoryEntry,
  Entry,
  entryFromHandle,
} from '@app/database/entries/entry.model';
import { concatMap, map } from 'rxjs/operators';

const getHandles = (directory: DirectoryEntry): Observable<FileSystemHandle> =>
  new Observable(
    (observer) =>
      void (async () => {
        try {
          for await (const entry of directory.handle.values()) {
            if (observer.closed) {
              return;
            }
            observer.next(entry);
          }
          observer.complete();
        } catch (e) {
          observer.error(e);
        }
      })()
  );

/**
 * Walks a Directory recursively, emitting file entries
 *
 * @param directory The directory to walk
 */
const walk = (directory: DirectoryEntry): Observable<Entry> =>
  merge(
    of(directory),
    getHandles(directory).pipe(
      map((handle) => entryFromHandle(handle, directory.path)),
      concatMap((entry: Entry) =>
        entry.kind === 'directory' ? walk(entry) : of(entry)
      )
    )
  );

const subscription = new Subscription();

addEventListener('message', async ({ data }) => {
  if (data === 'cancel') {
    subscription.unsubscribe();
  } else {
    walk(data).subscribe({
      next: (value) => postMessage(value),
      complete: () => postMessage('complete'),
    });
  }
});
