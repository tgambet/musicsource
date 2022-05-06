import { Injectable } from '@angular/core';
import {
  concatMap,
  fromEvent,
  Observable,
  of,
  ReplaySubject,
  share,
  throwError,
} from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { Picture } from '@app/database/pictures/picture.model';

type Result = {
  height: number;
  width: number;
  src: string;
};

@Injectable()
export class ResizerService {
  readonly workers: Observable<Worker[]> = new Observable<Worker[]>(
    (observer) => {
      const workers = new Array(this.workerCount).fill(0).map(
        () =>
          new Worker(new URL('./resizer.worker', import.meta.url), {
            name: 'resizer',
          })
      );
      observer.next(workers);
      return () => workers.forEach((worker) => worker.terminate());
    }
  ).pipe(
    share({
      resetOnComplete: false,
      resetOnRefCountZero: true,
      resetOnError: false,
      connector: () => new ReplaySubject(1),
    })
  );

  private readonly workerCount = navigator.hardwareConcurrency;

  // private readonly workers: Worker[] = new Array(8).fill(0).map(
  //   () =>
  //     new Worker(new URL('./resizer.worker', import.meta.url), {
  //       name: 'resizer',
  //     })
  // );
  // private responses = new Subject<
  //   { id: number; result: Result } | { id: number; error: any }
  // >();

  constructor() {
    // this.workers.forEach(
    //   (worker) =>
    //     (worker.onmessage = ({ data }) => {
    //       this.responses.next(data);
    //     })
    // );
    // this.workers.forEach((worker) => {
    //   worker.onerror = ({ error }) => console.error(3, error);
    // });
  }

  // resize(
  //   blob: Blob,
  //   sizes: { height: number; width?: number }[]
  // ): Observable<Result[]> {
  //   return merge(...sizes.map((size) => this.resizeOne(blob, size))).pipe(
  //     toArray()
  //   );
  // }

  resizeOne(
    picture: Picture,
    size: { height: number; width?: number }
  ): Observable<Result> {
    return this.workers.pipe(
      map((workers) => workers[Math.floor(Math.random() * this.workerCount)]),
      map((worker) => {
        const id = Math.random();
        worker.postMessage({
          id,
          picture,
          height: size.height,
          width: size.width ?? size.height,
        });
        return [worker, id] as [Worker, number];
      }),
      switchMap(([worker, random]) =>
        fromEvent<
          MessageEvent<{
            id: number;
            result: any;
            error?: any;
          }>
        >(worker, 'message').pipe(first(({ data: { id } }) => id === random))
      ),
      first(),
      map(({ data }) => data),
      concatMap((result) =>
        'error' in result ? throwError(() => result.error) : of(result.result)
      )
    );
  }
}
