import { Injectable } from '@angular/core';
import {
  act,
  Actions,
  createEffect,
  EffectNotification,
  ofType,
  OnRunEffects,
} from '@ngrx/effects';
import {
  EMPTY,
  endWith,
  exhaustMap,
  from,
  merge,
  mergeMap,
  Observable,
  of,
  toArray,
} from 'rxjs';
import {
  bufferTime,
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
  extractFailure,
  extractImageEntry,
  extractMetaEntry,
  extractSongEntry,
  extractSuccess,
  openDirectory,
  openDirectorySuccess,
  saveAlbum,
  saveArtist,
  saveEntry,
  saveFailure,
  saveImage,
  saveSong,
  saveSuccess,
  scanEnd,
  scanEnded,
  scanEntries,
  scanEntriesFailure,
  scanEntriesSuccess,
  scanFailure,
  scanStart,
  scanSuccess,
} from '@app/scanner/store/scanner.actions';
import { Router } from '@angular/router';
import { Album, AlbumId, getAlbumId } from '@app/database/albums/album.model';
import { getSongId, Song } from '@app/database/songs/song.model';
import { MatDialog } from '@angular/material/dialog';
import { ScanComponent } from '@app/scanner/scan.component';
import {
  GlobalPositionStrategy,
  NoopScrollStrategy,
  Overlay,
  OverlayRef,
} from '@angular/cdk/overlay';
import {
  Artist,
  ArtistId,
  getArtistId,
} from '@app/database/artists/artist.model';
import { ComponentPortal } from '@angular/cdk/portal';
import { PlayerFacade } from '@app/player/store/player.facade';
import { Action, Store } from '@ngrx/store';
import {
  getPictureId,
  Picture,
  PictureId,
} from '@app/database/pictures/picture.model';
import { ResizerService } from '@app/scanner/resizer.service';
import { PictureFacade } from '@app/database/pictures/picture.facade';
import { selectAlbumByKey } from '@app/database/albums/album.selectors';
import { DatabaseService } from '@app/database/database.service';
import { addEntry } from '@app/database/entries/entry.actions';
import { upsertPicture } from '@app/database/pictures/picture.actions';
import { addArtist } from '@app/database/artists/artist.actions';
import { upsertAlbum } from '@app/database/albums/album.actions';
import { addSong } from '@app/database/songs/song.actions';
import { selectState } from '@app/scanner/store/scanner.selectors';
import { readAsDataURL } from '@app/core/utils/read-as-data-url.util';
import { tapError } from '@app/core/utils';

// noinspection JSUnusedGlobalSymbols
@Injectable()
export class ScannerEffects2 implements OnRunEffects {
  // https://bugs.chromium.org/p/chromium/issues/detail?id=1146886&q=component%3ABlink%3EStorage%3EFileSystem&can=2
  handle?: any;
  overlayRef?: OverlayRef;
  position?: GlobalPositionStrategy;

  concurrency = navigator.hardwareConcurrency;

