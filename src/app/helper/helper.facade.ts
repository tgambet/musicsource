import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AlbumId } from '@app/database/albums/album.model';
import {
  addAlbumToPlaylist,
  addAlbumToQueue,
  addSongsToPlaylist,
  playAlbum,
} from './helper.actions';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PlaylistNewComponent } from '@app/core/dialogs/playlist-new.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { Song } from '@app/database/songs/song.model';
import { Router } from '@angular/router';
import { Playlist } from '@app/database/playlists/playlist.model';
import { PlaylistAddComponent } from '@app/core/dialogs/playlist-add.component';

@Injectable()
export class HelperFacade {
  constructor(
    private router: Router,
    private store: Store,
    private dialog: MatDialog
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

  addToPlaylistDialog(): MatDialogRef<PlaylistAddComponent, null | Playlist> {
    return this.dialog.open<PlaylistAddComponent, any, null | Playlist>(
      PlaylistAddComponent,
      {
        width: '275px',
        maxHeight: '80%',
        height: 'auto',
        panelClass: 'playlists-dialog',
        scrollStrategy: new NoopScrollStrategy(),
      }
    );
  }

  addSongsToPlaylist(songs: Song[]): void {
    this.store.dispatch(addSongsToPlaylist({ songs }));
  }

  addAlbumToPlaylist(id: AlbumId): void {
    this.store.dispatch(addAlbumToPlaylist({ id }));
  }
}
