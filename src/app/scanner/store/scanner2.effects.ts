import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  concat,
  defer,
  EMPTY,
  exhaustMap,
  finalize,
  from,
  mergeMap,
  MonoTypeOperatorFunction,
  Observable,
  of,
  OperatorFunction,
  Subscription,
  takeUntil,
} from 'rxjs';
import {
  catchError,
  concatMap,
  filter,
  first,
  map,
  mergeAll,
  switchMap,
  tap,
} from 'rxjs/operators';
import { FileService } from '@app/scanner/file.service';
import { ExtractorService } from '@app/scanner/extractor.service';
import {
  DirectoryEntry,
  Entry,
  EntryId,
  FileEntry,
  requestPermission,
} from '@app/database/entries/entry.model';
import {
  openDirectory,
  quickSync,
  scanEnd,
} from '@app/scanner/store/scanner.actions';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ScanComponent } from '@app/scanner/scan.component';
import {
  GlobalPositionStrategy,
  NoopScrollStrategy,
  Overlay,
  OverlayRef,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { PlayerFacade } from '@app/player/store/player.facade';
import { DatabaseService } from '@app/database/database.service';
import { concatTap, tapError } from '@app/core/utils';
import { EntryFacade } from '@app/database/entries/entry.facade';
import { SongFacade } from '@app/database/songs/song.facade';
import { AlbumFacade } from '@app/database/albums/album.facade';
import { ArtistFacade } from '@app/database/artists/artist.facade';
import { ScannerFacade } from '@app/scanner/store/scanner.facade';
import { PictureFacade } from '@app/database/pictures/picture.facade';
import { ResizerService } from '@app/scanner/resizer.service';
import { SettingsFacade } from '@app/database/settings/settings.facade';
import { removeFromArray } from '@app/core/utils/removeFromArray.util';
import { ReactiveIDBTransaction } from '@creasource/reactive-idb';
import { loadAlbums } from '@app/database/albums/album.actions';
import { loadArtists } from '@app/database/artists/artist.actions';
import { loadEntries } from '@app/database/entries/entry.actions';
import { loadPlaylists } from '@app/database/playlists/playlist.actions';
import { loadSongs } from '@app/database/songs/song.actions';
import { loadPictures } from '@app/database/pictures/picture.actions';
import { Store } from '@ngrx/store';

const extensionIn = (extensions: string[]) => (file: FileEntry) =>
  extensions.some((ext) => file.name.endsWith(`.${ext}`));

// const isImage = extensionIn(['jpeg', 'jpg', 'png', 'webp', 'bmp']);

const isAudio = extensionIn(['mp3', 'flac', 'ogg', 'm4a', 'wav', 'wma']);

const logDuration =
  <T>(log: string): MonoTypeOperatorFunction<T> =>
  (obs: Observable<T>) =>
    defer(() => of(Date.now())).pipe(
      concatMap((start) =>
        obs.pipe(finalize(() => console.log(log, (Date.now() - start) / 1000)))
      )
    );

// noinspection JSUnusedGlobalSymbols
@Injectable()
export class ScannerEffects2 /*implements OnRunEffects*/ {
  overlayRef?: OverlayRef;
  position?: GlobalPositionStrategy;

  subscription = new Subscription();

  scan$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(openDirectory),
        exhaustMap(({ directory: dirOpt }) =>
          this.database.db$.pipe(
            concatMap(() =>
              dirOpt
                ? of(dirOpt).pipe(
                    concatTap((dir) => requestPermission(dir.handle))
                  )
                : this.files
                    .openDirectory()
                    .pipe(
                      concatTap((directory) =>
                        this.settings.setRootDirectory(directory)
                      )
                    )
            ),
            tap(() => this.router.navigateByUrl('/library')),
            this.beforeScan(),
            concatMap((directory) => this.files.iterate(directory)),
            logDuration('iterate'),
            this.extractAndSave,
            logDuration('extract'),
            this.afterScan
          )
        )
      ),
    { dispatch: false }
  );

  sync$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(quickSync),
        exhaustMap(() =>
          of(1).pipe(
            this.beforeScan(),
            concatMap(() => concat(this.syncDeleted(), this.syncAdded())),
            this.afterScan,
            finalize(() => {
              this.store.dispatch(loadAlbums());
              this.store.dispatch(loadArtists());
              this.store.dispatch(loadEntries());
              this.store.dispatch(loadPlaylists());
              this.store.dispatch(loadSongs());
              this.store.dispatch(loadPictures());
            })
          )
        )
      ),
    { dispatch: false }
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

  constructor(
    private actions$: Actions,
    private files: FileService,
    private scanner: ScannerFacade,
    private extractor: ExtractorService,
    private resizer: ResizerService,
    private router: Router,
    private dialog: MatDialog,
    private overlay: Overlay,
    private player: PlayerFacade,
    private entries: EntryFacade,
    private songs: SongFacade,
    private albums: AlbumFacade,
    private artists: ArtistFacade,
    private pictures: PictureFacade,
    private database: DatabaseService,
    private settings: SettingsFacade,
    private store: Store
  ) {}

  openScanDialog(): void {
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
  }

  syncAdded = () =>
    this.settings.getRootDirectory().pipe(
      filter((dir): dir is DirectoryEntry => !!dir),
      concatTap((dir) => requestPermission(dir.handle)),
      concatMap((directory) => this.files.iterate(directory)),
      mergeMap((entry) =>
        this.entries.exists(entry.id).pipe(map((exists) => ({ exists, entry })))
      ),
      filter(({ exists }) => !exists),
      map(({ entry }) => entry),
      this.extractAndSave,
      logDuration('added')
    );

  syncDeleted = () =>
    this.settings.getRootDirectory().pipe(
      filter((dir): dir is DirectoryEntry => !!dir),
      concatTap((dir) => requestPermission(dir.handle)),
      switchMap(() =>
        this.database.walk$<Entry>('entries').pipe(
          concatMap((r) =>
            r.value.kind === 'file'
              ? from(r.value.handle.getFile()).pipe(
                  map(() => undefined),
                  catchError(() => of(r.key)),
                  filter((key): key is IDBValidKey => !!key)
                )
              : from(r.value.handle.keys()).pipe(
                  first(),
                  map(() => undefined),
                  catchError(() => of(r.key)),
                  filter((key): key is IDBValidKey => !!key)
                )
          ),
          concatTap((entryKey) => this.database.delete$('entries', entryKey)),
          concatMap((entryKey) =>
            this.database.db$.pipe(
              concatMap((db) =>
                db.transaction$(
                  ['pictures', 'songs', 'albums', 'artists'],
                  'readwrite'
                )
              ),
              concatMap((transaction) =>
                ['pictures', 'songs', 'albums', 'artists'].map((storeName) =>
                  this.updateEntries(
                    entryKey as EntryId,
                    storeName
                  )(transaction)
                )
              )
            )
          ),
          mergeAll()
        )
      ),
      logDuration('deleted')
    );

  updateEntries =
    <T extends { entries: EntryId[] }>(entryKey: EntryId, storeName: string) =>
    (transaction: ReactiveIDBTransaction) =>
      transaction.objectStore$<T>(storeName).pipe(
        concatMap((store) =>
          store
            .index('entries')
            .getAllKeys$(entryKey)
            .pipe(
              concatMap((pictKeys) =>
                pictKeys.map((key) =>
                  store.get$(key).pipe(
                    filter((t): t is T => !!t),
                    map((t) => ({
                      ...t,
                      entries: removeFromArray(t.entries, entryKey as EntryId),
                    })),
                    concatMap((updated) =>
                      updated.entries.length === 0
                        ? store.delete$(key)
                        : store.put$(updated)
                    )
                  )
                )
              ),
              mergeAll()
            )
        )
      );

  extractAndSave: OperatorFunction<Entry, IDBValidKey> = (obs) =>
    obs.pipe(
      concatTap((entry) => this.entries.put(entry)),
      filter(
        (entry): entry is FileEntry => entry.kind === 'file' && isAudio(entry)
      ),
      mergeMap((entry) =>
        this.extractor.extract(entry).pipe(
          tapError((err) => console.warn(entry.path, err)),
          catchError(() => EMPTY)
        )
      ),
      tap(({ song }) =>
        this.scanner.setLabel(`${song.artists[0]?.name} - ${song.title}`)
      ),
      mergeMap(({ song, album, artists, pictures }) => [
        ...pictures.map((picture) => this.pictures.put(picture)),
        ...artists.map((artist) => this.artists.put(artist)),
        this.albums.put(album),
        this.songs.put(song),
      ]),
      mergeAll()
    );

  beforeScan = <T>() =>
    tap<T>(() => {
      this.subscription.unsubscribe();
      this.subscription = new Subscription();
      this.subscription.add(this.extractor.workers.subscribe());
      this.subscription.add(this.resizer.workers.subscribe());
      this.openScanDialog();
      this.scanner.start();
      localStorage.setItem('scanned', '1');
      window.addEventListener('beforeunload', this.unloadListener);
    });

  afterScan: OperatorFunction<any, any> = (obs) =>
    obs.pipe(
      takeUntil(this.actions$.pipe(ofType(scanEnd))),
      tapError((err) => console.error(err.message, err)),
      catchError(() => EMPTY),
      finalize(() => {
        this.overlayRef?.dispose();
        window.removeEventListener('beforeunload', this.unloadListener);
        this.subscription.unsubscribe();
      })
    );

  unloadListener(e: BeforeUnloadEvent): void {
    e.preventDefault();
    e.returnValue = '';
  }
}
