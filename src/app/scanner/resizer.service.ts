import { Injectable } from '@angular/core';
import { merge, Observable, Subject, toArray } from 'rxjs';
import { first } from 'rxjs/operators';

type Result = {
  height: number;
  width: number;
  src: string;
};

@Injectable()
export class ResizerService {
  private readonly workers: Worker[] = new Array(8).fill(0).map(
    () =>
      new Worker(new URL('./resizer.worker', import.meta.url), {
        name: 'resizer',
      })
  );
  private responses = new Subject<
    { id: number; result: Result } | { id: number; error: any }
  >();

  constructor() {
    this.workers.forEach(
      (worker) =>
        (worker.onmessage = ({ data }) => {
          this.responses.next(data);
        })
    );
    this.workers.forEach((worker) => {
      worker.onerror = ({ error }) => console.error(3, error);
    });
  }

  resize(
    blob: Blob,
    sizes: { height: number; width?: number }[]
  ): Observable<Result[]> {
    return merge(...sizes.map((size) => this.resizeOne(blob, size))).pipe(
      toArray()
    );
  }

  resizeOne(
    blob: Blob,
    size: { height: number; width?: number }
  ): Observable<Result> {
    return new Observable((observer) => {
      const reqId = Math.random();
      const sub = this.responses
        .pipe(first(({ id }) => id === reqId))
        .subscribe({
          next: (value) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            'result' in value
              ? observer.next(value.result)
              : observer.error(value.error);
            observer.complete();
          },
        });

      this.workers[
        Math.floor(Math.random() * 100) % this.workers.length
      ].postMessage({
        id: reqId,
        imageData: blob,
        width: size.width ?? size.height,
        height: size.height,
      });

      return () => {
        sub.unsubscribe();
      };
    });
  }
}
