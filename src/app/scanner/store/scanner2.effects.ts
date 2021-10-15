import { Injectable } from '@angular/core';
import {
  act,
  Actions,
  createEffect,
  EffectNotification,
  ofType,
  OnRunEffects,
} from '@ngrx/effects';
import { endWith, exhaustMap, from, mergeMap, Observable, of } from 'rxjs';
import {
  catchError,
  concatMap,
  filter,
  first,
  map,
  mapTo,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { FileService } from '@app/scanner/file.service';
import { ExtractorService } from '@app/scanner/extractor.service';
import { Entry, isFile } from '@app/database/entries/entry.model';
import {
  addOrUpdatePicture,
  extractEntryFailure,
  extractEntrySuccess,
  extractImageEntry,
  extractMetaEntry,
  extractSongEntry,
  openDirectory,
  openDirectorySuccess,
  scanEnd,
  scanEnded,
  scanEntries,
  scanEntriesFailure,
  scanEntriesSuccess,
  scanEntry,
  scanFailure,
  scanStart,
  scanSuccess,
} from '@app/scanner/store/scanner.actions';
import { Router } from '@angular/router';
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
import { Action, Store } from '@ngrx/store';
import { selectCoreState } from '@app/scanner/store/scanner.selectors';
import { getPictureId, Picture } from '@app/database/pictures/picture.model';
import { arrayBufferToBase64 } from '@app/core/utils/array-buffer-to-base64.util';
import {
  addPicture,
  updatePicture,
} from '@app/database/pictures/picture.actions';
import { ResizerService } from '@app/scanner/resizer.service';
import { PictureFacade } from '@app/database/pictures/picture.facade';
import { IdUpdate } from '@app/core/utils';

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
      ofType(scanEnd, scanSuccess, scanFailure), // TODO don't close on failure
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
            .pipe(map((entry: Entry) => scanEntry({ entry }))),
        error: (error) => scanEntriesFailure({ error }),
        complete: (count) => scanEntriesSuccess({ count }),
      })
    )
  );

  addEntries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(scanEntry),
      map(({ entry }) => addEntry({ entry }))
    )
  );

  extractEntries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(scanEntry),
      map(({ entry }) => {
        if (!isFile(entry)) {
          return extractEntryFailure({ error: 'directory' });
        }
        if (
          ['.jpeg', '.jpg', '.png', '.webp'].some((ext) =>
            entry.name.endsWith(ext)
          )
        ) {
          return extractImageEntry({ entry });
        }
        if (entry.name.endsWith('.nfo')) {
          return extractMetaEntry({ entry });
        }
        return extractSongEntry({ entry });
      })
    )
  );

  extractImage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(extractImageEntry),
      map(({ entry }) => entry),
      mergeMap(
        (entry) =>
          from(entry.handle.getFile()).pipe(
            concatMap((file) =>
              from(file.arrayBuffer()).pipe(
                map((buffer) => {
                  const base64 = arrayBufferToBase64(buffer);
                  const src = `data:${file.type};base64,${base64}`;
                  const id = getPictureId(src);
                  return addOrUpdatePicture({
                    id,
                    src,
                    name: file.name,
                    entry,
                  });
                }),
                endWith(extractEntrySuccess({ label: file.name }))
              )
            ),
            catchError((error) => of(extractEntryFailure({ error })))
          ),
        1 // TODO
      )
    )
  );

  addOrUpdatePicture$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addOrUpdatePicture),
      concatMap(({ id, src, name, entry }) =>
        this.pictures.getByKey(id).pipe(
          first(),
          map((stored) => {
            if (!stored) {
              const picture: Picture = {
                id,
                name,
                src,
                entries: [entry.path],
              };
              return addPicture({ picture });
            } else {
              const update: IdUpdate<Picture> = {
                key: id,
                changes: {
                  entries: [...stored.entries, entry.path],
                },
              };
              return updatePicture({ update });
            }
          })
        )
      )
    )
  );

  extractMeta$ = createEffect(() =>
    this.actions$.pipe(
      ofType(extractMetaEntry),
      map(({ entry }) => entry),
      mapTo(extractEntryFailure({ error: 'NOT IMPLEMENTED' }))
    )
  );

  extractSong$ = createEffect(() =>
    this.actions$.pipe(
      ofType(extractSongEntry),
      map(({ entry }) => entry),
      mergeMap(
        (fileEntry) =>
          this.extractor.extract(fileEntry).pipe(
            concatMap(({ common: tags, format, lastModified }) => {
              const date = new Date();
              date.setSeconds(0, 0);
              const updatedOn = date.getTime();

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
                updatedOn,
              }));

              if (artists.length === 0 || tags.album === undefined) {
                return of(extractEntryFailure({ error: 'missing tags' })).pipe(
                  tap(() => console.log(format))
                ); // TODO
              }

              const picturesActions: Action[] = (tags.picture || []).map(
                (picture) => {
                  const base64 = picture.data.toString('base64');
                  return addOrUpdatePicture({
                    id: getPictureId(base64),
                    src: `data:${picture.format};base64,${base64}`,
                    name: picture.name || picture.description || fileEntry.name,
                    entry: fileEntry,
                  });
                }
              );

              const album: Album = {
                id: getAlbumId(artists[0].name, tags.album),
                title: tags.album,
                artist: artists[0].name,
                artistId: artists[0].id,
                updatedOn,
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
                updatedOn,
                duration: format.duration,
                tags,
              };

              return of(
                ...picturesActions,
                ...artists.map((artist) => upsertArtist({ artist })),
                upsertAlbum({ album }),
                addSong({ song }),
                extractEntrySuccess({
                  label: `${song.artist} - ${song.title}`,
                })
              );
            }),
            catchError((error) => of(extractEntryFailure({ error })))
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
    private player: PlayerFacade,
    private resizer: ResizerService,
    private pictures: PictureFacade
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
