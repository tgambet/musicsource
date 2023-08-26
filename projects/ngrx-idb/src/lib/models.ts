export type KeyType = string | number;

export type PrimaryKeySelectorFn<T> = (model: T) => KeyType;

export type PrimaryKeySelector<T> = PrimaryKeySelectorFn<T> | string | string[];

export type IndexKeySelectorFn<T> = (model: T) => KeyType | undefined;

export type IndexKeyMultiSelectorFn<T> = (model: T) => KeyType[] | undefined;

export type IndexKeySelector<T> = IndexKeySelectorFn<T> | string | string[];
export type IndexKeyMultiSelector<T> =
  | IndexKeyMultiSelectorFn<T>
  | string
  | string[];

export type Dictionary<T> = Record<any, T | undefined>;

export type Update<T> = {
  key: KeyType;
  changes: Partial<T>;
};

export type Predicate<T> = (entity: T) => boolean;

export type EntityMap<T> = (entity: T) => T;

export type EntityMapOne<T> = {
  key: KeyType;
  map: EntityMap<T>;
};

export type IDBEntityState<T, Index extends string> = {
  keys: KeyType[];
  entities: Dictionary<T>;
  indexes: {
    [name in Index]: {
      keys: KeyType[];
      entities: Dictionary<KeyType[]>;
    };
  };
};

export type IndexDefinition<T, Index extends string> =
  | {
      name: Index;
      multiEntry?: false;
      unique?: boolean;
      keySelector?: IndexKeySelector<T>;
    }
  | {
      name: Index;
      multiEntry: true;
      unique?: boolean;
      keySelector?: IndexKeyMultiSelector<T>;
    }
  | Index;

export type EntityDefinition<T, Index extends string> =
  | {
      autoIncrement: true;
      keySelector?: PrimaryKeySelector<T>;
      indexes: readonly IndexDefinition<T, Index>[];
    }
  | {
      autoIncrement: false;
      keySelector: PrimaryKeySelector<T>;
      indexes: readonly IndexDefinition<T, Index>[];
    };

export interface IDBEntityStateAdapter<T, Index extends string> {
  addOne<S extends IDBEntityState<T, Index>>(entity: T, state: S): S;
  addMany<S extends IDBEntityState<T, Index>>(entities: T[], state: S): S;

  setAll<S extends IDBEntityState<T, Index>>(entities: T[], state: S): S;
  setOne<S extends IDBEntityState<T, Index>>(entity: T, state: S): S;
  setMany<S extends IDBEntityState<T, Index>>(entities: T[], state: S): S;

  removeOne<S extends IDBEntityState<T, Index>>(key: KeyType, state: S): S;

  removeMany<S extends IDBEntityState<T, Index>>(keys: KeyType[], state: S): S;
  removeMany<S extends IDBEntityState<T, Index>>(
    predicate: Predicate<T>,
    state: S
  ): S;

  removeAll<S extends IDBEntityState<T, Index>>(state: S): S;

  updateOne<S extends IDBEntityState<T, Index>>(update: Update<T>, state: S): S;
  updateMany<S extends IDBEntityState<T, Index>>(
    updates: Update<T>[],
    state: S
  ): S;

  upsertOne<S extends IDBEntityState<T, Index>>(entity: T, state: S): S;
  upsertMany<S extends IDBEntityState<T, Index>>(entities: T[], state: S): S;

  mapOne<S extends IDBEntityState<T, Index>>(map: EntityMapOne<T>, state: S): S;
  map<S extends IDBEntityState<T, Index>>(map: EntityMap<T>, state: S): S;
}

export interface IDBEntitySelectors<T, Index extends string, V> {
  selectIndexKeys: (index: Index) => (state: V) => KeyType[];
  selectIndexEntities: (index: Index) => (state: V) => Dictionary<KeyType[]>;
  selectIndexAll: (index: Index) => (state: V) => T[];
  selectKeys: (state: V) => KeyType[];
  selectEntities: (state: V) => Dictionary<T>;
  selectAll: (state: V) => T[];
  selectTotal: (state: V) => number;
}

export interface IDBEntityAdapter<T, Index extends string>
  extends IDBEntityStateAdapter<T, Index> {
  autoIncrement: boolean;
  keySelector: PrimaryKeySelector<T> | undefined;
  getInitialState(): IDBEntityState<T, Index>;
  getInitialState<S extends object>(state: S): IDBEntityState<T, Index> & S;
  getSelectors(): IDBEntitySelectors<T, Index, IDBEntityState<T, Index>>;
  getSelectors<V>(
    selectState: (state: V) => IDBEntityState<T, Index>
  ): IDBEntitySelectors<T, Index, V>;
}
