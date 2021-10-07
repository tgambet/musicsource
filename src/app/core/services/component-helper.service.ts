import { Injectable } from '@angular/core';
import { Artist } from '@app/database/artists/artist.model';
import { filter, first, map, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { combineLatest, Observable } from 'rxjs';
import { Song } from '@app/database/songs/song.model';
import { PlaylistAddComponent } from '@app/core/dialogs/playlist-add.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { shuffleArray } from '@app/core/utils/shuffle-array.util';
import { PlayerFacade } from '@app/player/store/player.facade';
import { PlaylistFacade } from '@app/database/playlists/playlist.facade';
import { SongFacade } from '@app/database/songs/song.facade';

@Injectable()
export class ComponentHelperService {
  constructor(
    private player: PlayerFacade,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private playlists: PlaylistFacade,
    private songs: SongFacade
  ) {}

  // toggleLikedSong(song: Song): Observable<Song> {
  //   return this.library
  //     .toggleSongFavorite(song)
  //     .pipe(tap((updated) => (song.likedOn = updated.likedOn)))
  //     .pipe(
  //       tap(() =>
  //         this.openSnack(
  //           !!song.likedOn ? 'Added to your likes' : 'Removed from your likes'
  //         )
  //       )
  //     );
  // }

  // toggleLikedAlbum(album: Album): void {
  //   this.library.toggleLikedAlbum(album);
  //   // return (
  //
  //   // .pipe(tap((updated) => (album.likedOn = updated.likedOn)))
  //   // .pipe(
  //   //   tap(() =>
  //   // TODO move to effects
  //   this.openSnack(
  //     !!album.likedOn ? 'Removed from your likes' : 'Added to your likes'
  //   );
  //   // )
  //   // )
  //   // );
  // }

  // toggleLikedArtist(artist: Artist): void {
  //   this.library.toggleArtistFavorite(artist);
  // TODO
  //   this.openSnack(
  //     !!artist.likedOn ? 'Removed from your likes' : 'Added to your likes'
  //   );
  //   // .pipe(
  //   //   tap(() => (artist.likedOn = !!artist.likedOn ? undefined : new Date()))
  //   // )
  //   // .pipe(
  //   //   tap(() =>
  //   //     this.openSnack(
  //   //       !!artist.likedOn ? 'Added to your likes' : 'Removed from your likes'
  //   //     )
  //   //   )
  //   // );
  // }

  addSongsToPlaylist(songs: Song[]): void {
    const dialog = this.dialog.open(PlaylistAddComponent, {
      width: '275px',
      maxHeight: '80%',
      height: 'auto',
      panelClass: 'playlists-dialog',
    });

    dialog
      .afterClosed()
      .pipe(
        tap((result) => {
          if (result === undefined) {
            return;
          }
          if (result === true) {
            // TODO Redirect to new playlist and add song
          } else {
            const snack = this.snack.open(`Added to ${result.title}`, 'VIEW', {
              panelClass: 'snack-top', // TODO
            });

            snack
              .onAction()
              .pipe(
                tap(() => this.router.navigate(['/', 'playlist', result.hash]))
              )
              .subscribe();

            this.playlists.addSongsTo(result, songs);
          }
        })
        // concatTap(
        //   (result) =>
        //     result === undefined
        //       ? EMPTY
        //       : result === true
        //       ? EMPTY // TODO Redirect to new playlist and add song
        //       : of(this.playlists.addSongsToPlaylist(result, songs))
        //   // .pipe(
        //   //   concatMap((key) =>
        //   //     this.player.isShown$().pipe(
        //   //       first(),
        //   //       concatMap((shown) =>
        //   //         this.snack
        //   //           .open(`Added to ${result}`, 'VIEW', {
        //   //             panelClass: shown ? 'snack-top' : 'snack',
        //   //           })
        //   //           .onAction()
        //   //       ),
        //   //       tap(() =>
        //   //         this.router.navigate(['/', 'playlist', key.toString()])
        //   //       )
        //   //     )
        //   //   )
        //   // )
        // ),
        // map(() => void 0)
      )
      .subscribe();
  }

  shufflePlayArtist(artist: Artist): Observable<Song[]> {
    return this.songs.getByArtistKey(artist.name).pipe(
      filter((songs): songs is Song[] => !!songs),
      map((songs) => shuffleArray(songs)),
      map((songs) => songs.slice(0, 100)),
      tap((songs) => {
        this.player.setPlaying();
        this.player.setPlaylist(songs);
        this.player.show();
      })
    );
  }

  playNext(song: Song): void {
    this.player.addToPlaylist([song], true);
    this.player.show();
    this.openSnack('Song will play next');
  }

  addToQueue(song: Song): void {
    this.player.addToPlaylist([song]);
    this.player.show();
    this.openSnack('Song added to queue');
  }

  removeFromQueue(song: Song): void {
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

  openSnack(message: string): void {
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

  shufflePlaySongs(songs: Song[]): void {
    this.player.setPlaying();
    this.player.setPlaylist(songs);
    this.player.shuffle();
    this.player.show();
  }

  addSongsToQueue(songs: Song[], next = false): void {
    this.player.addToPlaylist(songs, next);
    this.player.show();
    if (next) {
      this.openSnack('Songs will play next');
    } else {
      this.openSnack('Songs added to queue');
    }
  }
}
