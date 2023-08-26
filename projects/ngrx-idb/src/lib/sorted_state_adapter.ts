import {
  IndexDefinition,
  EntityMap,
  IDBEntityStateAdapter,
  IDBEntityState,
  Predicate,
  Update,
  EntityMapOne,
  KeyType,
  PrimaryKeySelector,
} from './models';
import { createStateOperator, DidMutate } from './state_adapter';
import { getKeySelectorFn, selectPrimaryKey } from './utils';

export function createIndexedStateAdapter<T, Index extends string>(
  getInitialState: () => IDBEntityState<T, Index>,
  keySelector: PrimaryKeySelector<T>,
  indexes: readonly IndexDefinition<T, Index>[]
): IDBEntityStateAdapter<T, Index> {
  type R = IDBEntityState<T, Index>;

  const keySelectorFn = getKeySelectorFn(keySelector);

  function getIndexDefinition(index: IndexDefinition<T, Index>) {
    if (typeof index === 'string') {
      return {
        name: index,
        keySelectorFn: (model: any) => model[index],
        multiEntry: false,
      };
    }
    return {
      name: index.name,
      keySelectorFn: getKeySelectorFn(
        index.keySelector ?? (((model: any) => model[index.name]) as any)
      ),
      multiEntry: index.multiEntry,
      // unique: index.unique, // TODO
    };
  }

  const indexesDefs = indexes.map(getIndexDefinition);

  function removeAll<S extends R>(state: S): S {
    return Object.assign({}, state, getInitialState());
  }

  function deleteEntitiesFromIndexes(toDelete: KeyType[], state: R): void {
    indexesDefs.forEach((def) => {
      const index = state.indexes[def.name];

      const { keys, entities } = index;

      const obsoleteKeys: any[] = [];

      keys.forEach((key: any) => {
        entities[key] = entities[key]?.filter(
          (primaryKey: any) => !toDelete.includes(primaryKey)
        );
        if (entities[key]?.length === 0) {
          delete entities[key];
          obsoleteKeys.push(key);
        }
      });

      index.keys = keys.filter((k: any) => !obsoleteKeys.includes(k));
    });
  }

  function removeOneMutably(key: KeyType, state: R): DidMutate {
    return removeManyMutably([key], state);
  }

  function removeManyMutably(keys: KeyType[], state: R): DidMutate;
  function removeManyMutably(predicate: Predicate<T>, state: R): DidMutate;
  function removeManyMutably(
    keysOrPredicate: KeyType[] | Predicate<T>,
    state: R
  ): DidMutate {
    const keys =
      keysOrPredicate instanceof Array
        ? keysOrPredicate
        : state.keys.filter((key: any) =>
            keysOrPredicate(state.entities[key] as T)
          );

    const toDelete: KeyType[] = keys.filter(
      (key: any) => key in state.entities
    );

    toDelete.forEach((key: any) => delete state.entities[key]);

    const didMutate = toDelete.length > 0;

    if (didMutate) {
      state.keys = state.keys.filter((id: any) => id in state.entities);

      deleteEntitiesFromIndexes(toDelete, state);
    }

    return didMutate ? DidMutate.Both : DidMutate.None;
  }

  function addOneMutably(entity: T, state: R): DidMutate {
    return addManyMutably([entity], state);
  }

  function addManyMutably(newModels: T[], state: R): DidMutate {
    const models = newModels.filter(
      (model) => !(selectPrimaryKey(model, keySelectorFn) in state.entities)
    );

    if (models.length === 0) {
      return DidMutate.None;
    } else {
      merge(models, state);
      return DidMutate.Both;
    }
  }

  function setAllMutably(models: T[], state: R): DidMutate {
    const { entities, keys, indexes } = getInitialState();
    state.entities = entities;
    state.keys = keys;
    state.indexes = indexes;

    addManyMutably(models, state);

    return DidMutate.Both;
  }

  function setOneMutably(entity: T, state: R): DidMutate {
    const key = selectPrimaryKey(entity, keySelectorFn);
    if (key in state.entities) {
      state.keys = state.keys.filter((val) => val !== key);
      deleteEntitiesFromIndexes([key], state);
      merge([entity], state);
      return DidMutate.Both;
    } else {
      return addOneMutably(entity, state);
    }
  }

  function setManyMutably(entities: T[], state: R): DidMutate {
    const didMutateSetOne = entities.map((entity) =>
      setOneMutably(entity, state)
    );

    switch (true) {
      case didMutateSetOne.some((didMutate) => didMutate === DidMutate.Both):
        return DidMutate.Both;
      case didMutateSetOne.some(
        (didMutate) => didMutate === DidMutate.EntitiesOnly
      ):
        return DidMutate.EntitiesOnly;
      default:
        return DidMutate.None;
    }
  }

  function updateOneMutably(update: Update<T>, state: R): DidMutate {
    return updateManyMutably([update], state);
  }

  function takeUpdatedModel(models: T[], update: Update<T>, state: R): boolean {
    const oldKey = update.key as any;

    if (!(oldKey in state.entities)) {
      return false;
    }

    const original = state.entities[oldKey];
    const updated = Object.assign({}, original, update.changes);
    const newKey = selectPrimaryKey(updated, keySelectorFn);

    delete state.entities[oldKey];

    models.push(updated);

    return newKey !== update.key;
  }

  function updateManyMutably(updates: Update<T>[], state: R): DidMutate {
    const models: T[] = [];

    const didMutateKeys =
      updates.filter((update) => takeUpdatedModel(models, update, state))
        .length > 0;

    if (models.length === 0) {
      return DidMutate.None;
    } else {
      const originalKeys = state.keys;
      const updatedIndexes: number[] = [];
      const keysToDelete: KeyType[] = [];
      state.keys = state.keys.filter((key: any, index: number) => {
        if (key in state.entities) {
          return true;
        } else {
          updatedIndexes.push(index);
          keysToDelete.push(key);
          return false;
        }
      });

      deleteEntitiesFromIndexes(keysToDelete, state);

      merge(models, state);

      if (
        !didMutateKeys &&
        updatedIndexes.every((i: number) => state.keys[i] === originalKeys[i])
      ) {
        return DidMutate.EntitiesOnly;
      } else {
        return DidMutate.Both;
      }
    }
  }

  function mapMutably(map: EntityMap<T>, state: R): DidMutate {
    const updates: Update<T>[] = state.keys.reduce(
      (changes: Update<T>[], key: KeyType) => {
        const change = map(state.entities[key as any] as T);
        if (change !== state.entities[key as any]) {
          changes.push({ key, changes: change });
        }
        return changes;
      },
      []
    );

    return updateManyMutably(updates, state);
  }

  function mapOneMutably({ map, key }: EntityMapOne<T>, state: R): DidMutate {
    const entity = state.entities[key as any];
    if (!entity) {
      return DidMutate.None;
    }

    const updatedEntity = map(entity);
    return updateOneMutably(
      {
        key: key,
        changes: updatedEntity,
      },
      state
    );
  }

  function upsertOneMutably(entity: T, state: R): DidMutate {
    return upsertManyMutably([entity], state);
  }

  function upsertManyMutably(entities: T[], state: R): DidMutate {
    const added: any[] = [];
    const updated: any[] = [];

    for (const entity of entities) {
      const key = selectPrimaryKey(entity, keySelectorFn);
      if (key in state.entities) {
        updated.push({ key, changes: entity });
      } else {
        added.push(entity);
      }
    }

    const didMutateByUpdated = updateManyMutably(updated, state);
    const didMutateByAdded = addManyMutably(added, state);

    switch (true) {
      case didMutateByAdded === DidMutate.None &&
        didMutateByUpdated === DidMutate.None:
        return DidMutate.None;
      case didMutateByAdded === DidMutate.Both ||
        didMutateByUpdated === DidMutate.Both:
        return DidMutate.Both;
      default:
        return DidMutate.EntitiesOnly;
    }
  }

  const sort = (a: KeyType, b: KeyType) => {
    return a === b ? 0 : a > b ? 1 : -1;
  };

  function mergeKeys(
    modelKeys: KeyType[],
    indexKeys: KeyType[],
    uniq: boolean = false
  ) {
    const keys: any[] = [];

    let i = 0;
    let j = 0;

    while (i < modelKeys.length && j < indexKeys.length) {
      const modelKey = modelKeys[i];
      const entityKey = indexKeys[j];

      if (uniq && modelKey === entityKey) {
        i++;
        continue;
      }

      if ([modelKey, entityKey].sort(sort)[0] === modelKey) {
        keys.push(modelKey);
        i++;
      } else {
        keys.push(entityKey);
        j++;
      }
    }

    return i < modelKeys.length
      ? keys.concat(modelKeys.slice(i))
      : keys.concat(indexKeys.slice(j));
  }

  function merge(models: T[], state: R): void {
    if (models.length === 0) {
      return;
    }

    const modelWithKeys = models.map((model) => ({
      key: keySelectorFn(model),
      value: model,
    }));

    modelWithKeys.sort((a, b) => sort(a.key, b.key));

    state.keys = mergeKeys(
      modelWithKeys.map(({ key }) => key),
      state.keys
    );

    modelWithKeys.forEach(({ key, value }) => {
      state.entities[key as any] = value;
    });

    indexesDefs.forEach(({ name, keySelectorFn, multiEntry }) => {
      const index = state.indexes[name];

      let modelWithIndexKeys = modelWithKeys
        .map(({ key, value }) => ({
          key,
          value,
          indexKey: keySelectorFn(value),
        }))
        .filter((o) => o.indexKey !== undefined);

      if (modelWithIndexKeys.length === 0) {
        return;
      }

      if (multiEntry) {
        modelWithIndexKeys = modelWithIndexKeys
          .map(({ key, value, indexKey: indexKeys }) =>
            indexKeys.map((indexKey: any) => ({ key, value, indexKey }))
          )
          .reduce((acc, curr) => [...acc, ...curr], []);
      }

      modelWithIndexKeys.sort((a, b) => sort(a.indexKey, b.indexKey));

      const uniq = (val: any, index: number, array: any[]) =>
        array.indexOf(val) === index;

      index.keys = mergeKeys(
        modelWithIndexKeys.map(({ indexKey }) => indexKey).filter(uniq),
        index.keys,
        true
      );

      modelWithIndexKeys.forEach(({ indexKey, key }) => {
        index.entities[indexKey] = mergeKeys(
          [key],
          index.entities[indexKey] ?? [],
          true
        );
      });
    });
  }

  return {
    removeAll,
    removeOne: createStateOperator(removeOneMutably),
    removeMany: createStateOperator(removeManyMutably),
    addOne: createStateOperator(addOneMutably),
    updateOne: createStateOperator(updateOneMutably),
    upsertOne: createStateOperator(upsertOneMutably),
    setAll: createStateOperator(setAllMutably),
    setOne: createStateOperator(setOneMutably),
    setMany: createStateOperator(setManyMutably),
    addMany: createStateOperator(addManyMutably),
    updateMany: createStateOperator(updateManyMutably),
    upsertMany: createStateOperator(upsertManyMutably),
    map: createStateOperator(mapMutably),
    mapOne: createStateOperator(mapOneMutably),
  };
}
