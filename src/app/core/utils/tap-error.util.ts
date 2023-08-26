import { tap } from 'rxjs/operators';
import { MonoTypeOperatorFunction } from 'rxjs';

export const tapError: <T>(
  onError: (_: any) => void,
) => MonoTypeOperatorFunction<T> = (project) =>
  tap({ error: (err) => project(err) });
