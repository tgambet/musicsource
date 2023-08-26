import {
  ReactiveIDBDatabase,
  ReactiveIDBDatabaseOptions,
  ReactiveIDBTransaction,
  ReactiveIDBTransformer,
} from '@creasource/reactive-idb';
import { concatMap, shareReplay, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export type Store<T> = {
  get: (key: IDBValidKey) => Observable<T | undefined>;
  add: (value: T, key?: IDBValidKey) => Observable<IDBValidKey>;
  put: (value: T, key?: IDBValidKey) => Observable<IDBValidKey>;
  delete: (key: IDBValidKey) => Observable<void>;
};

export class IndexedDBService {
  private db!: Observable<ReactiveIDBDatabase>;

  constructor(public readonly options: ReactiveIDBDatabaseOptions) {
    this.initialize();
  }

  private initialize() {
    this.db = ReactiveIDBDatabase.create(this.options).pipe(shareReplay(1));
  }

  get database(): Observable<ReactiveIDBDatabase> {
    return this.db;
  }

  transaction(store: string): Observable<any>;
  transaction(store: string, mode: IDBTransactionMode): Observable<any>;
  transaction(store1: string, store2: string): Observable<any>;
  transaction(
    store1: string,
    store2: string,
    mode: IDBTransactionMode
  ): Observable<any>;
  transaction(store1: string, store2: string, store3: string): Observable<any>;
  transaction(
    store1: string,
    store2: string,
    store3: string,
    mode: IDBTransactionMode
  ): Observable<any>;
  transaction(
    store1: string,
    store2: string,
    store3: string,
    store4: string
  ): Observable<any>;
  transaction(
    store1: string,
    store2: string,
    store3: string,
    store4: string,
    mode: IDBTransactionMode
  ): Observable<any>;

  transaction(...args: any[]): Observable<ReactiveIDBTransaction> {
    const readonly: IDBTransactionMode =
      typeof args[args.length - 1] === 'string'
        ? 'readwrite'
        : args[args.length - 1];
    const stores =
      typeof args[args.length - 1] === 'string'
        ? (args as string[])
        : args.slice(0, args.length - 1);

    return this.db.pipe(concatMap((db) => db.transaction$(stores, readonly)));
  }

  getStore<T = unknown>(
    name: string,
    mode: IDBTransactionMode = 'readwrite',
    transformer?: ReactiveIDBTransformer<T>
  ): Store<T> {
    const store$ = this.db.pipe(
      concatMap((db) => db.transaction$([name], mode)),
      concatMap((transaction) => transaction.objectStore$<T>(name, transformer))
    );

    return {
      get: (key: IDBValidKey): Observable<T | undefined> =>
        store$.pipe(concatMap((s) => s.get$(key))),

      add: (value: T, key?: IDBValidKey): Observable<IDBValidKey> =>
        store$.pipe(concatMap((s) => s.add$(value, key))),

      put: (value: T, key?: IDBValidKey): Observable<IDBValidKey> =>
        store$.pipe(concatMap((s) => s.put$(value, key))),

      delete: (key: IDBValidKey): Observable<void> =>
        store$.pipe(concatMap((s) => s.delete$(key))),
    };
  }

  clear$(): Observable<void> {
    return this.db.pipe(
      tap((db) => db.close()),
      concatMap((db) => db.clear$()),
      tap(() => this.initialize())
    );
  }
}
