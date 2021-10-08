import { ApplicationRef, Injectable } from '@angular/core';
import {
  act,
  Actions,
  createEffect,
  EffectNotification,
  ofType,
  OnRunEffects,
} from '@ngrx/effects';
import { EMPTY, merge, Observable, of, throwError, toArray } from 'rxjs';
import {
  catchError,
  concatMap,
  concatMapTo,
  delay,
  filter,
  first,
  groupBy,
  map,
  mapTo,
  mergeMap,
  publish,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { FileService } from '@app/scanner/file.service';
import { ExtractorService } from '@app/scanner/extractor.service';
import { DatabaseService } from '@app/database/database.service';
import { Entry, isFile } from '@app/database/entries/entry.model';
import {
  abortScan,
  buildAlbumFailure,
  buildAlbums,
  buildAlbumsFailure,
  buildAlbumsSuccess,
  buildAlbumSuccess,
  buildArtistFailure,
  buildArtists,
  buildArtistsFailure,
  buildArtistsSuccess,
  buildArtistSuccess,
  extractEntries,
  extractEntriesFailure,
  extractEntriesSuccess,
  extractEntryFailure,
  extractEntrySuccess,
  openDirectory,
  openDirectoryFailure,
  openDirectorySuccess,
  scanAborted,
  scanEntries,
  scanEntriesFailure,
  scanEntriesSuccess,
  scanEntryFailure,
  scanEntrySuccess,
  scanSuccess,
} from '@app/scanner/store/scanner.actions';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ScannerFacade } from '@app/scanner/store/scanner.facade';
import { collectLeft, collectRight } from '@app/core/utils/either.util';
import { Album, getAlbumId } from '@app/database/albums/album.model';
import { SetRequired } from '@app/core/utils/types.util';
import { Song } from '@app/database/songs/song.model';
import { hash } from '@app/core/utils/hash.util';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ScanComponent } from '@app/scanner/scan.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';

// noinspection JSUnusedGlobalSymbols
@Injectable()
export class ScannerEffects implements OnRunEffects {
  // https://bugs.chromium.org/p/chromium/issues/detail?id=1146886&q=component%3ABlink%3EStorage%3EFileSystem&can=2
  handle?: any;
  scannerRef?: MatDialogRef<ScanComponent>;

