export const arrayEquals = <T>(a: T[], b: T[]): boolean =>
  a.length === b.length && a.every((val, index) => val === b[index]);

export const arrayEqualsUnordered = <T>(a: T[], b: T[]): boolean =>
  a.length === b.length && a.every((val) => b.includes(val));
