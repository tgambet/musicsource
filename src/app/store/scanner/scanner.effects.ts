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
  filter,
  first,
  map,
  mapTo,
  publish,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { FileService } from '@app/services/file.service';
import { ExtractorService } from '@app/services/extractor.service';
import { StorageService } from '@app/services/storage.service';
import { Entry, isFile } from '@app/utils/entry.util';
import {
  abortScan,
  buildAlbums,
  buildAlbumsFailure,
  buildAlbumsSuccess,
  buildArtists,
  buildArtistsFailure,
  buildArtistsSuccess,
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
    this.actions$.pipe(ofType(scanEntriesSuccess), mapTo(extractEntries()))
  );
  step3$ = createEffect(() =>
    this.actions$.pipe(ofType(extractEntriesSuccess), mapTo(buildAlbums()))
  );
  step4$ = createEffect(() =>
    this.actions$.pipe(ofType(buildAlbumsSuccess), mapTo(buildArtists()))
  );
  step5$ = createEffect(() =>
    this.actions$.pipe(ofType(buildArtistsSuccess), mapTo(scanSuccess()))
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
          this.files.open().pipe(
            concatMap((directory) =>
              /*this.library
                  .getRootEntry(directory.path)
                  .pipe(
                    concatMap((same) =>
                      same
                        ? throwError(
                            'A folder with that name already exists: ' +
                              directory.name
                          )
                        :*/
              this.storage
                .put$('entries_root', directory)
                .pipe(mapTo(openDirectorySuccess({ directory })))
            )
          ),
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
                catchError((error) => of(scanEntryFailure()))
              )
            ),
            takeUntil(this.actions$.pipe(ofType(abortScan)))
          ),
        error: (error) => scanEntriesFailure(),
        complete: (count, { directory }) => scanEntriesSuccess(),
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
        project: (input) => of(buildAlbumsSuccess()),
        error: (error) => buildAlbumsFailure(),
      })
    )
  );

  buildArtists$ = createEffect(() =>
    this.actions$.pipe(
      ofType(buildArtists),
      act({
        project: (input) => of(buildArtistsSuccess()),
        error: (error) => buildArtistsFailure(),
      })
    )
  );

  // saveEntries$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(scannedEntry),
  //     concatMap(({ entry }) =>
  //       this.storageService
  //         .add$('entries', entry)
  //         .pipe(mapTo(savedEntry({ entry })))
  //     )
  //   )
  // );

  // saveParsedEntries = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(parseEntriesSucceeded),
  //     act({
  //       project: () =>
  //         this.scanner.parsedEntries$.pipe(
  //           first(),
  //           concatMap((e) => from(e)),
  //           concatMap(({ song, pictures }) =>
  //             this.storageService
  //               .open$(['pictures', 'songs'], 'readwrite')
  //               .pipe(
  //                 concatMap((transaction) => {
  //                   const makeSong = (key?: IDBValidKey): Song => ({
  //                     ...song,
  //                     pictureKey: key,
  //                   });
  //
  //                   const saveSongEvent = (key?: IDBValidKey): Action =>
  //                     savedSong({ song: makeSong(key) });
  //
  //                   const saveSong = (pictureKey?: IDBValidKey) =>
  //                     this.storageService
  //                       .exec$(
  //                         transaction
  //                           .objectStore('songs')
  //                           .put(makeSong(pictureKey))
  //                       )
  //                       .pipe(mapTo(saveSongEvent(pictureKey)));
  //
  //                   if (!pictures || pictures.length === 0) {
  //                     return saveSong();
  //                   }
  //
  //                   return this.storageService
  //                     .exec$<IDBValidKey | undefined>(
  //                       transaction
  //                         .objectStore('pictures')
  //                         .index('data')
  //                         .getKey(pictures[0].data)
  //                     )
  //                     .pipe(
  //                       concatMap((key) =>
  //                         key
  //                           ? saveSong(key)
  //                           : this.storageService
  //                               .exec$(
  //                                 transaction
  //                                   .objectStore('pictures')
  //                                   .put(pictures[0])
  //                               )
  //                               .pipe(concatMap((pictKey) => saveSong(pictKey)))
  //                       )
  //                     );
  //                 })
  //               )
  //           )
  //         ),
  //       complete: (count) => saveParsedEntriesSuccess({ count }),
  //       error: (error) => saveParsedEntriesFailure({ error }),
  //     })
  //   )
  // );

  // extractAlbums$ = createEffect(
  //   () =>
  //     this.actions$.pipe(
  //       ofType(saveParsedEntriesSuccess),
  //       concatMap(() =>
  //         this.library.songs$.pipe(
  //           filter((s) => !!s),
  //           first(),
  //           map((songs) =>
  //             songs
  //               .map((song) =>
  //                 [song.artist, ...(song.artists || []), song.albumartist]
  //                   .map((a) => a?.trim())
  //                   .filter((a) => !!a)
  //                   .filter((a, i, arr) => arr.indexOf(a) === i)
  //                   .map((artist) => ({
  //                     artist,
  //                     song: song.entryPath,
  //                   }))
  //               )
  //               .reduce((acc, curr) => [...acc, ...curr])
  //           ),
  //           concatMap((r) =>
  //             this.storageService.execute<IDBValidKey>(
  //               ['artist_song'],
  //               'readwrite',
  //               ...r.map((v) => this.storageService.put('artist_song', v))
  //             )
  //           ),
  //           concatMapTo(this.storageService.open(['artist_song'])),
  //           concatMap((t) =>
  //             this.storageService.exec(
  //               t
  //                 .objectStore('artist_song')
  //                 .index('artist')
  //                 .getAll('Linkin Park')
  //             )
  //           ),
  //           tap((r) => console.log(r))
  //         )
  //       )
  //     ),
  //   { dispatch: false }
  // );

  // saveSongs$ = createEffect(
  //   () =>
  //     this.actions$.pipe(
  //       ofType(parseEntrySucceeded),
  //       concatMap(({ song, pictures }) => {
  //         const action$ =
  //           pictures && pictures.length > 0
  //             ? this.storageService.getDb().pipe(
  //                 this.storageService.openTransaction(
  //                   ['pictures', 'songs'],
  //                   'readwrite'
  //                 ),
  //                 concatMap((transaction) =>
  //                   this.storageService
  //                     .findOne<Picture>(
  //                       transaction,
  //                       'pictures',
  //                       (picture) => picture.data === pictures[0].data
  //                     )
  //                     .pipe(
  //                       concatMap((picture) => {
  //                         const saveSong = (key: IDBValidKey) =>
  //                           this.storageService.wrap((trans) =>
  //                             trans.objectStore('songs').add({
  //                               ...song,
  //                               pictureKey: key,
  //                             })
  //                           )(transaction);
  //
  //                         if (!picture) {
  //                           return this.storageService
  //                             .wrap((trans) =>
  //                               trans.objectStore('pictures').add(pictures[0])
  //                             )(transaction)
  //                             .pipe(concatMap((key) => saveSong(key)));
  //                         }
  //                         return saveSong(picture.key);
  //                       })
  //                     )
  //                 )
  //               )
  //             : this.storageService.addOne('songs', song);
  //         return action$.pipe(
  //           tapError((err) => console.log(err)),
  //           catchError(() => EMPTY)
  //         );
  //       })
  //     ),
  //   { dispatch: false }
  // );

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
