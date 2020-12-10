import { EMPTY, of, OperatorFunction } from 'rxjs';
import { concatMap } from 'rxjs/operators';

export interface Left {
  tag: 'left';
  error: any;
}

export interface Right<T> {
  tag: 'right';
  result: T;
}

export type Either<T> = Left | Right<T>;

export const collectRight = <T>(): OperatorFunction<Either<T>, T> =>
  concatMap((t) => (t.tag === 'right' ? of(t.result) : EMPTY));

export const collectLeft = <T>(): OperatorFunction<Either<T>, any> =>
  concatMap((t) => (t.tag === 'left' ? of(t.error) : EMPTY));

export const right = <T>(result: T): Right<T> => ({ tag: 'right', result });

export const left = (error: any): Left => ({ tag: 'left', error });
