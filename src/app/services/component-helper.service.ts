import { Injectable } from '@angular/core';
import { Artist } from '@app/models/artist.model';
import { concatMap, map, tap } from 'rxjs/operators';
import { LibraryFacade } from '@app/store/library/library.facade';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EMPTY, Observable } from 'rxjs';
import { Song } from '@app/models/song.model';
import { PlaylistAddComponent } from '@app/dialogs/playlist-add.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root',
})
export class ComponentHelperService {
  constructor(
    private library: LibraryFacade,
    private snack: MatSnackBar,
    private dialog: MatDialog
  ) {}

  toggleLikedSong(song: Song): Observable<Song> {
    return this.library
      .toggleSongFavorite(song)
      .pipe(tap((updated) => (song.likedOn = updated.likedOn)))
      .pipe(
        tap(() =>
          this.snack.open(
            !!song.likedOn ? 'Added to your likes' : 'Removed from your likes'
          )
        )
      );
  }

  toggleLikedArtist(artist: Artist): Observable<any> {
    return this.library
      .toggleArtistFavorite(artist)
      .pipe(
        tap(() => (artist.likedOn = !!artist.likedOn ? undefined : new Date()))
      )
      .pipe(
        tap(() =>
          this.snack.open(
            !!artist.likedOn
              ? 'Added to your likes'
              : 'Removed from your likes',
            undefined
          )
        )
      );
  }

  addSongsToPlaylist(songs: Song[]): Observable<void> {
    return this.dialog
      .open(PlaylistAddComponent, {
        width: '275px',
        maxHeight: '80%',
        height: 'auto',
        panelClass: 'playlists-dialog',
      })
      .afterClosed()
      .pipe(
        concatMap(
          (result) =>
            result === undefined
              ? EMPTY
              : result === true
              ? EMPTY // Redirect to new playlist and add song
              : this.library
                  .addSongsToPlaylist([...songs].reverse(), result)
                  .pipe(
                    tap(() => this.snack.open(`Added to ${result}`, 'VIEW'))
                  ) // TODO redirect to playlist
        ),
        map(() => void 0)
      );
  }
}
