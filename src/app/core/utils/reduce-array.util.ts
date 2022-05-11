export const reduceArray =
  <T>() =>
  (prev: T[], curr: T[]): T[] =>
    [...prev, ...curr];
