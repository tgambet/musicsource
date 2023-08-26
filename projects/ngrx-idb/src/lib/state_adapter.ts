import { IDBEntityState } from './models';

export enum DidMutate {
  EntitiesOnly,
  Both,
  None,
}

// export function createStateOperator<T, Index extends string, R>(
//   mutator: (arg: R, state: IDBEntityState<T, Index>) => DidMutate
// ): IDBEntityState<T, Index>;
export function createStateOperator<
  T,
  Index extends string,
  R,
  S extends IDBEntityState<T, Index>
>(mutator: (arg: R, state: IDBEntityState<T, Index>) => DidMutate): any {
  return function operation(arg: R, state: S): S {
    const clonedEntityState: IDBEntityState<T, Index> = {
      keys: [...state.keys],
      entities: { ...state.entities },
      indexes: { ...state.indexes },
    };

    const didMutate = mutator(arg, clonedEntityState);

    if (didMutate === DidMutate.Both) {
      //return Object.assign({}, state, clonedEntityState);
      return {
        ...state,
        keys: clonedEntityState.keys,
        entities: clonedEntityState.entities,
        indexes: clonedEntityState.indexes,
      };
    }

    if (didMutate === DidMutate.EntitiesOnly) {
      return {
        ...state,
        entities: clonedEntityState.entities,
        indexes: clonedEntityState.indexes,
      };
    }

    return state;
  };
}
