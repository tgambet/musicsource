import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  clearDatabase,
  synchronizeLibrary,
} from '@app/database/settings/settings.actions';
import { filter, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { openDirectory } from '@app/scanner/store/scanner.actions';
import { SettingsFacade } from '@app/database/settings/settings.facade';
import {
  DirectoryEntry,
  requestPermission,
} from '@app/database/entries/entry.model';
import { concatTap } from '@app/core/utils';
import { removeAllAlbums } from '@app/database/albums/album.actions';
import { removeAllArtists } from '@app/database/artists/artist.actions';
import { removeAllEntries } from '@app/database/entries/entry.actions';
import { removeAllPictures } from '@app/database/pictures/picture.actions';
import { removeAllPlaylists } from '@app/database/playlists/playlist.actions';
import { removeAllSongs } from '@app/database/songs/song.actions';
import { hide, pause } from '@app/player/store/player.actions';
import { DatabaseService } from '@app/database/database.service';
import { Router } from '@angular/router';
import { ConfirmComponent } from '@app/core/dialogs/confirm.component';
import { MatDialog } from '@angular/material/dialog';
import { from } from 'rxjs';

@Injectable()
// noinspection JSUnusedGlobalSymbols
export class SettingsEffects {
  synchronize$ = createEffect(() =>
    this.actions$.pipe(
      ofType(synchronizeLibrary),
      switchMap(() => this.settings.getRootDirectory()),
      filter((directory): directory is DirectoryEntry => !!directory),
      concatTap((dir) => requestPermission(dir.handle)),
      map((directory) => openDirectory({ directory }))
    )
  );

  clearDB$ = createEffect(() =>
    this.actions$.pipe(
      ofType(clearDatabase),
      switchMap(() =>
        this.dialog
          .open<ConfirmComponent, any, boolean>(ConfirmComponent, {
            data: {
              text: 'Are you sure you want to delete the database?',
              action: 'Delete database',
            },
          })
          .afterClosed()
          .pipe(
            filter((action) => action === true),
            concatTap(() => this.database.clear$()),
            tap(() => localStorage.clear()),
            concatTap(() => from(this.router.navigate(['/welcome']))),
            mergeMap(() => [
              pause(),
              hide(),
              removeAllAlbums(),
              removeAllArtists(),
              removeAllEntries(),
              removeAllPictures(),
              removeAllPlaylists(),
              removeAllSongs(),
            ])
          )
      )
    )
  );

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private actions$: Actions,
    private settings: SettingsFacade,
    private database: DatabaseService
  ) {}
}