  openDirectory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(openDirectory),
      act({
        operator: exhaustMap,
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
      tap(() => window.addEventListener('beforeunload', this.unloadListener)),
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

  closeDialog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(scanEnd, scanSuccess, scanFailure), // TODO don't close on failure
      tap(() => this.overlayRef?.dispose()),
      tap(() =>
        window.removeEventListener('beforeunload', this.unloadListener)
      ),
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
            .pipe(map((entry: Entry) => saveEntry({ entry }))),
        error: (error) => scanEntriesFailure({ error }),
        complete: (count) => scanEntriesSuccess({ count }),
      })
    )
  );

  extractEntries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(saveEntry),
      concatMap(({ entry }) => {
        const name = entry.name.toLowerCase();
        if (!isFile(entry)) {
          return EMPTY;
        }
        if (
          ['.jpeg', '.jpg', '.png', '.webp', '.bmp'].some((ext) =>
            name.endsWith(ext)
          )
        ) {
          return of(extractImageEntry({ entry }));
        }
        if (name.endsWith('.nfo')) {
          return of(extractMetaEntry({ entry }));
        }
        if (
          // TODO
          ['.mp3', '.flac', '.ogg', '.m4a', '.wav', '.wma'].some((ext) =>
            name.endsWith(ext)
          )
        ) {
          return of(extractSongEntry({ entry }));
        }
        console.warn('ignored', entry.path);
        return EMPTY;
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
            concatMap((file) => {
              const id = getPictureId(entry.path);
              return this.addOrUpdatePicture(id, file.name, entry.parent, file);
            }),
            endWith(extractSuccess({ label: entry.path })),
            catchError((error) => of(extractFailure({ error })))
          ),
        this.concurrency
      )
    )
  );

  extractMeta$ = createEffect(() =>
    this.actions$.pipe(
      ofType(extractMetaEntry),
      map(({ entry }) => entry),
      mapTo(extractFailure({ error: 'NOT IMPLEMENTED' }))
    )
  );

  extractSong$ = createEffect(() =>
    this.actions$.pipe(
      ofType(extractSongEntry),
      map(({ entry }) => entry),
      mergeMap(
        (fileEntry) =>
          this.extractor.extract(fileEntry).pipe(
            concatMap(({ pictures, common: tags, format, lastModified }) => {
              if (
                tags.albumartist === undefined ||
                tags.album === undefined ||
                tags.artists === undefined ||
                tags.title === undefined
              ) {
                return of(extractFailure({ error: 'missing tags' })).pipe(
                  tap(() => console.log(fileEntry.path, tags))
                ); // TODO
              }

              const date = new Date();
              date.setMilliseconds(0);
              const updatedOn = date.getTime();

              const artists: Artist[] = tags.artists.map((name) => ({
                id: getArtistId(name),
                name,
                updatedOn,
              }));

              const albumArtist: Artist = {
                id: getArtistId(tags.albumartist),
                name: tags.albumartist,
                updatedOn,
              };

              const album: Album = {
                id: getAlbumId(albumArtist.name, tags.album),
                title: tags.album,
                albumArtist: {
                  name: albumArtist.name,
                  id: albumArtist.id,
                },
                artists: artists.map((a) => a.id),
                updatedOn,
                year: tags.year,
                folder: fileEntry.parent,
              };

              const song: Song = {
                entryPath: getSongId(fileEntry.path),
                folder: fileEntry.parent,
                title: tags.title,
                artists: artists.map((a) => ({ name: a.name, id: a.id })),
                album: { title: album.title, id: album.id },
                lastModified,
                format,
                updatedOn,
                duration: format.duration,
                tags,
                pictureId: pictures[0]?.id,
              };

              return merge(
                ...pictures.map(({ id, name, blob }) =>
                  this.addOrUpdatePicture(
                    id,
                    name || fileEntry.name,
                    fileEntry.path,
                    blob
                  )
                ),
                this.addOrUpdateAlbum(
                  album.id,
                  album.title,
                  album.albumArtist,
                  album.artists,
                  album.updatedOn,
                  album.folder,
                  album.year
                ),
                of(
                  ...artists.map((artist) => saveArtist({ artist })),
                  saveSong({ song }),
                  extractSuccess({
                    label: `${song.artists[0].name} - ${song.title}`,
                  })
                )
              );
            }),
            tap({ error: (err) => console.error(fileEntry.path, err) }),
            catchError((error) => of(extractFailure({ error })))
          ),
        this.concurrency
      )
    )
  );

  end$ = createEffect(() =>
    this.store.select(selectState).pipe(
      first((state) => state === 'success' || state === 'error'),
      mapTo(scanEnd())
    )
  );

  addEntry$ = createEffect(() =>
    this.actions$.pipe(
      ofType(saveEntry),
      map(({ entry }) => addEntry({ entry }))
    )
  );

  saveEntries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(saveEntry),
      map(({ entry }) => entry),
      bufferTime(500),
      filter((entries) => entries.length > 0),
      concatMap((entries) =>
        this.database.addMany$<Entry>('entries', entries).pipe(
          toArray(),
          map(() => saveSuccess({ count: entries.length })),
          catchError((error) =>
            of(saveFailure({ count: entries.length, error }))
          )
        )
      )
    )
  );

  addImage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(saveImage),
      map(({ picture }) => upsertPicture({ picture }))
    )
  );

  saveImages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(saveImage),
      map(({ picture }) => picture),
      bufferTime(500),
      filter((pictures) => pictures.length > 0),
      concatMap((pictures) =>
        this.database.putMany$<Picture>('pictures', pictures).pipe(
          toArray(),
          map((keys) => saveSuccess({ count: keys.length })),
          catchError((error) =>
            of(saveFailure({ error, count: pictures.length }))
          )
        )
      )
    )
  );

  addArtist$ = createEffect(() =>
    this.actions$.pipe(
      ofType(saveArtist),
      map(({ artist }) => addArtist({ artist }))
    )
  );

  saveArtists$ = createEffect(() =>
    this.actions$.pipe(
      ofType(saveArtist),
      map(({ artist }) => artist),
      bufferTime(500),
      filter((artists) => artists.length > 0),
      concatMap((artists) =>
        this.database.putMany$<Artist>('artists', artists).pipe(
          toArray(),
          map((keys) => saveSuccess({ count: keys.length })),
          catchError((error) =>
            of(saveFailure({ error, count: artists.length }))
          )
        )
      )
    )
  );

  addAlbum$ = createEffect(() =>
    this.actions$.pipe(
      ofType(saveAlbum),
      map(({ album }) => upsertAlbum({ album }))
    )
  );

  saveAlbums$ = createEffect(() =>
    this.actions$.pipe(
      ofType(saveAlbum),
      map(({ album }) => album),
      bufferTime(500),
      filter((albums) => albums.length > 0),
      concatMap((albums) =>
        this.database.putMany$<Album>('albums', albums).pipe(
          toArray(),
          map((keys) => saveSuccess({ count: keys.length })),
          catchError((error) =>
            of(saveFailure({ error, count: albums.length }))
          )
        )
      )
    )
  );

  addSong$ = createEffect(() =>
    this.actions$.pipe(
      ofType(saveSong),
      map(({ song }) => addSong({ song }))
    )
  );

  saveSongs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(saveSong),
      map(({ song }) => song),
      bufferTime(500),
      filter((songs) => songs.length > 0),
      concatMap((songs) =>
        this.database.addMany$<Song>('songs', songs).pipe(
          toArray(),
          map((keys) => saveSuccess({ count: keys.length })),
          catchError((error) => of(saveFailure({ error, count: songs.length })))
        )
      )
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
    private pictures: PictureFacade,
    private database: DatabaseService
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

  addOrUpdatePicture = (
    id: PictureId,
    name: string,
    path: string,
    blob: Blob
  ): Observable<Action> =>
    this.pictures.getByKey(id).pipe(
      first(),
      concatMap((stored) => {
        if (!stored) {
          if (name.toLowerCase().includes('fanart')) {
            return readAsDataURL(blob).pipe(
              map((src) => ({
                id,
                original: src,
                sources: [],
                name,
                entries: [path],
              })),
              map((picture) => saveImage({ picture }))
            );
          }

          return this.resizer
            .resize(blob, [
              { height: 32 },
              { height: 40 },
              { height: 56 },
              { height: 160 },
              { height: 226 },
              { height: 264 },
              { height: 1100 },
            ])
            .pipe(
              map((sources) => {
                const picture: Picture = {
                  id,
                  // original: src,
                  sources,
                  name,
                  entries: [path],
                };
                return saveImage({ picture });
              })
            );
        } else {
          const picture = {
            ...stored,
            entries: [...stored.entries, path],
          };
          return of(saveImage({ picture }));
        }
      }),
      tapError((err) => console.error(err, path, name))
    );

  addOrUpdateAlbum = (
    id: AlbumId,
    title: string,
    albumArtist: {
      name: string;
      id: ArtistId;
    },
    artists: ArtistId[],
    updatedOn: number,
    folder: string,
    year?: number
  ): Observable<Action> =>
    this.store.select(selectAlbumByKey(id)).pipe(
      first(),
      map((stored) => {
        if (!stored) {
          const album: Album = {
            id,
            title,
            albumArtist,
            artists,
            updatedOn,
            year,
            folder,
          };
          return saveAlbum({ album });
        } else {
          const album = {
            ...stored,
            artists: [...stored.artists, ...artists].filter(
              (value, i, arr) => arr.indexOf(value) === i
            ),
          };
          return saveAlbum({ album });
        }
      })
    );

  unloadListener(e: BeforeUnloadEvent): void {
    e.preventDefault();
    e.returnValue = '';
  }
}
