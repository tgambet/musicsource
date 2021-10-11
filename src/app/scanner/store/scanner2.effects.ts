import { Injectable } from '@angular/core';
import {
  act,
  Actions,
  createEffect,
  EffectNotification,
  ofType,
  OnRunEffects,
} from '@ngrx/effects';
import { EMPTY, exhaustMap, Observable, of } from 'rxjs';
import { concatMap, filter, map, takeUntil, tap } from 'rxjs/operators';
import { FileService } from '@app/scanner/file.service';
import { ExtractorService } from '@app/scanner/extractor.service';
import { Entry, isFile } from '@app/database/entries/entry.model';
import {
  abortScan,
  extractEntrySuccess,
  openDirectory,
  openDirectorySuccess,
  scanEntries,
  scanEntriesSuccess,
  scanEntrySuccess,
  scanFailure,
  scanStart,
  scanSuccess,
} from '@app/scanner/store/scanner.actions';
import { Router } from '@angular/router';
import { collectRight } from '@app/core/utils/either.util';
import { Album, getAlbumId } from '@app/database/albums/album.model';
import { Song } from '@app/database/songs/song.model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ScanComponent } from '@app/scanner/scan.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { Artist, getArtistId } from '@app/database/artists/artist.model';
import { addEntry } from '@app/database/entries/entry.actions';
import { addSong } from '@app/database/songs/song.actions';
import { upsertAlbum } from '@app/database/albums/album.actions';
import { upsertArtist } from '@app/database/artists/artist.actions';

// noinspection JSUnusedGlobalSymbols
@Injectable()
export class ScannerEffects2 implements OnRunEffects {
  // https://bugs.chromium.org/p/chromium/issues/detail?id=1146886&q=component%3ABlink%3EStorage%3EFileSystem&can=2
  handle?: any;
  scannerRef?: MatDialogRef<ScanComponent>;

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

        const scanner = this.dialog.open(ScanComponent, {
          width: '90%',
          maxWidth: '325px',
          hasBackdrop: true,
          disableClose: false,
          scrollStrategy: new NoopScrollStrategy(),
          closeOnNavigation: false,
          panelClass: 'scan-dialog',
        });

        this.scannerRef = scanner;

        return scanner.afterOpened().pipe(map(() => scanEntries(dir)));
      }),
      tap(() => localStorage.setItem('scanned', '1')),
      tap(() => this.router.navigate(['/library/songs']))
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
      ofType(addEntry),
      map(({ entry }) => entry),
      filter(isFile),
      concatMap((fileEntry) =>
        this.extractor.extract(fileEntry).pipe(
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
              return EMPTY; // TODO
            }

            const album: Album = {
              id: getAlbumId(artists[0].name, tags.album),
              title: tags.album,
              artist: artists[0].name,
              artistId: artists[0].id,
              // artists: artists.map((a) => a.name),
              // artistsIds: artists.map((a) => a.id),
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
          })
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private files: FileService,
    private extractor: ExtractorService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngrxOnRunEffects(
    resolvedEffects$: Observable<EffectNotification>
  ): Observable<EffectNotification> {
    return this.actions$.pipe(
      ofType(scanStart),
      exhaustMap(() =>
        resolvedEffects$.pipe(
          takeUntil(
            this.actions$.pipe(ofType(abortScan, scanSuccess, scanFailure))
          )
        )
      )
    );
  }
}
