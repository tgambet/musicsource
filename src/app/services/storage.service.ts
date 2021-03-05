import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import {
  concatMap,
  filter,
  map,
  mergeAll,
  shareReplay,
  takeWhile,
  tap,
} from 'rxjs/operators';
import {
  ReactiveIDBDatabase,
  ReactiveIDBTransaction,
} from '@creasource/reactive-idb';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private db$!: Observable<ReactiveIDBDatabase>;

  constructor() {
    this.init();
  }

  init(): void {
    this.db$ = ReactiveIDBDatabase.create({
      name: 'musicsource',
      schema: [
        {
          version: 1,
          stores: [
            {
              name: 'entries',
              options: { keyPath: 'path' },
              indexes: ['parent'],
            },
            {
              name: 'songs',
              options: { keyPath: 'entryPath' },
              indexes: [
                { name: 'artists', options: { multiEntry: true } },
                { name: 'genre', options: { multiEntry: true } },
                'album',
                'title',
                'likedOn',
                'lastModified',
              ],
            },
            {
              name: 'pictures',
              options: { keyPath: 'hash' },
            },
            {
              name: 'albums',
              options: { keyPath: 'name' },
              indexes: [
                { name: 'artists', options: { multiEntry: true } },
                'hash',
                'year',
                'albumArtist',
                'likedOn',
                'listenedOn',
                'lastModified',
              ],
            },
            {
              name: 'artists',
              options: { keyPath: 'name' },
              indexes: ['hash', 'likedOn', 'listenedOn', 'lastModified'],
            },
            {
              name: 'playlists',
              options: { keyPath: 'hash' },
              indexes: ['title', 'createdOn', 'listenedOn'],
            },
          ],
        },
      ],
    }).pipe(shareReplay(1));
  }

  open$(
    stores: string[],
    mode: IDBTransactionMode = 'readonly'
  ): Observable<ReactiveIDBTransaction> {
    return this.db$.pipe(concatMap((db) => db.transaction$(stores, mode)));
  }

  update$<T>(
    store: string,
    value: Partial<T>,
    key: IDBValidKey
  ): Observable<IDBValidKey> {
    return this.db$.pipe(
      concatMap((db) => db.transaction$(store, 'readwrite')),
      map((transaction) => transaction.objectStore<T>(store)),
      concatMap((objStore) =>
        objStore
          .get$(key)
          .pipe(
            concatMap((obj) =>
              obj
                ? objStore.put$({ ...obj, ...value })
                : throwError('Could not find key: ' + key)
            )
          )
      )
    );
  }

  getAllValues$<T>(
    keys: IDBValidKey[],
    store: string,
    index?: string
  ): Observable<T> {
    return this.db$.pipe(
      concatMap((db) => db.transaction$(store)),
      map((transaction) => transaction.objectStore<T>(store)),
      concatMap((objStore) =>
        keys.map((key) =>
          index ? objStore.index(index).get$(key) : objStore.get$(key)
        )
      ),
      mergeAll(),
      filter((v): v is T => !!v)
    );
  }

  walk$<T>(
    store: string,
    index?: string,
    query?: IDBValidKey | IDBKeyRange | null,
    direction?: IDBCursorDirection,
    predicate?: (_: T) => boolean
  ): Observable<{ value: T; key: IDBValidKey; primaryKey: IDBValidKey }> {
    return this.db$.pipe(
      concatMap((db) => db.transaction$(store)),
      map((transaction: ReactiveIDBTransaction) =>
        index
          ? transaction.objectStore<T>(store).index(index)
          : transaction.objectStore<T>(store)
      ),
      concatMap((o) => o.openCursor$(query, direction || 'next')),
      takeWhile((cursor): cursor is IDBCursorWithValue => !!cursor),
      tap((cursor) => cursor.continue()),
      filter((cursor) => (predicate ? predicate(cursor.value) : true)),
      map((cursor) => ({
        value: cursor.value as T,
        key: cursor.key,
        primaryKey: cursor.primaryKey,
      }))
    );
  }

  add$<T>(store: string, value: T, key?: IDBValidKey): Observable<IDBValidKey> {
    return this.db$.pipe(
      concatMap((db) => db.transaction$(store, 'readwrite')),
      map((transaction) => transaction.objectStore<T>(store)),
      concatMap((s) => s.add$(value, key))
    );
  }

  put$<T>(store: string, value: T, key?: IDBValidKey): Observable<IDBValidKey> {
    return this.db$.pipe(
      concatMap((db) => db.transaction$(store, 'readwrite')),
      map((transaction) => transaction.objectStore<T>(store)),
      concatMap((s) => s.put$(value, key))
    );
  }

  get$<T>(
    store: string,
    key: IDBValidKey,
    index?: string
  ): Observable<T | undefined> {
    return this.db$.pipe(
      concatMap((db) => db.transaction$(store)),
      map((transaction) =>
        index
          ? transaction.objectStore<T>(store).index(index)
          : transaction.objectStore<T>(store)
      ),
      concatMap((s) => s.get$(key))
    );
  }

  clear$(): Observable<void> {
    return this.db$.pipe(
      tap((db) => db.close()),
      concatMap((db) => db.clear$()),
      tap(() => this.init())
    );
  }
}
