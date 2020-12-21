import { Injectable } from '@angular/core';
import { DirectoryEntry, Entry } from '@app/utils/entry.util';
import { Observable, of } from 'rxjs';
import { concatMap, distinct, map, reduce, tap } from 'rxjs/operators';
import { StorageService } from '@app/services/storage.service';
import { Picture, Song } from '@app/services/extractor.service';

@Injectable()
export class LibraryFacade {
  rootFolders$ = this.storage.getAll$<DirectoryEntry>('entries_root');
  albums$ = this.storage.open$(['songs', 'pictures']).pipe(
    concatMap((transaction) =>
      this.storage.walk$<Song>(transaction, 'songs', 'albums').pipe(
        distinct(({ value }) => `${value.albumartist}${value.album}`),
        tap((a) => console.log(a)),
        concatMap(({ key }) =>
          // Get the first song
          this.storage
            .get<Song>(
              key,
              'songs',
              'albums'
            )(of(transaction))
            .pipe(
              concatMap((song) => {
                const picture$ = song?.pictureKey
                  ? this.storage.get<Picture>(
                      song?.pictureKey,
                      'pictures'
                    )(of(transaction))
                  : of(undefined);
                return picture$.pipe(
                  map((picture: Picture | undefined) => ({
                    name: key.toString(),
                    year: song?.year,
                    artist: song?.albumartist || song?.artist,
                    cover: picture,
                  }))
                );
              })
            )
        )
      )
    ),
    reduce((acc, album) => [...acc, album], [] as any[])

    // this.storage.walkKeys('songs', 'albums'),
    // reduce((keys, key) => keys.add(key), new Set<IDBValidKey>()),
    // map((set) => Array.from(set))
  );

  artists$ = this.storage.open$(['songs']).pipe(
    concatMap((transaction) =>
      this.storage.walkKeys$(transaction, 'songs', 'artists').pipe(
        distinct(),
        concatMap((key) =>
          this.storage.get<Song>(key, 'songs', 'artists')(of(transaction))
        )
      )
    )

    // this.storage.walkKeys('songs', 'artists'),
    // distinct(),
    // concatMap(songKey => this.storage.get())
    // reduce((keys, key) => keys.add(key), new Set<IDBValidKey>()),
    // map((set) => Array.from(set)),
    // concatMap((artists) => artists.map((artist) => of(artist)))
  );

  constructor(private storage: StorageService) {}

  getEntry = (path: string): Observable<Entry | undefined> =>
    this.storage.get$('entries', path);

  getRootEntry = (path: string): Observable<Entry | undefined> =>
    this.storage.get$('entries_root', path);

  getChildrenEntries = (directory: DirectoryEntry): Observable<Entry[]> =>
    this.storage.open$(['entries']).pipe(
      this.storage.exec<Entry[]>((t) =>
        t.objectStore('entries').index('parents').getAll(directory.path)
      )
    );
}