  step0$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(openDirectoryFailure),
        concatMap(() =>
          this.router.navigate(['/404'], { skipLocationChange: true })
        ),
        concatMap(() => this.router.navigate(['/welcome']))
      ),
    { dispatch: false }
  );

  step1$ = createEffect(() =>
    this.actions$.pipe(
      ofType(openDirectorySuccess),
      concatMap((dir) => {
        this.handle = dir.directory.handle;

        const scanner = this.dialog.open(ScanComponent, {
          width: '90%',
          maxWidth: '325px',
          hasBackdrop: true,
          disableClose: true,
          scrollStrategy: new NoopScrollStrategy(),
          closeOnNavigation: false,
          panelClass: 'scan-dialog',
        });

        this.scannerRef = scanner;

        return scanner.afterOpened().pipe(map(() => scanEntries(dir)));
      })
      // tap(async () => {
      //   await this.router.navigate([{ outlets: { dialog: ['scan'] } }], {
      //     skipLocationChange: true,
      //   });
      // }),
      // map((dir) => scanEntries(dir))
    )
  );
  step2$ = createEffect(() =>
    this.actions$.pipe(
      ofType(scanEntriesSuccess),
      delay(100),
      mapTo(extractEntries())
    )
  );
  step3$ = createEffect(() =>
    this.actions$.pipe(
      ofType(extractEntriesSuccess),
      delay(100),
      mapTo(buildAlbums())
    )
  );
  step4$ = createEffect(() =>
    this.actions$.pipe(
      ofType(buildAlbumsSuccess),
      delay(100),
      mapTo(buildArtists())
    )
  );
  step5$ = createEffect(() =>
    this.actions$.pipe(
      ofType(buildArtistsSuccess),
      delay(100),
      tap(() => localStorage.setItem('scanned', '1')),
      tap(() => this.router.navigate(['/library'])),
      mapTo(scanSuccess())
    )
  );

  onAbort$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(scanAborted),
        tap(() => this.scannerRef?.close()),
        tap(() => this.snackBar.open(`Scan aborted`, '', { duration: 2500 })),
        concatMap(() => this.storage.clear$()),
        concatMap(() =>
          this.router.navigate(['/404'], { skipLocationChange: true })
        ),
        concatMap(() => this.router.navigate(['/welcome']))
      ),
    { dispatch: false }
  );

  openDirectory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(openDirectory),
      act({
        project: () =>
          this.files
            .open()
            .pipe(map((directory) => openDirectorySuccess({ directory }))),
        error: (error) => openDirectoryFailure({ error }),
      })
    )
  );

  // error$ = createEffect(
  //   () =>
  //     this.actions$.pipe(
  //       ofType(openDirectoryFailure),
  //       tap(async ({ error }) => {
  //         if (error.code !== 20) {
  //           await this.router.navigate([{ outlets: { dialog: ['scan'] } }], {
  //             skipLocationChange: true,
  //           });
  //         }
  //       })
  //     ),
  //   { dispatch: false }
  // );

  scanDirectory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(scanEntries),
      act({
        project: ({ directory }) =>
          this.files.walk(directory).pipe(
            concatMap((entry: Entry) =>
              this.storage.add$('entries', entry).pipe(
                concatMap(() =>
                  isFile(entry) ? of(scanEntrySuccess({ entry })) : EMPTY
                ),
                catchError((error) => of(scanEntryFailure({ error })))
              )
            ),
            takeUntil(
              this.actions$.pipe(
                ofType(abortScan),
                concatMapTo(throwError(() => 'aborted'))
              )
            )
          ),
        error: (error) =>
          error === 'aborted' ? scanAborted() : scanEntriesFailure({ error }),
        complete: (count) => scanEntriesSuccess({ count }),
      })
    )
  );

  parseEntries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(extractEntries),
      act({
        project: () =>
          this.storage.walk$<Entry>('entries').pipe(
            map(({ value }) => value),
            filter(isFile),
            // TODO perf: check in db before extracting
            concatMap((entry) => this.extractor.extract(entry)),
            publish((m$) =>
              merge(
                m$.pipe(
                  collectRight(),
                  concatMap(({ song, pictures }) =>
                    this.scanner.saveSong(song, pictures).pipe(
                      mapTo(extractEntrySuccess({ song })),
                      // tapError((err) => console.error(err)),
                      catchError((error) => of(extractEntryFailure({ error })))
                    )
                  )
                ),
                m$.pipe(
                  collectLeft(),
                  map((error) => extractEntryFailure({ error }))
                )
              )
            ),
            takeUntil(
              this.actions$.pipe(
                ofType(abortScan),
                concatMapTo(throwError(() => 'aborted'))
              )
            )
          ),
        complete: (count) => extractEntriesSuccess({ count }),
        error: (error) =>
          error === 'aborted'
            ? scanAborted()
            : extractEntriesFailure({ error }),
      })
    )
  );

  buildAlbums$ = createEffect(() =>
    this.actions$.pipe(
      ofType(buildAlbums),
      act({
        project: () =>
          this.storage.walk$<SetRequired<Song, 'album'>>('songs', 'album').pipe(
            filter(({ key }) => !!key.toString().trim()), // Prevent empty strings
            groupBy(({ value: song }) => song.album, {
              element: ({ value: song }) => song,
            }),
            mergeMap((groups$) =>
              groups$.pipe(
                toArray(),
                map((songs) => ({
                  album: groups$.key,
                  songs,
                }))
              )
            ),
            map(({ album, songs }) => {
              const artists = songs
                .map((song) => song.artists || [])
                .reduce((acc, cur) => [...acc, ...cur], [] as string[])
                .filter((song, i, arr) => arr.indexOf(song) === i);

              const lastModified = [...songs].sort(
                (s1, s2) =>
                  s2.lastModified.getTime() - s1.lastModified.getTime()
              )[0].lastModified;

              const albumArtist =
                songs.find((song) => song.albumartist)?.albumartist ||
                artists.length === 1
                  ? artists[0]
                  : undefined;

              const modifiedDate = new Date(lastModified);
              modifiedDate.setMinutes(0, 0, 0);

              return {
                id: getAlbumId(albumArtist, album),
                name: album,
                albumArtist,
                artists,
                year: songs[0].year,
                pictureKey: songs.find((song) => song.pictureKey)?.pictureKey,
                lastModified: modifiedDate,
              };
            }),
            concatMap((album) =>
              this.storage.add$<Album>('albums', album).pipe(
                mapTo(buildAlbumSuccess({ album })),
                catchError((error) => of(buildAlbumFailure({ error })))
              )
            )
          ),
        complete: (count) => buildAlbumsSuccess({ count }),
        error: (error) => buildAlbumsFailure({ error }),
      })
    )
  );

  buildArtists$ = createEffect(() =>
    this.actions$.pipe(
      ofType(buildArtists),
      act({
        project: () =>
          this.storage.walk$<Album>('albums', 'artists').pipe(
            filter(({ key }) => !!key.toString().trim()), // Prevent empty strings
            groupBy(
              ({ key }) => key,
              ({ value: album }) => album
            ),
            mergeMap((groups$) =>
              groups$.pipe(
                toArray(),
                map((albums) => ({
                  artist: groups$.key,
                  albums,
                }))
              )
            ),
            map(({ artist, albums }) => {
              const latestAlbum: Album | undefined = albums
                .filter((album) => album.pictureKey)
                .sort((a1, a2) => (a2.year || 0) - (a1.year || 0))[0];

              const lastModified = [...albums].sort(
                (a1, a2) =>
                  a2.lastModified.getTime() - a1.lastModified.getTime()
              )[0].lastModified;

              return {
                hash: hash(artist.toString()),
                name: artist.toString(),
                pictureKey: latestAlbum?.pictureKey,
                lastModified: new Date(lastModified),
              };
            }),
            concatMap((artist) =>
              this.storage.add$('artists', artist).pipe(
                mapTo(buildArtistSuccess({ artist })),
                catchError((error) => of(buildArtistFailure({ error })))
              )
            )
          ),
        complete: (count) => buildArtistsSuccess({ count }),
        error: (error) => buildArtistsFailure({ error }),
      })
    )
  );

  constructor(
    private actions$: Actions,
    private files: FileService,
    private extractor: ExtractorService,
    private storage: DatabaseService,
    private appRef: ApplicationRef,
    private router: Router,
    private snackBar: MatSnackBar,
    private scanner: ScannerFacade,
    private dialog: MatDialog
  ) {}

  ngrxOnRunEffects(
    resolvedEffects$: Observable<EffectNotification>
  ): Observable<EffectNotification> {
    return this.appRef.isStable.pipe(
      first((isStable) => isStable),
      concatMapTo(resolvedEffects$)
    );
  }
}
