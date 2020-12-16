import { ApplicationRef, Injectable } from '@angular/core';
import {
  act,
  Actions,
  createEffect,
  EffectNotification,
  ofType,
  OnRunEffects,
} from '@ngrx/effects';
import { concat, EMPTY, Observable, of, throwError } from 'rxjs';
import {
  catchError,
  concatMap,
  concatMapTo,
  first,
  map,
  mergeMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { FileService } from '@app/services/file.service';
import { ExtractorService } from '@app/services/extractor.service';
import { ResizerService } from '@app/services/resizer.service';
import { StorageService } from '@app/services/storage.service';
import { Entry, isFile } from '@app/utils/entry.util';
import {
  abortScan,
  openDirectory,
  openDirectoryFailure,
  parseEntriesFailed,
  parseEntriesSucceeded,
  parseEntryFailed,
  parseEntrySucceeded,
  scanAborted,
  scanDirectory,
  scanFailed,
  scannedFile,
  scanSucceeded,
  startParsing,
} from '@app/store/scanner/scanner.actions';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LibraryFacade } from '@app/store/library/library.facade';

@Injectable()
export class ScannerEffects implements OnRunEffects {
  openDirectory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(openDirectory),
      act({
        project: () =>
          this.fileService
            .open()
            .pipe(map((directory) => scanDirectory({ directory }))),
        error: (error) => openDirectoryFailure({ error }),
      })
    )
  );

  scanDirectory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(scanDirectory),
      tap(() =>
        this.router.navigate([{ outlets: { dialog: ['scan'] } }], {
          skipLocationChange: true,
        })
      ),
      act({
        project: ({ directory }) =>
          this.library.findDirectory(directory).pipe(
            first(),
            concatMap((same) =>
              same
                ? throwError(new Error('Exists already: ' + directory.name))
                : this.fileService.walk(directory)
            ),
            takeUntil(this.actions$.pipe(ofType(abortScan))),
            map((entry: Entry) => scannedFile({ entry }))
          ),
        error: (error) => scanFailed({ error }),
        complete: (count, { directory }) => scanSucceeded({ count, directory }),
        operator: (project) => mergeMap(project),
      })
    )
  );

  saveEntries$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(scannedFile),
        concatMap(({ entry }) =>
          this.storageService
            .addOne('entries', entry)
            .pipe(catchError(() => EMPTY))
        )
      ),
    { dispatch: false }
  );

  parseEntries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(scanSucceeded),
      act({
        project: ({ directory }) =>
          concat(
            of(startParsing()),
            this.library.getChildrenEntries(directory).pipe(
              first(),
              concatMap((entries) => of(...entries.filter(isFile))),
              concatMap((entry) => this.extractorService.extract(entry)),
              map((either) =>
                either.tag === 'left'
                  ? parseEntryFailed(either.error)
                  : parseEntrySucceeded({ result: either.result })
              ),
              takeUntil(
                this.actions$.pipe(
                  ofType(abortScan),
                  concatMapTo(throwError('aborted'))
                )
              )
            )
          ),
        complete: (count) => parseEntriesSucceeded({ count }),
        error: (error) =>
          error === 'aborted' ? scanAborted() : parseEntriesFailed({ error }),
      })
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

  //
  // parseEntries$: Observable<Action> = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(parseEntries),
  //     act({
  //       project: (action) =>
  //         concat(
  //           ...action.entries
  //             .filter(isFile)
  //             .map((entry) => this.extractorService.extract(entry))
  //         ).pipe(
  //           publish((m$) => {
  //             const cm$ = m$.pipe(
  //               takeUntil(
  //                 this.actions$.pipe(
  //                   ofType(abortScan),
  //                   take(1),
  //                   concatMapTo(throwError('aborted')) // Cancels all merged observables below
  //                 )
  //               )
  //             );
  //             return merge(
  //               cm$.pipe(
  //                 collectLeft(),
  //                 map((error) => parseEntryFailed({ error }))
  //               ),
  //               cm$.pipe(
  //                 collectRight(),
  //                 map((result) => parseEntrySucceeded({ result }))
  //               ),
  //               2
  //             );
  //           })
  //         ),
  //       complete: (count) => parseEntriesSucceeded({ count }),
  //       error: (error) => {
  //         if (error === 'aborted') {
  //           return scanAborted({ snack: true });
  //         }
  //         return parseEntriesFailed({ error });
  //       },
  //     })
  //   )
  // );
  //
  // build$: Observable<Action> = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(parseEntrySucceeded),
  //     concatMap(({ result }) => {
  //       const songId = hash(
  //         `${result.albumArtist}|${result.album}|${result.title}`
  //       );
  //       const albumId = hash(`${result.albumArtist}|${result.album}`);
  //       const artistId = hash(result.albumArtist || '');
  //
  //       const song: Song = {
  //         id: songId,
  //         albumId,
  //         entry: result.entry,
  //         trackNumber: result.trackNumber,
  //         name: result.title,
  //         artist: result.artist,
  //         artistId,
  //         albumArtist: result.albumArtist,
  //         album: result.album,
  //         genre: result.genre,
  //         duration: result.duration,
  //       };
  //
  //       const album: Album = {
  //         id: albumId,
  //         name: result.album,
  //         artist: result.albumArtist,
  //         year: result.year,
  //         artistId,
  //       };
  //
  //       const artist: Artist = {
  //         id: artistId,
  //         name: result.albumArtist,
  //       };
  //
  //       return concat(
  //         of(addSong({ song }), addAlbum({ album }), addArtist({ artist })),
  //         this.store.select(selectCoverById, albumId).pipe(
  //           take(1),
  //           concatMap((cover) =>
  //             !cover && result.picture
  //               ? of(extractCover({ id: albumId, picture: result.picture }))
  //               : EMPTY
  //           )
  //         )
  //       );
  //     }),
  //     catchError(() => EMPTY) // DO Nothing
  //   )
  // );

  // extractCover$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(extractCover),
  //     act({
  //       project: ({ id, picture }) =>
  //         this.resizerService
  //           .resizeSquare(`data:${picture?.format};base64,${picture?.base64}`, [
  //             800,
  //             264,
  //             226,
  //             160,
  //             32,
  //           ])
  //           .pipe(
  //             map(([x800, x264, x226, x160, x32]) => {
  //               const cover: Cover = {
  //                 id,
  //                 images: [
  //                   { width: 800, height: 800, dataUrl: x800 },
  //                   { width: 264, height: 264, dataUrl: x264 },
  //                   { width: 226, height: 226, dataUrl: x226 },
  //                   { width: 160, height: 160, dataUrl: x160 },
  //                   { width: 32, height: 32, dataUrl: x32 },
  //                 ],
  //               };
  //               return addCover({ cover });
  //             })
  //           ),
  //       error: (error) => extractCoverFailed({ error }), // TODO Not used in effects nor reducer
  //     })
  //   )
  // );

  // saveSongs$ = createEffect(
  //   () =>
  //     this.appRef.isStable.pipe(
  //       first((stable) => stable),
  //       concatMapTo(
  //         this.actions$.pipe(
  //           ofType(addSong),
  //           bufferTime(1000),
  //           filter((buff) => buff.length > 0),
  //           concatMap((actions) =>
  //             this.storageService.execute(
  //               ['songs'],
  //               'readwrite',
  //               ...actions.map((action) =>
  //                 this.storageService.put('songs', action.song, action.song.id)
  //               )
  //             )
  //           ),
  //           catchError(() => EMPTY)
  //         )
  //       )
  //     ),
  //   { dispatch: false }
  // );

  // saveAlbums$ = createEffect(
  //   () =>
  //     this.actions$.pipe(
  //       ofType(addAlbum),
  //       bufferTime(1000),
  //       filter((buff) => buff.length > 0),
  //       concatMap((actions) =>
  //         this.storageService.execute(
  //           ['albums'],
  //           'readwrite',
  //           ...actions.map((action) =>
  //             this.storageService.put('albums', action.album, action.album.id)
  //           )
  //         )
  //       ),
  //       catchError(() => EMPTY)
  //     ),
  //   { dispatch: false }
  // );
  //
  // saveArtists$ = createEffect(
  //   () =>
  //     this.actions$.pipe(
  //       ofType(addArtist),
  //       bufferTime(1000),
  //       filter((buff) => buff.length > 0),
  //       concatMap((actions) =>
  //         this.storageService.execute(
  //           ['artists'],
  //           'readwrite',
  //           ...actions.map((action) =>
  //             this.storageService.put(
  //               'artists',
  //               action.artist,
  //               action.artist.id
  //             )
  //           )
  //         )
  //       ),
  //       catchError(() => EMPTY)
  //     ),
  //   { dispatch: false }
  // );
  //
  // saveCovers$ = createEffect(
  //   () =>
  //     this.actions$.pipe(
  //       ofType(addCover),
  //       bufferTime(1000),
  //       filter((buff) => buff.length > 0),
  //       concatMap((actions) =>
  //         this.storageService.execute(
  //           ['covers'],
  //           'readwrite',
  //           ...actions.map((action) =>
  //             this.storageService.put('covers', action.cover, action.cover.id)
  //           )
  //         )
  //       ),
  //       catchError(() => EMPTY)
  //     ),
  //   { dispatch: false }
  // );

  /*saveToDB$: Observable<Action> = createEffect(() => this.actions$.pipe(
    ofType(parseEntriesSucceeded),
    concatMap(({songs, albums, artists}) => merge(
      of(scanLog({message: `Extraction successful:`, persist: true})),
      of(scanLog({message: `    Found <b>${songs.length}</b> supported audio files.`, persist: true})),
      of(scanLog({message: `    Found <b>${albums.length}</b> album(s).`, persist: true})),
      of(scanLog({message: `    Found <b>${artists.length}</b> artist(s).`, persist: true})),
      of(scanLog({message: `Saving to database...`})),
      this.storageService.execute(
        ['songs', 'albums', 'artists'],
        'readwrite',
        ...songs.map(song => this.storageService.put('songs', song, song.id)),
        ...albums.map(album => this.storageService.put('albums', album, album.id)),
        ...artists.map(artist => this.storageService.put('artists', artist, artist.id)),
      ).pipe(
        last(),
        map(() => scanLog({message: 'Successfully saved to database.', persist: true}))
      )
    )),
    catchError(err => of(scanLog({message: err.message, persist: true, error: true})))
  ));*/

  /*@Effect({dispatch: false})
  saveSongs$: Observable<any> = this.actions$.pipe(
    ofType(parseFileEntrySucceeded),
    bufferTime(100), // DO NOT USE BUFFER TIME
    filter(actions => actions.length > 0),
    tap(a => console.log(a.length)),
    concatMap(actions => this.storageService.execute(
      ['songs'],
      'readwrite',
      ...actions.map(a => this.storageService.put('songs', a.song, a.song.entry.path))
    ).pipe(
      catchError(err => { console.error(err); return EMPTY; })
    )),
  );*/

  /*  play$: Observable<any> = createEffect(() => this.actions$.pipe(
      ofType(parseFileEntry),
      skip(2),
      take(1),
      concatMap(action => action.entry.getFile()),
      // concatMap(file => this.audioServer.play(file)),
      tap(() => console.log('loading')),
      concatMap(file => this.audioServer.play(file)),
      tap(() => console.log('loaded')),
    ), {dispatch: false});*/

  constructor(
    private actions$: Actions,
    private fileService: FileService,
    private extractorService: ExtractorService,
    private resizerService: ResizerService,
    private storageService: StorageService,
    private appRef: ApplicationRef,
    private router: Router,
    private snackBar: MatSnackBar,
    private library: LibraryFacade
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
