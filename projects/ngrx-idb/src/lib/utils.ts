import { isDevMode } from '@angular/core';
import {
  IndexKeyMultiSelector,
  IndexKeyMultiSelectorFn,
  IndexKeySelector,
  IndexKeySelectorFn,
  PrimaryKeySelector,
  PrimaryKeySelectorFn,
} from './models';

export function* keyGenerator() {
  let index = 1;
  while (true) yield index++;
}

export function getKeySelectorFn<T>(
  selectKey: PrimaryKeySelector<T>
): PrimaryKeySelectorFn<T>;
export function getKeySelectorFn<T>(
  selectKey: IndexKeySelector<T>
): IndexKeySelectorFn<T>;
export function getKeySelectorFn<T>(
  selectKey: IndexKeyMultiSelector<T>
): IndexKeyMultiSelectorFn<T>;
export function getKeySelectorFn<T>(
  selectKey:
    | PrimaryKeySelector<T>
    | IndexKeySelector<T>
    | IndexKeyMultiSelector<T>
) {
  return typeof selectKey === 'string'
    ? (entity: any) => entity[selectKey]
    : selectKey instanceof Array
    ? (entity: any) =>
        selectKey.reduce((result, path) => entity && entity[path], entity)
    : (entity: T) => selectKey(entity);
}

export function selectPrimaryKey<T>(
  entity: T,
  selectKey: PrimaryKeySelectorFn<T>
): any {
  const key = selectKey(entity);

  if (isDevMode() && key === undefined) {
    // console.warn(
    //   '@creasource/ngrx-idb: The entity passed to the `selectKey` implementation returned undefined.',
    //   'You should probably provide your own `selectKey` implementation.',
    //   'The entity that was passed:',
    //   entity,
    //   'The `selectId` implementation:',
    //   selectKey.toString()
    // );
  }

  return key;
}
