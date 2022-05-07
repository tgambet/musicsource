import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  defer,
  EMPTY,
  exhaustMap,
  finalize,
  last,
  mergeMap,
  MonoTypeOperatorFunction,
  Observable,
  of,
  Subscription,
  takeUntil,
} from 'rxjs';
import { catchError, concatMap, filter, mergeAll, tap } from 'rxjs/operators';
import { FileService } from '@app/scanner/file.service';
import { ExtractorService } from '@app/scanner/extractor.service';
import { FileEntry } from '@app/database/entries/entry.model';
import { openDirectory, scanEnd } from '@app/scanner/store/scanner.actions';
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

  openDirectory$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(openDirectory),
        exhaustMap(({ directory: dirOpt }) =>
          this.database.db$.pipe(
            tap(() => (this.subscription = new Subscription())),
            tap(() =>
              this.subscription.add(this.extractor.workers.subscribe())
            ),
            tap(() => this.subscription.add(this.resizer.workers.subscribe())),
            concatMap(() =>
              dirOpt
                ? of(dirOpt)
                : this.files
                    .openDirectory()
                    .pipe(
                      concatTap((directory) =>
                        this.settings.setRootDirectory(directory)
                      )
                    )
            ),
            tap(() => this.openScanDialog()),
            tap(() => this.scanner.start()),
            tap(() => localStorage.setItem('scanned', '1')),
            tap(() => this.router.navigate(['/library/albums'])),
            tap(() =>
              window.addEventListener('beforeunload', this.unloadListener)
            ),
            // TODO save directory for future sync
            concatMap((directory) =>
              this.files.iterate(directory).pipe(
                logDuration('iterate'),
                concatTap((entry) => this.entries.put(entry)),
                filter(
                  (entry): entry is FileEntry =>
                    entry.kind === 'file' && isAudio(entry)
                ),
                mergeMap((entry) =>
                  this.extractor.extract(entry).pipe(
                    tapError((err) => console.error(entry.path, err)),
                    catchError(() => EMPTY)
                  )
                ),
                logDuration('extract'),
                tap(({ song }) =>
                  this.scanner.setLabel(
                    `${song.artists[0]?.name} - ${song.title}`
                  )
                ),
                mergeMap(({ song, album, artists, pictures }) => [
                  ...pictures.map((picture) => this.pictures.put(picture)),
                  ...artists.map((artist) => this.artists.put(artist)),
                  this.albums.put(album),
                  this.songs.put(song),
                ]),
                mergeAll(),
                logDuration('save')
              )
            ),
            takeUntil(this.actions$.pipe(ofType(scanEnd))),
            tapError((err) => console.error(err.message, err)),
            catchError(() => of(void 0)),
            last(),
            tap(() => this.overlayRef?.dispose()),
            tap(() =>
              window.removeEventListener('beforeunload', this.unloadListener)
            ),
            tap(() => this.subscription.unsubscribe())
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
    private settings: SettingsFacade
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

  unloadListener(e: BeforeUnloadEvent): void {
    e.preventDefault();
    e.returnValue = '';
  }
}
