import { Inject, Injectable } from '@angular/core';
import { EMPTY, Observable, throwError } from 'rxjs';
import {
  concatMap,
  filter,
  map,
  mergeAll,
  takeWhile,
  tap,
} from 'rxjs/operators';
import {
  ReactiveIDBDatabase,
  ReactiveIDBTransaction,
} from '@creasource/reactive-idb';
import { Database, IndexedDBService } from '@creasource/ngx-idb';
import { IdUpdate } from '@app/core/utils';
import { merge } from 'rxjs';

@Injectable()
export class DatabaseService {
  get db$(): Observable<ReactiveIDBDatabase> {
    return this.databaseService.database;
  }

  constructor(
    @Inject(Database('musicsource')) private databaseService: IndexedDBService
  ) {
    databaseService.database.subscribe();
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
                : throwError(() => 'Could not find key: ' + key)
            )
          )
      )
    );
  }

  updateMany$<T extends { id: T['id'] }>(
    store: string,
    updates: IdUpdate<T>[]
  ): Observable<IDBValidKey> {
    return this.db$.pipe(
      concatMap((db) => db.transaction$(store, 'readwrite')),
      map((transaction) => transaction.objectStore<T>(store)),
      concatMap((objStore) =>
        objStore
          .getAll$(updates.map((update) => update.key) as Array<IDBValidKey>)
          .pipe(
            concatMap((objs) =>
              merge(
                ...objs.map((obj) => {
                  const update = updates.find((u) => u.key === obj.id);
                  return update
                    ? objStore.put$({ ...obj, ...update.changes })
                    : EMPTY;
                })
              )
            )
          )
      )
    );
  }

  // getAll<T>(
  //   store: string,
  //   query?: IDBValidKey | IDBKeyRange | null,
  //   count?: number,
  //   index?: string
  // ): Observable<T[]> {
  //   return this.db$.pipe(
  //     concatMap((db) => db.transaction$(store)),
  //     map((transaction) =>
  //       index
  //         ? transaction.objectStore<T>(store).index(index)
  //         : transaction.objectStore<T>(store)
  //     ),
  //     concatMap((objStore) => objStore.getAll$(query, count))
  //   );
  // }

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

  addMany$<T>(store: string, values: T[]): Observable<IDBValidKey> {
    return this.db$.pipe(
      concatMap((db) => db.transaction$(store, 'readwrite')),
      map((transaction) => transaction.objectStore<T>(store)),
      concatMap((s) => values.map((value) => s.add$(value))),
      mergeAll()
    );
  }

  put$<T>(store: string, value: T, key?: IDBValidKey): Observable<IDBValidKey> {
    return this.db$.pipe(
      concatMap((db) => db.transaction$(store, 'readwrite')),
      map((transaction) => transaction.objectStore<T>(store)),
      concatMap((s) => s.put$(value, key))
    );
  }

  putMany$<T>(store: string, values: T[]): Observable<IDBValidKey> {
    return this.db$.pipe(
      concatMap((db) => db.transaction$(store, 'readwrite')),
      map((transaction) => transaction.objectStore<T>(store)),
      concatMap((s) => values.map((value) => s.put$(value))),
      mergeAll()
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

  getAll$<T>(
    store: string,
    index?: string,
    query?: IDBValidKey | IDBKeyRange | null,
    count?: number
  ): Observable<T[]> {
    return this.db$.pipe(
      concatMap((db) => db.transaction$(store)),
      map((transaction) =>
        index
          ? transaction.objectStore<T>(store).index(index)
          : transaction.objectStore<T>(store)
      ),
      concatMap((s) => s.getAll$(query, count))
    );
  }

  clear$(): Observable<void> {
    return this.databaseService.clear$();
  }
}
