import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AlbumId } from '@app/database/albums/album.model';
import {
  addAlbumToPlaylist,
  addAlbumToQueue,
  addPlaylistToPlaylist,
  addPlaylistToQueue,
  addSongsToPlaylist,
  addSongsToQueue,
  createPlaylist,
  deletePlaylist,
  editPlaylist,
  playAlbum,
  playPlaylist,
  removeSongFromQueue,
} from './helper.actions';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  PlaylistData,
  PlaylistNewComponent,
} from '@app/core/dialogs/playlist-new.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { Song, SongId } from '@app/database/songs/song.model';
import { Router } from '@angular/router';
import {
  getPlaylistId,
  Playlist,
  PlaylistId,
} from '@app/database/playlists/playlist.model';
import { PlaylistAddComponent } from '@app/core/dialogs/playlist-add.component';
import { filter, map, tap } from 'rxjs/operators';
import * as PlaylistsActions from '@app/database/playlists/playlist.actions';
import { Observable } from 'rxjs';

@Injectable()
export class HelperFacade {
  constructor(
    private router: Router,
    private store: Store,
    private dialog: MatDialog
  ) {}

  newPlaylist(): Observable<Playlist> {
    return this.newPlaylistDialog()
      .afterClosed()
      .pipe(
        filter((data): data is PlaylistData => !!data),
        map((data) => ({
          songs: [],
          createdOn: new Date().getTime(),
          id: getPlaylistId(data.title + Date.now()),
          title: data.title,
          description: data.description,
        })),
        tap((playlist) =>
          this.store.dispatch(PlaylistsActions.addPlaylist({ playlist }))
        )
      );
  }

  newPlaylistDialog(
    data?: PlaylistData
  ): MatDialogRef<PlaylistNewComponent, null | PlaylistData> {
    return this.dialog.open(PlaylistNewComponent, {
      width: '90%',
      maxWidth: '500px',
      hasBackdrop: true,
      disableClose: true,
      scrollStrategy: new NoopScrollStrategy(),
      closeOnNavigation: false,
      data,
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

  playAlbum(albumId: AlbumId, shuffle: boolean = false): void {
    this.store.dispatch(playAlbum({ id: albumId, shuffle }));
  }

  addAlbumToQueue(albumId: AlbumId, next: boolean = false): void {
    this.store.dispatch(addAlbumToQueue({ id: albumId, next }));
  }

  addSongsToPlaylist(songs: SongId[]): void {
    this.store.dispatch(addSongsToPlaylist({ songs }));
  }

  addAlbumToPlaylist(id: AlbumId): void {
    this.store.dispatch(addAlbumToPlaylist({ id }));
  }

  addSongsToQueue(songs: SongId[], next: boolean, message: string): void {
    this.store.dispatch(addSongsToQueue({ songs, next, message }));
  }

  addSongToQueue(song: SongId, next: boolean): void {
    this.addSongsToQueue(
      [song],
      next,
      next ? 'Song will play next' : 'Song added to Queue'
    );
  }

  removeSongFromQueue(song: Song): void {
    this.store.dispatch(removeSongFromQueue({ song }));
  }

  playPlaylist(id: PlaylistId, shuffle: boolean = false) {
    this.store.dispatch(playPlaylist({ id, shuffle }));
  }

  addPlaylistToQueue(id: PlaylistId, next: boolean = false): void {
    this.store.dispatch(addPlaylistToQueue({ id, next }));
  }

  addPlaylistToPlaylist(id: PlaylistId): void {
    this.store.dispatch(addPlaylistToPlaylist({ id }));
  }

  deletePlaylist(id: PlaylistId): void {
    this.store.dispatch(deletePlaylist({ id }));
  }

  editPlaylist(id: PlaylistId): void {
    this.store.dispatch(editPlaylist({ id }));
  }

  createEmptyPlaylist(): void {
    this.store.dispatch(createPlaylist());
  }
}
