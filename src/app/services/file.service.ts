import { Injectable } from '@angular/core';
import { defer, merge, Observable, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { tapError } from '@app/utils/tap-error.util';
import { DirectoryEntry, Entry } from '@app/utils/entry.util';

@Injectable()
export class FileService {
  /**
   * Opens and walks a user-selected directory
   */
  scan(): Observable<Entry> {
    return this.open().pipe(concatMap((directory) => this.walk(directory)));
  }

  /**
   * Opens a directory
   */
  open(): Observable<DirectoryEntry> {
    return defer(() => showDirectoryPicker()).pipe(
      tapError((err) => console.log(err)),
      map((handle) => this.entryFromHandle(handle) as DirectoryEntry)
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
    return merge(
      of(directory),
      this.getHandles(directory).pipe(
        map((handle) => this.entryFromHandle(handle, directory.path)),
        concatMap((entry: Entry) =>
          entry.kind === 'directory' ? this.walk(entry) : of(entry)
        )
      )
    );
  }

  private getHandles = (
    directory: DirectoryEntry
  ): Observable<FileSystemHandle> =>
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

  private entryFromHandle = (
    handle: FileSystemHandle,
    parent?: string
  ): Entry => ({
    kind: handle.kind,
    name: handle.name,
    parent,
    path: parent ? `${parent}/${handle.name}` : handle.name,
    handle: handle as any,
  });
}
