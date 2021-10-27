import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import { FileEntry } from '@app/database/entries/entry.model';
import { ICommonTagsResult, IFormat } from 'music-metadata/lib/type';
import { PictureId } from '@app/database/pictures/picture.model';

type Result = {
  common: Omit<ICommonTagsResult, 'picture'>;
  format: IFormat;
  lastModified: number;
  pictures: {
    id: PictureId;
    name: string;
    blob: Blob;
  }[];
};

@Injectable()
export class ExtractorService {
  private readonly workers: Worker[] = new Array(navigator.hardwareConcurrency)
    .fill(0)
    .map(
      () =>
        new Worker(new URL('./extractor.worker', import.meta.url), {
          name: 'extractor',
        })
    );
  private responses = new Subject<
    { id: number; result: Result } | { id: number; error: any }
  >();

  constructor(/*@Inject(DOCUMENT) private document: Document*/) {
    // const win = document.defaultView;
    // if (!win) {
    //   return;
    // }
    // import('process')
    //   .then((process) => {
    //     (win as any).process = process;
    //     (win as any).global = window;
    //     return import('buffer');
    //   })
    //   .then((buffer) => {
    //     (win as any).Buffer = buffer.Buffer;
    //   });

    // if (typeof Worker !== 'undefined') {
    // Create a new

    this.workers.forEach(
      (worker) =>
        (worker.onmessage = ({ data }) => {
          this.responses.next(data);
        })
    );

    // worker.postMessage('hello');
    // } else {
    // Web Workers are not supported in this environment.
    // You should add a fallback so that your program still executes correctly.
    // }
  }

  extract(entry: FileEntry): Observable<Result> {
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
      entry.handle
        .getFile()
        .then((file) =>
          this.workers[
            Math.floor(Math.random() * 100) % this.workers.length
          ].postMessage({
            id: reqId,
            file,
          })
        )
        .catch((error) => observer.error(error));
      return () => {
        sub.unsubscribe();
      };
    });

    // return defer(() => from(entry.handle.getFile())).pipe(
    //   // filter(file => this.supportedTypes.includes(file.type)),
    //   tap((file) => this.worker?.postMessage({ id: 0, file })),
    //   concatMap((file) =>
    //     from(
    //       import('music-metadata-browser').then((musicMetadata) =>
    //         musicMetadata.parseBlob(file /*{duration: true}*/)
    //       )
    //     ).pipe(
    //       map(({ common, format }) => ({
    //         common,
    //         format,
    //         lastModified: file.lastModified,
    //       }))
    //     )
    //   )
    // );
  }
}
