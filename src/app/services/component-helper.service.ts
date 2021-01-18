import { Injectable } from '@angular/core';
import { Artist } from '@app/models/artist.model';
import { concatMap, first, map, tap } from 'rxjs/operators';
import { LibraryFacade } from '@app/store/library/library.facade';
import { MatSnackBar } from '@angular/material/snack-bar';
import { combineLatest, EMPTY, Observable } from 'rxjs';
import { Song, SongWithCover$ } from '@app/models/song.model';
import { PlaylistAddComponent } from '@app/dialogs/playlist-add.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { reduceArray } from '@app/utils/reduce-array.util';
import { shuffleArray } from '@app/utils/shuffle-array.util';
import { PlayerFacade } from '@app/store/player/player.facade';
import { Album } from '@app/models/album.model';

@Injectable({
  providedIn: 'root',
})
export class ComponentHelperService {
  constructor(
    private player: PlayerFacade,
    private library: LibraryFacade,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {}

  toggleLikedSong(song: Song): Observable<Song> {
    return this.library
      .toggleSongFavorite(song)
      .pipe(tap((updated) => (song.likedOn = updated.likedOn)))
      .pipe(
        tap(() =>
          this.openSnack(
            !!song.likedOn ? 'Added to your likes' : 'Removed from your likes'
          )
        )
      );
  }

  toggleLikedAlbum(album: Album): Observable<Album> {
    return this.library
      .toggleLikedAlbum(album)
      .pipe(tap((updated) => (album.likedOn = updated.likedOn)))
      .pipe(
        tap(() =>
          this.openSnack(
            !!album.likedOn ? 'Added to your likes' : 'Removed from your likes'
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
          this.openSnack(
            !!artist.likedOn ? 'Added to your likes' : 'Removed from your likes'
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
        concatMap((result) =>
          result === undefined
            ? EMPTY
            : result === true
            ? EMPTY // TODO Redirect to new playlist and add song
            : this.library
                .addSongsToPlaylist([...songs].reverse(), result)
                .pipe(
                  concatMap((key) =>
                    this.player.isShown$().pipe(
                      first(),
                      concatMap((shown) =>
                        this.snack
                          .open(`Added to ${result}`, 'VIEW', {
                            panelClass: shown ? 'snack-top' : 'snack',
                          })
                          .onAction()
                      ),
                      tap(() =>
                        this.router.navigate(['/', 'playlist', key.toString()])
                      )
                    )
                  )
                )
        ),
        map(() => void 0)
      );
  }

  shufflePlayArtist(artist: Artist): Observable<SongWithCover$[]> {
    return this.library.getArtistTitles(artist).pipe(
      reduceArray(),
      map((songs) => shuffleArray(songs)),
      map((songs) => songs.slice(0, 100)),
      tap((songs) => {
        this.player.setPlaying();
        this.player.setPlaylist(songs);
        this.player.show();
      })
    );
  }

  playNext(song: SongWithCover$) {
    this.player.addToPlaylist([song], true);
    this.player.show();
    this.openSnack('Song will play next');
  }

  addToQueue(song: SongWithCover$) {
    this.player.addToPlaylist([song]);
    this.player.show();
    this.openSnack('Song added to queue');
  }

  removeFromQueue(song: SongWithCover$) {
    combineLatest([this.player.getPlaylist$(), this.player.getCurrentIndex$()])
      .pipe(
        first(),
        tap(([playlist, index]) => {
          const newPlaylist = [...playlist];
          newPlaylist.splice(playlist.indexOf(song), 1);
          this.player.setPlaylist(
            newPlaylist,
            Math.min(index, newPlaylist.length - 1)
          );
        })
      )
      .subscribe();
  }

  openSnack(message: string) {
    this.player
      .isShown$()
      .pipe(
        first(),
        tap((shown) =>
          this.snack.open(message, undefined, {
            panelClass: shown ? 'snack-top' : 'snack',
          })
        )
      )
      .subscribe();
  }
}
