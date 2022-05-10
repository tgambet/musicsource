import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { clearDatabase } from '@app/database/settings/settings.actions';
import { filter, mergeMap, switchMap, tap } from 'rxjs/operators';
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
    private database: DatabaseService
  ) {}
}
