import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  selectScannedCount,
  selectError,
  selectLog,
  selectExtractedCount,
  selectProgress,
  selectScannerState,
} from '@app/store/scanner/scanner.selectors';
import { abortScan, openDirectory } from '@app/store/scanner/scanner.actions';
import { Picture, Song } from '@app/services/extractor.service';
import { concatMap, mapTo } from 'rxjs/operators';
import { StorageService } from '@app/services/storage.service';
import { Observable } from 'rxjs';

@Injectable()
export class ScannerFacade {
  error$ = this.store.select(selectError);
  state$ = this.store.select(selectScannerState);
  scannedCount$ = this.store.select(selectScannedCount);
  extractedCount$ = this.store.select(selectExtractedCount);
  log$ = this.store.select(selectLog);
  progress$ = this.store.select(selectProgress);

  constructor(private store: Store, private storage: StorageService) {}

  abort() {
    this.store.dispatch(abortScan());
  }

  openDirectory() {
    this.store.dispatch(openDirectory());
  }

  saveSong(song: Song, pictures?: Picture[]): Observable<Song> {
    return this.storage.open$(['pictures', 'songs'], 'readwrite').pipe(
      concatMap((transaction) => {
        const makeSong = (key?: IDBValidKey): Song => ({
          ...song,
          pictureKey: key,
        });

        const saveSong = (pictureKey?: IDBValidKey) => {
          const song1 = makeSong(pictureKey);
          return this.storage
            .exec$(transaction.objectStore('songs').add(song1))
            .pipe(mapTo(song1));
        };

        if (!pictures || pictures.length === 0) {
          return saveSong();
        }

        return this.storage
          .exec$<IDBValidKey | undefined>(
            transaction.objectStore('pictures').getKey(pictures[0].hash)
          )
          .pipe(
            concatMap((key) =>
              key
                ? saveSong(key)
                : this.storage
                    .exec$(transaction.objectStore('pictures').add(pictures[0]))
                    .pipe(concatMap((pictKey) => saveSong(pictKey)))
            )
          );
      })
    );
  }
}
