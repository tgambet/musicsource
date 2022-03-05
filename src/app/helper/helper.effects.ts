import { Injectable } from '@angular/core';
import {
  Actions,
  createEffect,
  EffectNotification,
  ofType,
  OnRunEffects,
} from '@ngrx/effects';
import { concatMap, Observable, of, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { SongFacade } from '@app/database/songs/song.facade';
import {
  addToPlaylist,
  setPlaying,
  setPlaylist,
  show,
} from '@app/player/store/player.actions';
import { filter, map, tap } from 'rxjs/operators';
import { Song } from '@app/database/songs/song.model';
import { shuffleArray } from '@app/core/utils';
import {
  addAlbumToPlaylist,
  addAlbumToQueue,
  addSongsToPlaylist,
  playAlbum,
} from '@app/helper/helper.actions';
import { Playlist } from '@app/database/playlists/playlist.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlaylistFacade } from '@app/database/playlists/playlist.facade';
import { HelperFacade } from '@app/helper/helper.facade';

// noinspection JSUnusedGlobalSymbols
@Injectable()
export class HelperEffects implements OnRunEffects {
  playAlbum$ = createEffect(() =>
    this.actions$.pipe(
      ofType(playAlbum),
      switchMap(({ id, shuffle }) =>
        this.songs.getByAlbumKey(id).pipe(
          filter((songs): songs is Song[] => !!songs),
          concatMap((songs) =>
            of(
              setPlaying({ playing: true }),
              setPlaylist({
                playlist: shuffle
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

  addAlbumToQueue$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addAlbumToQueue),
      switchMap(({ id, next }) =>
        this.songs.getByAlbumKey(id).pipe(
          filter((songs): songs is Song[] => !!songs),
          concatMap((songs) =>
            of(
              addToPlaylist({
                playlist: songs.map((s) => s.entryPath),
                next,
              }),
              show()
            )
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
                this.snack
                  .open(`Added to ${result.title}`, 'VIEW', {
                    panelClass: 'snack-top', // TODO
                  })
                  .onAction()
                  .pipe(
                    tap(() =>
                      this.router.navigate(['/', 'playlist', result.id])
                    )
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
          map((songs) => addSongsToPlaylist({ songs }))
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
    private helper: HelperFacade
  ) {}

  ngrxOnRunEffects(
    resolvedEffects$: Observable<EffectNotification>
  ): Observable<EffectNotification> {
    return resolvedEffects$;
  }
}
