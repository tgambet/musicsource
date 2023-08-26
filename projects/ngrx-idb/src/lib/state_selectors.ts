import { createSelector } from '@ngrx/store';
import {
  IDBEntityState,
  IDBEntitySelectors,
  Dictionary,
  KeyType,
} from './models';

export function createSelectorsFactory<T, Index extends string>() {
  function getSelectors(): IDBEntitySelectors<
    T,
    Index,
    IDBEntityState<T, Index>
  >;
  function getSelectors<V>(
    selectState: (state: V) => IDBEntityState<T, Index>
  ): IDBEntitySelectors<T, Index, V>;
  function getSelectors(
    selectState?: (state: any) => IDBEntityState<T, Index>
  ): IDBEntitySelectors<T, Index, any> {
    const selectKeys = (state: IDBEntityState<T, Index>) => state.keys;
    const selectEntities = (state: IDBEntityState<T, Index>) => state.entities;
    const selectAll = createSelector(
      selectKeys,
      selectEntities,
      (keys: KeyType[], entities: Dictionary<T>): any =>
        keys.map((key) => entities[key as any])
    );

    const selectTotal = createSelector(selectKeys, (keys) => keys.length);

    const selectIndexKeys =
      (index: Index) => (state: IDBEntityState<T, Index>) =>
        state.indexes[index].keys;

    const selectIndexEntities =
      (index: Index) => (state: IDBEntityState<T, Index>) =>
        state.indexes[index].entities;

    const selectIndexAll = (index: Index) =>
      createSelector(
        selectIndexKeys(index),
        selectIndexEntities(index),
        selectEntities,
        (keys, index, entities) =>
          keys
            .map((key) => index[key as any] as [])
            .reduce((acc, curr) => [...acc, ...curr] as [], [])
            .map((key) => entities[key] as T)
      );

    if (!selectState) {
      return {
        selectIndexKeys,
        selectIndexEntities,
        selectIndexAll,
        selectKeys,
        selectEntities,
        selectAll,
        selectTotal,
      };
    }

    return {
      selectIndexKeys: (index: Index) =>
        createSelector(selectState, selectIndexKeys(index)),
      selectIndexEntities: (index: Index) =>
        createSelector(selectState, selectIndexEntities(index)),
      selectIndexAll: (index: Index) =>
        createSelector(selectState, selectIndexAll(index)),
      selectKeys: createSelector(selectState, selectKeys),
      selectEntities: createSelector(selectState, selectEntities),
      selectAll: createSelector(selectState, selectAll),
      selectTotal: createSelector(selectState, selectTotal),
    };
  }

  return { getSelectors };
}
