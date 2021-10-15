import { connect, EMPTY, merge, of, OperatorFunction } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';

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

export const left = (error: unknown): Left => ({ tag: 'left', error });

export const toEither =
  <T>(): OperatorFunction<T, Either<T>> =>
  (obs) =>
    obs.pipe(
      map((result) => right(result)),
      catchError((error) => of(left(error)))
    );

export const foldEither = <T, R>(
  rightMap: OperatorFunction<T, R>,
  leftMap: OperatorFunction<any, R>
): OperatorFunction<Either<T>, R> =>
  connect((m$) =>
    merge(m$.pipe(collectRight(), rightMap), m$.pipe(collectLeft(), leftMap))
  );
