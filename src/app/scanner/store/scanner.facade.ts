import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  selectError,
  selectExtractedCount,
  selectExtractingCount,
  selectLabel,
  selectExtractedProgress,
  selectSavedCount,
  selectSavingCount,
  selectScannedCount,
  selectState,
  selectSavedProgress,
} from '@app/scanner/store/scanner.selectors';
import {
  scanEnd,
  openDirectory,
  scanStart,
} from '@app/scanner/store/scanner.actions';

@Injectable()
export class ScannerFacade {
  error$ = this.store.select(selectError);
  state$ = this.store.select(selectState);
  label$ = this.store.select(selectLabel);
  extractProgress$ = this.store.select(selectExtractedProgress);
  saveProgress$ = this.store.select(selectSavedProgress);
  scannedCount$ = this.store.select(selectScannedCount);
  extractedCount$ = this.store.select(selectExtractedCount);
  extractingCount$ = this.store.select(selectExtractingCount);
  savedCount$ = this.store.select(selectSavedCount);
  savingCount$ = this.store.select(selectSavingCount);

  constructor(private store: Store) {}

  abort(): void {
    this.store.dispatch(scanEnd());
  }

  openDirectory(): void {
    this.store.dispatch(scanStart());
    this.store.dispatch(openDirectory());
  }

  // saveSong(song: Song, pictures?: Picture[]): Observable<Song> {
  //   return this.storage.open$(['pictures', 'songs'], 'readwrite').pipe(
  //     concatMap((transaction) => {
  //       const makeSong = (key?: PictureId): Song => ({
  //         ...song,
  //         pictureId: key,
  //       });
  //
  //       const saveSong = (pictureKey?: PictureId) => {
  //         const song1 = makeSong(pictureKey);
  //         return (
  //           this.storage
  //             .add$('songs', song1)
  //             // .exec$(transaction.objectStore('songs').add(song1))
  //             .pipe(mapTo(song1))
  //         );
  //       };
  //
  //       if (!pictures || pictures.length === 0) {
  //         return this.searchForCover(makeSong()).pipe(
  //           concatMap((coverKey) => saveSong(coverKey))
  //         );
  //       }
  //
  //       return transaction
  //         .objectStore('pictures')
  //         .getKey$(pictures[0].id)
  //         .pipe(
  //           concatMap((key) =>
  //             key
  //               ? saveSong(key as PictureId)
  //               : transaction
  //                   .objectStore('pictures')
  //                   .add$(pictures[0])
  //                   .pipe(
  //                     concatMap((pictKey) => saveSong(pictKey as PictureId))
  //                   )
  //           )
  //         );
  //     })
  //   );
  // }
  //
  // searchForCover(song: Song): Observable<PictureId | undefined> {
  //   if (!song.album) {
  //     return of(undefined);
  //   }
  //
  //   return this.storage.open$(['entries']).pipe(
  //     concatMap((t) =>
  //       t
  //         .objectStore<Entry>('entries')
  //         .get$(song.entryPath)
  //         .pipe(
  //           filter((entry): entry is FileEntry => !!entry && !!entry.parent),
  //           map((entry) => entry.parent),
  //           concatMap((parent) =>
  //             t
  //               .objectStore<Entry>('entries')
  //               .index('parent')
  //               .getAll$(parent as string)
  //           ),
  //           map((files) =>
  //             files.filter(
  //               (file) =>
  //                 file.name.endsWith('.jpg') || file.name.endsWith('.png')
  //             )
  //           ),
  //           concatMap((files) => {
  //             if (files.length === 0) {
  //               return of(undefined);
  //             }
  //             const bestFit = this.getBestFit(files, song.album as string);
  //             return from((bestFit as FileEntry).handle.getFile()).pipe(
  //               concatMap((file: File) => file.arrayBuffer()),
  //               map((buffer: ArrayBuffer) => this.arrayBufferToBase64(buffer)),
  //               concatMap(
  //                 (base64) =>
  //                   this.storage.put$<Picture>('pictures', {
  //                     data: base64,
  //                     id: getPictureId(base64),
  //                     format: this.getFormat(bestFit as FileEntry),
  //                   }) as Observable<PictureId>
  //               )
  //             );
  //           })
  //         )
  //     )
  //   );
  // }
  //
  // private getBestFit(files: Entry[], name: string): Entry {
  //   return (
  //     files.find((file) => file.name.toLowerCase().includes(name)) ||
  //     files.find(
  //       (file) =>
  //         file.name.toLowerCase().includes('cover') ||
  //         file.name.toLowerCase().includes('front') ||
  //         file.name.toLowerCase().includes('folder')
  //     ) ||
  //     files[0]
  //   );
  // }
  //
  // private getFormat = (best: FileEntry): string =>
  //   best.name.endsWith('png') ? 'image/png' : 'image/jpeg';
  //
  // private arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  //   let binary = '';
  //   const bytes = new Uint8Array(buffer);
  //   const len = bytes.byteLength;
  //   for (let i = 0; i < len; i++) {
  //     binary += String.fromCharCode(bytes[i]);
  //   }
  //   return window.btoa(binary);
  // };
}
