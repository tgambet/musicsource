import { OperatorFunction } from 'rxjs';
import { reduce } from 'rxjs/operators';

export const reduceArray = <T>(): OperatorFunction<T, T[]> =>
  reduce((acc, cur) => [...acc, cur], [] as T[]);
