import { OperatorFunction } from 'rxjs';
import { scan } from 'rxjs/operators';

export const scanArray = <T>(): OperatorFunction<T, T[]> =>
  scan((acc, cur) => [...acc, cur], [] as T[]);
