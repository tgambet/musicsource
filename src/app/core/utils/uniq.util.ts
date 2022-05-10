import { identity } from 'rxjs';

export const uniq =
  <T>(mapFn: (t: T) => any = identity) =>
  (value: T, i: number, arr: T[]) =>
    arr.map(mapFn).indexOf(mapFn(value)) === i;
