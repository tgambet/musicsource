import { Injectable } from '@angular/core';
import { Observable, of, OperatorFunction, throwError } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private dbName = 'musicsource';
  private dbVersion = 1;
  private db?: IDBDatabase;

  getDb(): Observable<IDBDatabase> {
    if (this.db) {
      return of(this.db);
    }
    return this.openDB((db) => {
      // Entries
      const entries = db.createObjectStore('entries', { keyPath: 'path' });
      entries.createIndex('parents', 'parent');
      // Songs
      const songs = db.createObjectStore('songs', { keyPath: 'entryPath' });
      songs.createIndex('artists', 'artists', { multiEntry: true });
      songs.createIndex('genres', 'genre', { multiEntry: true });
      songs.createIndex('albums', 'album');
      // Pictures
      db.createObjectStore('pictures', { keyPath: 'hash' });
      // Albums
      const albums = db.createObjectStore('albums', { keyPath: 'id' });
      albums.createIndex('artists', 'artist');
      albums.createIndex('name', 'name');
      albums.createIndex('year', 'year');
      albums.createIndex('addedOn', 'addedOn');
      // Artists
      const artists = db.createObjectStore('artists', { keyPath: 'id' });
      artists.createIndex('name', 'name');
    }).pipe(tap((db) => (this.db = db)));
  }

  open(
    stores: string[],
    mode: IDBTransactionMode = 'readonly'
  ): OperatorFunction<IDBDatabase, IDBTransaction> {
    const r = (db: IDBDatabase) =>
      new Observable<IDBTransaction>((subscriber) => {
        const transaction = db.transaction(stores, mode);
        transaction.onerror = (ev) =>
          subscriber.error((ev.target as IDBTransaction).error);
        transaction.oncomplete = (_) => subscriber.complete();
        subscriber.next(transaction);
      });
    return concatMap(r);
  }

  open$(
    stores: string[],
    mode: IDBTransactionMode = 'readonly'
  ): Observable<IDBTransaction> {
    return this.getDb().pipe(this.open(stores, mode));
  }

  // execute$<T>(
  //   stores: string[],
  //   mode: IDBTransactionMode,
  //   ...transactions: OperatorFunction<IDBTransaction, T>[]
  // ): Observable<T> {
  //   return this.getDb().pipe(
  //     this.open(stores, mode),
  //     publish((m$) => merge(...transactions.map((t) => m$.pipe(t))))
  //   );
  // }

  get<T>(
    key: IDBValidKey,
    store: string,
    index?: string
  ): OperatorFunction<IDBTransaction, T | undefined> {
    return concatMap(
      this.wrap((transaction) =>
        index
          ? transaction.objectStore(store).index(index).get(key)
          : transaction.objectStore(store).get(key)
      )
    );
  }

  add(
    store: string,
    value: any,
    key?: IDBValidKey
  ): OperatorFunction<IDBTransaction, IDBValidKey> {
    return concatMap(
      this.wrap((transaction) => transaction.objectStore(store).add(value, key))
    );
  }

  put(
    store: string,
    value: any,
    key?: IDBValidKey
  ): OperatorFunction<IDBTransaction, IDBValidKey> {
    return concatMap(
      this.wrap((transaction) => transaction.objectStore(store).put(value, key))
    );
  }

  update<T>(
    store: string,
    value: Partial<T>,
    key: IDBValidKey
  ): OperatorFunction<IDBTransaction, IDBValidKey> {
    return (obs) =>
      obs.pipe(
        concatMap((t) =>
          this.get<T>(
            key,
            store
          )(of(t)).pipe(
            concatMap((obj) =>
              obj
                ? this.put(store, { ...obj, ...value })(of(t))
                : throwError('Could not find key: ' + key)
            )
          )
        )
      );
  }

  delete(
    store: string,
    key: IDBValidKey | IDBKeyRange
  ): OperatorFunction<IDBTransaction, undefined> {
    return concatMap(
      this.wrap((transaction) => transaction.objectStore(store).delete(key))
    );
  }

  getAll<T>(
    store: string,
    index?: string,
    query?: IDBValidKey | IDBKeyRange | null
  ): OperatorFunction<IDBTransaction, T[]> {
    return concatMap(
      this.wrap((transaction) =>
        index
          ? transaction.objectStore(store).index(index).getAll(query)
          : transaction.objectStore(store).getAll(query)
      )
    );
  }

  getAll$<T>(
    store: string,
    index?: string,
    query?: IDBValidKey | IDBKeyRange | null
  ): Observable<T[]> {
    return this.open$([store]).pipe(this.getAll(store, index, query));
  }

  exec$<T>(request: IDBRequest<T>): Observable<T> {
    return new Observable((observer) => {
      request.onsuccess = (_) => {
        observer.next(request.result);
        observer.complete();
      };
      request.onerror = (ev) => observer.error((ev.target as IDBRequest).error);
    });
  }

  exec<T>(
    action: (_: IDBTransaction) => IDBRequest<T>
  ): OperatorFunction<IDBTransaction, T> {
    return concatMap((t: IDBTransaction) => this.exec$(action(t)));
  }

  // walk<T>(store: string): OperatorFunction<IDBTransaction, T> {
  //   return concatMap((t) => this.walk$<T>(t, store));
  // }

  walk$<T>(
    transaction: IDBTransaction,
    store: string,
    index?: string,
    query?: IDBValidKey | IDBKeyRange | null,
    direction: IDBCursorDirection = 'next'
  ): Observable<{ value: T; key: IDBValidKey; primaryKey: IDBValidKey }> {
    return new Observable((observer) => {
      const request = index
        ? transaction
            .objectStore(store)
            .index(index)
            .openCursor(query, direction)
        : transaction.objectStore(store).openCursor(query, direction);
      request.onsuccess = (event: any) => {
        const cursor: IDBCursorWithValue = event.target.result;
        if (cursor && !observer.closed) {
          observer.next({
            value: cursor.value,
            key: cursor.key,
            primaryKey: cursor.primaryKey,
          });
          cursor.continue();
        } else {
          observer.complete();
        }
      };
      request.onerror = (ev) => observer.error((ev.target as IDBRequest).error);
    });
  }

  walkKeys(
    store: string,
    index?: string
  ): OperatorFunction<IDBTransaction, IDBValidKey> {
    return concatMap((t) => this.walkKeys$(t, store, index));
  }

  walkKeys$(
    transaction: IDBTransaction,
    store: string,
    index?: string
  ): Observable<IDBValidKey> {
    return new Observable((observer) => {
      const request = index
        ? transaction.objectStore(store).index(index).openKeyCursor()
        : transaction.objectStore(store).openKeyCursor();
      request.onsuccess = (event: any) => {
        const cursor: IDBCursor = event.target.result;
        if (cursor && !observer.closed) {
          observer.next(cursor.key);
          cursor.continue();
        } else {
          observer.complete();
        }
      };
      request.onerror = (ev) => observer.error((ev.target as IDBRequest).error);
    });
  }

  find$<T>(
    transaction: IDBTransaction,
    store: string,
    predicate: (_: T) => boolean
  ): Observable<(T & { key: IDBValidKey }) | undefined> {
    return new Observable((observer) => {
      const request = transaction.objectStore(store).openCursor();
      request.onsuccess = (event: any) => {
        const cursor: IDBCursorWithValue = event.target.result;
        if (cursor && cursor.value && !observer.closed) {
          if (predicate(cursor.value)) {
            observer.next({
              ...(cursor.value as T),
              key: cursor.key,
            });
            observer.complete();
          }
          cursor.continue();
        } else {
          observer.next(undefined);
          observer.complete();
        }
      };
      request.onerror = (ev) => observer.error((ev.target as IDBRequest).error);
    });
  }

  add$(store: string, value: any, key?: IDBValidKey): Observable<IDBValidKey> {
    return this.getDb().pipe(
      this.open([store], 'readwrite'),
      this.add(store, value, key)
    );
  }

  put$(store: string, value: any, key?: IDBValidKey): Observable<IDBValidKey> {
    return this.getDb().pipe(
      this.open([store], 'readwrite'),
      this.put(store, value, key)
    );
  }

  get$<T>(store: string, key: IDBValidKey): Observable<T | undefined> {
    return this.getDb().pipe(
      this.open([store], 'readonly'),
      this.get<T>(key, store)
    );
  }

  private wrap<T>(
    action: (_: IDBTransaction) => IDBRequest<T>
  ): (_: IDBTransaction) => Observable<T> {
    return (transaction: IDBTransaction) =>
      new Observable((observer) => {
        const request = action(transaction);
        request.onsuccess = (_) => {
          observer.next(request.result);
          observer.complete();
        };
        request.onerror = (ev) =>
          observer.error((ev.target as IDBRequest).error);
      });
  }

  private openDB(
    onUpgradeNeeded: (_: IDBDatabase) => void
  ): Observable<IDBDatabase> {
    return new Observable<IDBDatabase>((subscriber) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      request.onupgradeneeded = (_) => onUpgradeNeeded(request.result);
      request.onsuccess = (_) => {
        subscriber.next(request.result);
        subscriber.complete();
      };
      request.onerror = (ev) =>
        subscriber.error((ev.target as IDBOpenDBRequest).error);
    });
  }
}
