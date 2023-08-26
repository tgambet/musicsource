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
import { first, map } from 'rxjs/operators';
import { FileEntry } from '@app/database/entries/entry.model';
import { Artist } from '@app/database/artists/artist.model';
import { Album } from '@app/database/albums/album.model';
import { Song } from '@app/database/songs/song.model';
import { Picture } from '@app/database/pictures/picture.model';

type ExtractorWorkerMessage = {
  id: number;
  result: ExtractorResult;
  error?: any;
};

export type ExtractorResult = {
  artists: Artist[];
  album: Album;
  song: Song;
  pictures: Picture[];
};

@Injectable()
export class ExtractorService {
  readonly workers: Observable<Worker[]> = new Observable<Worker[]>(
    (observer) => {
      const workers = new Array(this.workerCount).fill(0).map(
        () =>
          new Worker(new URL('./extractor.worker', import.meta.url), {
            name: 'extractor',
          }),
      );
      console.log('Extractor workers created');
      observer.next(workers);
      return () => workers.forEach((worker) => worker.terminate());
    },
  ).pipe(
    share({
      resetOnComplete: false,
      resetOnRefCountZero: true,
      resetOnError: false,
      connector: () => new ReplaySubject(1),
    }),
  );

  private readonly workerCount = navigator.hardwareConcurrency;

  extract(entry: FileEntry): Observable<ExtractorResult> {
    return this.workers.pipe(
      map((workers) => workers[Math.floor(Math.random() * this.workerCount)]),
      map((worker) => {
        const id = Math.random();
        worker.postMessage({ id, entry });
        return [worker, id] as [Worker, number];
      }),
      concatMap(([worker, random]) =>
        fromEvent<MessageEvent<ExtractorWorkerMessage>>(worker, 'message').pipe(
          first(({ data: { id } }) => id === random),
        ),
      ),
      first(),
      map(({ data }) => data),
      concatMap((result) =>
        'error' in result ? throwError(() => result.error) : of(result.result),
      ),
    );
  }
}
