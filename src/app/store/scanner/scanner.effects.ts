import { ApplicationRef, Injectable } from '@angular/core';
import {
  act,
  Actions,
  createEffect,
  EffectNotification,
  ofType,
  OnRunEffects,
} from '@ngrx/effects';
import { EMPTY, merge, Observable, of, throwError } from 'rxjs';
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
  reduce,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { FileService } from '@app/services/file.service';
import { ExtractorService } from '@app/services/extractor.service';
import { StorageService } from '@app/services/storage.service';
import { Entry, isFile } from '@app/models/entry.model';
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
} from '@app/store/scanner/scanner.actions';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ScannerFacade } from '@app/store/scanner/scanner.facade';
import { collectLeft, collectRight } from '@app/utils/either.util';
import { Album } from '@app/models/album.model';
import { SetRequired } from '@app/utils/types.util';
import { Song } from '@app/models/song.model';
import { hash } from '@app/utils/hash.util';

@Injectable()
export class ScannerEffects implements OnRunEffects {
  step1$ = createEffect(() =>
    this.actions$.pipe(
      ofType(openDirectorySuccess),
      tap(async () => {
        await this.router.navigate([{ outlets: { dialog: ['scan'] } }], {
          skipLocationChange: true,
        });
      }),
      map((dir) => scanEntries(dir))
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
      mapTo(scanSuccess())
    )
  );

  onAbort$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(scanAborted),
        tap(() => this.router.navigate([{ outlets: { dialog: null } }])),
        tap(() => this.snackBar.open(`Scan aborted`, '', { duration: 2000 }))
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
            takeUntil(this.actions$.pipe(ofType(abortScan)))
          ),
        error: (error) => scanEntriesFailure({ error }),
        complete: (count) => scanEntriesSuccess({ count }),
      })
    )
  );

  parseEntries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(extractEntries),
      act({
        project: () =>
          this.storage.open$(['entries']).pipe(
            concatMap((transaction) =>
              this.storage.walk$<Entry>(transaction, 'entries')
            ),
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
                concatMapTo(throwError('aborted'))
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
          this.storage.open$(['songs']).pipe(
            concatMap((transaction) =>
              this.storage
                .walk$<SetRequired<Song, 'album'>>(
                  transaction,
                  'songs',
                  'album'
                )
                .pipe(
                  filter(({ key }) => !!key.toString().trim()), // Prevent empty strings
                  groupBy(
                    ({ value: song }) => song.album,
                    ({ value: song }) => song
                  ),
                  mergeMap((groups$) =>
                    groups$.pipe(
                      reduce((acc, cur) => [...acc, cur], [] as Song[]),
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

                    return {
                      id: hash(album),
                      name: album,
                      albumArtist:
                        songs.find((song) => song.albumartist)?.albumartist ||
                        artists.length === 1
                          ? artists[0]
                          : undefined,
                      artists,
                      year: songs[0].year,
                      pictureKey: songs.find((song) => song.pictureKey)
                        ?.pictureKey,
                      addedOn: Date.now(),
                    };
                  })
                )
            ),
            concatMap((album) =>
              this.storage.add$('albums', album).pipe(
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
          this.storage.open$(['albums']).pipe(
            concatMap((transaction) =>
              this.storage.walk$<Album>(transaction, 'albums', 'artists').pipe(
                filter(({ key }) => !!key.toString().trim()), // Prevent empty strings
                groupBy(
                  ({ key }) => key,
                  ({ value: album }) => album
                ),
                mergeMap((groups$) =>
                  groups$.pipe(
                    reduce((acc, cur) => [...acc, cur], [] as Album[]),
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
                  return {
                    hash: hash(artist.toString()),
                    name: artist.toString(),
                    pictureKey: latestAlbum?.pictureKey,
                    addedOn: new Date(), // TODO use latest albums addedOn
                  };
                })
              )
            ),
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
    private storage: StorageService,
    private appRef: ApplicationRef,
    private router: Router,
    private snackBar: MatSnackBar,
    private scanner: ScannerFacade
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
