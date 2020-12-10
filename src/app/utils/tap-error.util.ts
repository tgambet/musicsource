import { tap } from 'rxjs/operators';
import { MonoTypeOperatorFunction } from 'rxjs';

export const tapError: <T>(
  project: (_: any) => void
) => MonoTypeOperatorFunction<T> = (project: (_: any) => void) =>
  tap({ error: (err) => project(err) });
