import { Injectable } from '@angular/core';
import { Artist } from '@app/models/artist.model';
import { concatMap, map, tap } from 'rxjs/operators';
import { LibraryFacade } from '@app/store/library/library.facade';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EMPTY, Observable } from 'rxjs';
import { Song, SongWithCover$ } from '@app/models/song.model';
import { PlaylistAddComponent } from '@app/dialogs/playlist-add.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { reduceArray } from '@app/utils/reduce-array.util';
import { shuffleArray } from '@app/utils/shuffle-array.util';
import { PlayerFacade } from '@app/store/player/player.facade';
import { AlbumWithCover$ } from '@app/models/album.model';

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
        concatMap((result) =>
          result === undefined
            ? EMPTY
            : result === true
            ? EMPTY // TODO Redirect to new playlist and add song
            : this.library
                .addSongsToPlaylist([...songs].reverse(), result)
                .pipe(
                  concatMap((key) =>
                    this.snack
                      .open(`Added to ${result}`, 'VIEW')
                      .onAction()
                      .pipe(
                        tap(() =>
                          this.router.navigate([
                            '/',
                            'playlist',
                            key.toString(),
                          ])
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
        this.player.setPlaying(true);
        this.player.setPlaylist(songs);
        this.player.show();
      })
    );
  }

  toggleLikedAlbum(album: AlbumWithCover$): Observable<AlbumWithCover$> {
    return EMPTY; // TODO
  }
}
