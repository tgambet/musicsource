import {
  EntityDefinition,
  IDBEntityAdapter,
  IndexDefinition,
  PrimaryKeySelector,
} from './models';
import { createInitialStateFactory } from './entity_state';
import { createSelectorsFactory } from './state_selectors';
import { createIndexedStateAdapter } from './sorted_state_adapter';

export function createIDBEntityAdapter<T, Index extends string>(options: {
  autoIncrement?: boolean;
  keySelector?: PrimaryKeySelector<T>;
  indexes?: readonly IndexDefinition<T, Index>[];
}): IDBEntityAdapter<T, Index> {
  const { autoIncrement, keySelector, indexes }: EntityDefinition<T, Index> = {
    autoIncrement: false,
    keySelector: (model: any) => model.id,
    indexes: [],
    ...options,
  };

  const stateFactory = createInitialStateFactory<T, Index>(indexes);
  const selectorsFactory = createSelectorsFactory<T, Index>();
  const stateAdapter = createIndexedStateAdapter(
    stateFactory.getInitialState,
    keySelector,
    indexes
  );

  return {
    autoIncrement,
    keySelector,
    ...stateFactory,
    ...selectorsFactory,
    ...stateAdapter,
  };
}
