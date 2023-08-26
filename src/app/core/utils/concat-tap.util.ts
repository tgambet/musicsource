import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { concatMap, mapTo } from 'rxjs/operators';

export const concatTap: <T, R>(
  project: (_: T) => Observable<R>,
) => MonoTypeOperatorFunction<T> = (project) =>
  concatMap((t) => project(t).pipe(mapTo(t)));
