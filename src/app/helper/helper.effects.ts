import { Injectable } from '@angular/core';
import {
  Actions,
  createEffect,
  EffectNotification,
  ofType,
  OnRunEffects,
} from '@ngrx/effects';
import {
  combineLatest,
  concatMap,
  EMPTY,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { Router } from '@angular/router';
import { SongFacade } from '@app/database/songs/song.facade';
import {
  addToQueue,
  setPlaying,
  setQueue,
  show,
} from '@app/player/store/player.actions';
import * as PlaylistActions from '@app/database/playlists/playlist.actions';
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
  createPlaylist,
  deletePlaylist,
  editPlaylist,
  openSnack,
  playAlbum,
  playPlaylist,
  playSongs,
  removeSongFromQueue,
} from '@app/helper/helper.actions';
import { Playlist } from '@app/database/playlists/playlist.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlaylistFacade } from '@app/database/playlists/playlist.facade';
import { HelperFacade } from '@app/helper/helper.facade';
import { PlayerFacade } from '@app/player/store/player.facade';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '@app/core/dialogs/confirm.component';
import { PlaylistData } from '@app/core/dialogs/playlist-new.component';

// noinspection JSUnusedGlobalSymbols
@Injectable()
export class HelperEffects implements OnRunEffects {
  playSongs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(playSongs),
      switchMap(({ songs, shuffle }) =>
        of(
          setPlaying({ playing: true }),
          setQueue({
            queue: shuffle ? shuffleArray(songs) : songs,
            currentIndex: 0,
          }),
          show()
        )
      )
    )
  );

  playAlbum$ = createEffect(() =>
    this.actions$.pipe(
      ofType(playAlbum),
      switchMap(({ id, shuffle }) =>
        this.songs.getByAlbumKey(id).pipe(
          filter((songs): songs is Song[] => !!songs),
          first(),
          map((songs) =>
            playSongs({ songs: songs.map((s) => s.entryPath), shuffle })
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
          map((playlist) => playSongs({ songs: playlist.songs, shuffle }))
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
          first(),
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

  createEmptyPlaylist$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createPlaylist),
      concatMap(() => this.helper.newPlaylist()),
      map((playlist) =>
        openSnack({ message: `Playlist ${playlist.title} created` })
      )
    )
  );

  addPlaylistToQueue$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addPlaylistToQueue),
      switchMap(({ id, next }) =>
        this.playlists.getByKey(id).pipe(
          filter((playlist): playlist is Playlist => !!playlist),
          first(),
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

  addSongsToPlaylist$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addSongsToPlaylist),
      switchMap(({ songs }) =>
        this.helper
          .addToPlaylistDialog()
          .afterClosed()
          .pipe(
            filter((result): result is null | Playlist => result !== undefined),
            concatMap((result) =>
              result === null ? this.helper.newPlaylist() : of(result)
            ),
            filter((result): result is Playlist => !!result),
            tap((result) => this.playlists.addSongsTo(result, songs)),
            map((result) =>
              openSnack({
                message: `Added to ${result.title}`,
                action: 'VIEW',
                cb: () => this.router.navigate(['/', 'playlist', result.id]),
              })
            )
          )
      )
    )
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
        switchMap(({ message, action, cb }) =>
          this.player.isShown$().pipe(
            first(),
            concatMap((shown) =>
              this.snack
                .open(message, action, {
                  panelClass: shown ? 'snack-top' : 'snack',
                })
                .onAction()
            ),
            tap(() => cb && cb())
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

  deletePlaylist$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deletePlaylist),
      concatMap(({ id }) =>
        this.dialog
          .open(ConfirmComponent, {
            data: {
              text: 'Are you sure you want to delete this playlist?',
              action: 'Delete playlist',
            },
          })
          .afterClosed()
          .pipe(
            concatMap((result) => {
              if (!result) {
                return EMPTY;
              }
              this.router.navigate(['/', 'library', 'playlists'], {
                preserveFragment: true,
              });
              return of(
                PlaylistActions.deletePlaylist({ id }),
                openSnack({ message: 'Playlist deleted' })
              );
            })
          )
      )
    )
  );

  editPlaylist$ = createEffect(() =>
    this.actions$.pipe(
      ofType(editPlaylist),
      switchMap(({ id }) =>
        this.playlists.getByKey(id).pipe(
          first(),
          filter((playlist): playlist is Playlist => !!playlist),
          concatMap((playlist) =>
            this.helper
              .newPlaylistDialog({
                id: playlist.id,
                title: playlist.title,
                description: playlist.description,
              })
              .afterClosed()
              .pipe(
                filter((data): data is PlaylistData => !!data),
                map((data) =>
                  PlaylistActions.updatePlaylist({
                    update: { key: playlist.id, changes: data },
                  })
                )
              )
          )
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
    private player: PlayerFacade,
    private dialog: MatDialog
  ) {}

  ngrxOnRunEffects(
    resolvedEffects$: Observable<EffectNotification>
  ): Observable<EffectNotification> {
    return resolvedEffects$;
  }
}
