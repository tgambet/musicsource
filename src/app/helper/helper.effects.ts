import { Injectable } from '@angular/core';
import {
  Actions,
  createEffect,
  EffectNotification,
  ofType,
  OnRunEffects,
} from '@ngrx/effects';
import { combineLatest, concatMap, Observable, of, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { SongFacade } from '@app/database/songs/song.facade';
import {
  addToQueue,
  setPlaying,
  setQueue,
  show,
} from '@app/player/store/player.actions';
import { filter, first, map, tap } from 'rxjs/operators';
import { Song } from '@app/database/songs/song.model';
import { shuffleArray } from '@app/core/utils';
import {
  addAlbumToPlaylist,
  addAlbumToQueue,
  addPlaylistToPlaylist,
  addPlaylistToQueue,
  addSongsToPlaylist,
  addSongsToQueue,
  openSnack,
  playAlbum,
  playPlaylist,
  removeSongFromQueue,
} from '@app/helper/helper.actions';
import { Playlist } from '@app/database/playlists/playlist.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlaylistFacade } from '@app/database/playlists/playlist.facade';
import { HelperFacade } from '@app/helper/helper.facade';
import { PlayerFacade } from '@app/player/store/player.facade';

// noinspection JSUnusedGlobalSymbols
@Injectable()
export class HelperEffects implements OnRunEffects {
  playAlbum$ = createEffect(() =>
    this.actions$.pipe(
      ofType(playAlbum),
      switchMap(({ id, shuffle }) =>
        this.songs.getByAlbumKey(id).pipe(
          filter((songs): songs is Song[] => !!songs),
          first(),
          concatMap((songs) =>
            of(
              setPlaying({ playing: true }),
              setQueue({
                queue: shuffle
                  ? shuffleArray(songs.map((s) => s.entryPath))
                  : songs.map((s) => s.entryPath),
                currentIndex: 0,
              }),
              show()
            )
          )
        )
      )
    )
  );

  playPlaylist$ = createEffect(() =>
    this.actions$.pipe(
      ofType(playPlaylist),
      switchMap(({ id, shuffle }) =>
        this.playlists.getByKey(id).pipe(
          filter((playlist): playlist is Playlist => !!playlist),
          first(),
          concatMap((playlist) =>
            of(
              setPlaying({ playing: true }),
              setQueue({
                queue: shuffle ? shuffleArray(playlist.songs) : playlist.songs,
                currentIndex: 0,
              }),
              show()
            )
          )
        )
      )
    )
  );

  addAlbumToQueue$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addAlbumToQueue),
      switchMap(({ id, next }) =>
        this.songs.getByAlbumKey(id).pipe(
          filter((songs): songs is Song[] => !!songs),
          map((songs) =>
            addSongsToQueue({
              songs: songs.map((s) => s.entryPath),
              next,
              message: next ? 'Album will play next' : 'Album added to queue',
            })
          )
        )
      )
    )
  );

  addPlaylistToQueue$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addPlaylistToQueue),
      switchMap(({ id, next }) =>
        this.playlists.getByKey(id).pipe(
          filter((playlist): playlist is Playlist => !!playlist),
          map((playlist) =>
            addSongsToQueue({
              songs: playlist.songs,
              next,
              message: next
                ? 'Playlist will play next'
                : 'Playlist added to queue',
            })
          )
        )
      )
    )
  );

  addSongsToPlaylist$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(addSongsToPlaylist),
        switchMap(({ songs }) =>
          this.helper
            .addToPlaylistDialog()
            .afterClosed()
            .pipe(
              filter(
                (result): result is null | Playlist => result !== undefined
              ),
              concatMap((result) =>
                result === null
                  ? this.helper.newPlaylistDialog().afterClosed()
                  : of(result)
              ),
              filter((result): result is Playlist => !!result),
              tap((result) => this.playlists.addSongsTo(result, songs)),
              concatMap((result) =>
                this.player.isShown$().pipe(
                  first(),
                  concatMap((shown) =>
                    this.snack
                      .open(`Added to ${result.title}`, 'VIEW', {
                        panelClass: shown ? 'snack-top' : 'snack',
                      })
                      .onAction()
                  ),
                  tap(() => this.router.navigate(['/', 'playlist', result.id]))
                )
              )
            )
        )
      ),
    { dispatch: false }
  );

  addAlbumToPlaylist$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addAlbumToPlaylist),
      switchMap(({ id }) =>
        this.songs.getByAlbumKey(id).pipe(
          filter((songs): songs is Song[] => !!songs),
          first(),
          map((songs) =>
            addSongsToPlaylist({ songs: songs.map((s) => s.entryPath) })
          )
        )
      )
    )
  );

  addPlaylistToPlaylist$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addPlaylistToPlaylist),
      switchMap(({ id }) =>
        this.playlists.getByKey(id).pipe(
          filter((playlist): playlist is Playlist => !!playlist),
          first(),
          map((playlist) => addSongsToPlaylist({ songs: playlist.songs }))
        )
      )
    )
  );

  openSnack$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(openSnack),
        switchMap(({ message }) =>
          this.player.isShown$().pipe(
            first(),
            tap((shown) =>
              this.snack.open(message, undefined, {
                panelClass: shown ? 'snack-top' : 'snack',
              })
            )
          )
        )
      ),
    { dispatch: false }
  );

  addSongsToQueue$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addSongsToQueue),
      concatMap(({ songs, next, message }) =>
        of(addToQueue({ queue: songs, next }), show(), openSnack({ message }))
      )
    )
  );

  removeSongFromQueue$ = createEffect(() =>
    this.actions$.pipe(
      ofType(removeSongFromQueue),
      concatMap(({ song }) =>
        combineLatest([
          this.player.getQueue$(),
          this.player.getCurrentIndex$(),
        ]).pipe(
          first(),
          map(([playlist, index]) => {
            const newPlaylist = [...playlist];
            newPlaylist.splice(playlist.indexOf(song.entryPath), 1);
            return setQueue({
              queue: newPlaylist,
              currentIndex: Math.min(index, newPlaylist.length - 1),
            });
          })
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private router: Router,
    private songs: SongFacade,
    private snack: MatSnackBar,
    private playlists: PlaylistFacade,
    private helper: HelperFacade,
    private player: PlayerFacade
  ) {}

  ngrxOnRunEffects(
    resolvedEffects$: Observable<EffectNotification>
  ): Observable<EffectNotification> {
    return resolvedEffects$;
  }
}
