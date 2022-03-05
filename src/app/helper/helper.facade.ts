import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AlbumId } from '@app/database/albums/album.model';
import { addAlbumToQueue, playAlbum } from './helper.actions';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PlaylistNewComponent } from '@app/core/dialogs/playlist-new.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { Song } from '@app/database/songs/song.model';
import { PlaylistAddComponent } from '@app/core/dialogs/playlist-add.component';
import { concatMap, filter, tap } from 'rxjs/operators';
import { PlaylistFacade } from '@app/database/playlists/playlist.facade';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Playlist } from '@app/database/playlists/playlist.model';
import { of } from 'rxjs';

@Injectable()
export class HelperFacade {
  constructor(
    private router: Router,
    private store: Store,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private playlists: PlaylistFacade
  ) {}

  playAlbum(albumId: AlbumId, shuffle: boolean = false): void {
    this.store.dispatch(playAlbum({ id: albumId, shuffle }));
  }

  addAlbumToQueue(albumId: AlbumId, next: boolean = false): void {
    this.store.dispatch(addAlbumToQueue({ id: albumId, next }));
  }

  newPlaylistDialog(): MatDialogRef<PlaylistNewComponent, null | Playlist> {
    return this.dialog.open(PlaylistNewComponent, {
      width: '90%',
      maxWidth: '500px',
      hasBackdrop: true,
      disableClose: true,
      scrollStrategy: new NoopScrollStrategy(),
      closeOnNavigation: false,
    });
  }

  addSongsToPlaylist(songs: Song[]): void {
    this.dialog
      .open<PlaylistAddComponent, any, null | Playlist>(PlaylistAddComponent, {
        width: '275px',
        maxHeight: '80%',
        height: 'auto',
        panelClass: 'playlists-dialog',
        scrollStrategy: new NoopScrollStrategy(),
      })
      .afterClosed()
      .pipe(
        filter((result): result is null | Playlist => result !== undefined),
        concatMap((result) =>
          result === null ? this.newPlaylistDialog().afterClosed() : of(result)
        ),
        filter((result): result is Playlist => !!result),
        tap((result) => this.playlists.addSongsTo(result, songs)),
        concatMap((result) =>
          this.snack
            .open(`Added to ${result.title}`, 'VIEW', {
              panelClass: 'snack-top', // TODO
            })
            .onAction()
            .pipe(tap(() => this.router.navigate(['/', 'playlist', result.id])))
        )
      )
      .subscribe();
  }
}
