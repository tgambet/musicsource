import { IndexDefinition, IDBEntityState } from './models';

function getInitialEntityState<T>() {
  return {
    keys: [],
    entities: {},
    indexes: {},
  };
}

export function createInitialStateFactory<T, Index extends string>(
  indexes: readonly IndexDefinition<T, Index>[]
) {
  function getInitialState(): IDBEntityState<T, Index>;
  function getInitialState<S extends object>(
    additionalState: S
  ): IDBEntityState<T, Index> & S;
  function getInitialState(additionalState: any = {}): any {
    const indexesNames = indexes.map((def) =>
      typeof def === 'string' ? def : def.name
    );
    const obj = Object.assign(getInitialEntityState(), additionalState);
    indexesNames.forEach(
      (name) =>
        (obj.indexes[name] = {
          keys: [],
          entities: {},
        })
    );
    return obj;
  }

  return { getInitialState };
}
