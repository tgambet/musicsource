import { Injectable } from '@angular/core';
import {
  act,
  Actions,
  createEffect,
  EffectNotification,
  ofType,
  OnRunEffects,
} from '@ngrx/effects';
import { connect, exhaustMap, merge, mergeMap, Observable, of } from 'rxjs';
import {
  catchError,
  concatMap,
  filter,
  map,
  mapTo,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { FileService } from '@app/scanner/file.service';
import { ExtractorService } from '@app/scanner/extractor.service';
import { Entry, isFile } from '@app/database/entries/entry.model';
import {
  scanEnd,
  extractEntryFailure,
  extractEntrySuccess,
  openDirectory,
  openDirectorySuccess,
  scanEnded,
  scanEntries,
  scanEntriesSuccess,
  scanEntrySuccess,
  scanFailure,
  scanStart,
  scanSuccess,
} from '@app/scanner/store/scanner.actions';
import { Router } from '@angular/router';
import { collectLeft, collectRight } from '@app/core/utils/either.util';
import { Album, getAlbumId } from '@app/database/albums/album.model';
import { Song } from '@app/database/songs/song.model';
import { MatDialog } from '@angular/material/dialog';
import { ScanComponent } from '@app/scanner/scan.component';
import {
  GlobalPositionStrategy,
  NoopScrollStrategy,
  Overlay,
  OverlayRef,
} from '@angular/cdk/overlay';
import { Artist, getArtistId } from '@app/database/artists/artist.model';
import { addEntry } from '@app/database/entries/entry.actions';
import { addSong } from '@app/database/songs/song.actions';
import { upsertAlbum } from '@app/database/albums/album.actions';
import { upsertArtist } from '@app/database/artists/artist.actions';
import { ComponentPortal } from '@angular/cdk/portal';
import { PlayerFacade } from '@app/player/store/player.facade';
import { Store } from '@ngrx/store';
import { selectCoreState } from '@app/scanner/store/scanner.selectors';

// noinspection JSUnusedGlobalSymbols
@Injectable()
export class ScannerEffects2 implements OnRunEffects {
  // https://bugs.chromium.org/p/chromium/issues/detail?id=1146886&q=component%3ABlink%3EStorage%3EFileSystem&can=2
  handle?: any;
  overlayRef?: OverlayRef;
  position?: GlobalPositionStrategy;

  openDirectory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(openDirectory),
      act({
        project: () =>
          this.files
            .open()
            .pipe(map((directory) => openDirectorySuccess({ directory }))),
        error: (error) => scanFailure({ error }),
      })
    )
  );

  openDialog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(openDirectorySuccess),
      concatMap((dir) => {
        this.handle = dir.directory.handle;

        this.position = new GlobalPositionStrategy();

        this.overlayRef = this.overlay.create({
          hasBackdrop: false,
          scrollStrategy: new NoopScrollStrategy(),
          disposeOnNavigation: false,
          positionStrategy: this.position,
          width: '90%',
          maxWidth: '450px',
          panelClass: 'scan-overlay',
        });

        this.position.bottom('24px');
        this.position.left('24px');

        this.overlayRef.attach(new ComponentPortal(ScanComponent));

        return of(scanEntries(dir));
      }),
      tap(() => this.router.navigate(['/library/songs']))
    )
  );

  position$ = createEffect(
    () =>
      this.player.isShown$().pipe(
        tap((isShown) => {
          if (isShown) {
            this.position?.bottom('98px');
            this.position?.apply();
          }
        })
      ),
    { dispatch: false }
  );

  abort$ = createEffect(() =>
    this.actions$.pipe(
      ofType(scanEnd, scanSuccess, scanFailure),
      tap(() => this.overlayRef?.dispose()),
      mapTo(scanEnded())
    )
  );

  scanEntries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(scanEntries),
      act({
        project: ({ directory }) =>
          this.files
            .walk(directory)
            .pipe(
              concatMap((entry: Entry) =>
                isFile(entry)
                  ? of(addEntry({ entry }), scanEntrySuccess({ entry }))
                  : of(addEntry({ entry }))
              )
            ),
        error: (error) => scanFailure({ error }),
        complete: (count) => scanEntriesSuccess({ count }),
      })
    )
  );

  parseEntries$ = createEffect(() =>
    this.actions$.pipe(
      // ofType(extractEntries),
      ofType(scanEntrySuccess),
      map(({ entry }) => entry),
      mergeMap(
        (fileEntry) =>
          this.extractor.extract(fileEntry).pipe(
            connect((m$) =>
              merge(
                m$.pipe(
                  collectRight(),
                  concatMap(({ common: tags, format, lastModified }) => {
                    delete tags.picture; // TODO save pictures

                    let artistsNames = [];
                    if (tags.albumartist) {
                      artistsNames.push(tags.albumartist);
                    }
                    if (tags.artist) {
                      artistsNames.push(tags.artist);
                    }
                    if (tags.artists) {
                      artistsNames.push(...tags.artists);
                    }
                    artistsNames = artistsNames.filter(
                      (value, index, arr) => arr.indexOf(value) === index
                    );
                    const artists: Artist[] = artistsNames.map((name) => ({
                      id: getArtistId(name),
                      name,
                      updatedOn: new Date().getTime(),
                    }));

                    if (artists.length === 0 || tags.album === undefined) {
                      return of(
                        extractEntryFailure({ error: 'missing tags' })
                      ).pipe(tap(() => console.log(fileEntry.path))); // TODO
                    }

                    const album: Album = {
                      id: getAlbumId(artists[0].name, tags.album),
                      title: tags.album,
                      artist: artists[0].name,
                      artistId: artists[0].id,
                      updatedOn: new Date().getTime(),
                      year: tags.year,
                    };

                    const song: Song = {
                      entryPath: fileEntry.path,
                      title: tags.title,
                      artist: artists[0].name,
                      album: album.title,
                      artistId: artists[0].id,
                      albumId: album.id,
                      lastModified,
                      format,
                      updatedOn: new Date().getTime(),
                      duration: format.duration,
                      tags,
                    };

                    return of(
                      extractEntrySuccess({ song }),
                      ...artists.map((artist) => upsertArtist({ artist })),
                      upsertAlbum({ album }),
                      addSong({ song })
                    );
                  }),
                  tap({ error: (err) => console.log(err) }),
                  catchError((error) => of(extractEntryFailure({ error })))
                ),
                m$.pipe(
                  collectLeft(),
                  map((error) => extractEntryFailure({ error }))
                )
              )
            )
          ),
        5
      )
    )
  );

  end$ = createEffect(() =>
    this.store.select(selectCoreState).pipe(
      filter(
        (state) =>
          state.state === 'extracting' &&
          state.extractedCount === state.scannedCount
      ),
      mapTo(scanEnd())
    )
  );

  constructor(
    private actions$: Actions,
    private store: Store,
    private files: FileService,
    private extractor: ExtractorService,
    private router: Router,
    private dialog: MatDialog,
    private overlay: Overlay,
    private player: PlayerFacade
  ) {}

  ngrxOnRunEffects(
    resolvedEffects$: Observable<EffectNotification>
  ): Observable<EffectNotification> {
    return this.actions$.pipe(
      ofType(scanStart),
      exhaustMap(() =>
        resolvedEffects$.pipe(takeUntil(this.actions$.pipe(ofType(scanEnded))))
      )
    );
  }
}
