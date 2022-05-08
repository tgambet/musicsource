import { Injectable } from '@angular/core';
import { defer, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { tapError } from '@app/core/utils/tap-error.util';
import {
  DirectoryEntry,
  Entry,
  entryFromHandle,
} from '@app/database/entries/entry.model';

@Injectable()
export class FileService {
  openDirectory(): Observable<DirectoryEntry> {
    return defer(() => showDirectoryPicker()).pipe(
      tapError((err) => console.log(err)),
      map((handle) => entryFromHandle(handle) as DirectoryEntry)
      // If user has aborted then complete
      // catchError(e => e.code === 20 ? EMPTY : throwError(e))
    );
  }

  iterate(dir: DirectoryEntry): Observable<Entry> {
    const generator: (
      directory: FileSystemDirectoryHandle
    ) => AsyncGenerator<Entry, void, void> = async function* (
      directory: FileSystemDirectoryHandle
    ) {
      for await (const entry of directory.values()) {
        yield entryFromHandle(entry, directory.name);
        if (entry.kind === 'directory') {
          yield* generator(entry);
        }
      }
    };

    // return scheduled(generator(dir.handle), animationFrameScheduler);
    return from(generator(dir.handle));
  }
}
