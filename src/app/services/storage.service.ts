import { Injectable } from '@angular/core';
import { merge, Observable, of, OperatorFunction } from 'rxjs';
import { concatMap, publish, tap } from 'rxjs/operators';

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
      db.createObjectStore('libraries');
      db.createObjectStore('songs');
      db.createObjectStore('albums');
      db.createObjectStore('artists');
      db.createObjectStore('covers');
    }).pipe(tap((db) => (this.db = db)));
  }

  openTransaction(
    stores: string[],
    mode: IDBTransactionMode = 'readonly'
  ): OperatorFunction<IDBDatabase, IDBTransaction> {
    const r = (db: IDBDatabase) =>
      new Observable<IDBTransaction>((subscriber) => {
        const transaction = db.transaction(stores, mode);
        transaction.onerror = (ev) => subscriber.error(ev);
        transaction.oncomplete = (_) => subscriber.complete();
        subscriber.next(transaction);
      });
    return concatMap(r);
  }

  execute<T>(
    stores: string[],
    mode: IDBTransactionMode,
    ...transactions: OperatorFunction<IDBTransaction, T>[]
  ): Observable<T> {
    return this.getDb().pipe(
      this.openTransaction(stores, mode),
      publish((m$) => merge(...transactions.map((t) => m$.pipe(t))))
    );
  }

  get<T>(store: string, key: IDBValidKey): OperatorFunction<IDBTransaction, T> {
    return concatMap(
      this.wrap((transaction) => transaction.objectStore(store).get(key))
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
        this.get<T>(store, key),
        concatMap((obj: T) => this.put(store, { ...obj, ...value }, key))
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

  getAll<T>(store: string): OperatorFunction<IDBTransaction, T[]> {
    return concatMap(
      this.wrap((transaction) => transaction.objectStore(store).getAll())
    );
  }

  wrap<T>(
    action: (_: IDBTransaction) => IDBRequest<T>
  ): (_: IDBTransaction) => Observable<T> {
    return (transaction: IDBTransaction) =>
      new Observable((observer) => {
        const request = action(transaction);
        request.onsuccess = (_) => {
          observer.next(request.result);
          observer.complete();
        };
        request.onerror = (ev) => observer.error(ev);
      });
  }

  addOne(
    store: string,
    value: any,
    key?: IDBValidKey
  ): Observable<IDBValidKey> {
    return this.getDb().pipe(
      this.openTransaction([store], 'readwrite'),
      this.add(store, value, key)
    );
  }

  putOne(
    store: string,
    value: any,
    key?: IDBValidKey
  ): Observable<IDBValidKey> {
    return this.getDb().pipe(
      this.openTransaction([store], 'readwrite'),
      this.put(store, value, key)
    );
  }

  private openDB(
    onUpgradeNeeded: (_: IDBDatabase) => void
  ): Observable<IDBDatabase> {
    return new Observable<IDBDatabase>((subscriber) => {
      console.log('opening db');
      const request = indexedDB.open(this.dbName, this.dbVersion);
      request.onupgradeneeded = (_) => onUpgradeNeeded(request.result);
      request.onsuccess = (_) => {
        subscriber.next(request.result);
        subscriber.complete();
      };
      request.onerror = (ev) => subscriber.error(ev);
    });
  }
}
