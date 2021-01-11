import { Injectable } from '@angular/core';
import {
  Actions,
  createEffect,
  EffectNotification,
  ofType,
  OnRunEffects,
} from '@ngrx/effects';
import { concat, EMPTY, Observable, of } from 'rxjs';
import {
  pause,
  play,
  playAlbum,
  playPlaylist,
  setDuration,
  setNextIndex,
  setPlaying,
  setPlaylist,
  show,
} from '@app/store/player/player.actions';
import { concatMap, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AudioService } from '@app/services/audio.service';
import { PlayerFacade } from '@app/store/player/player.facade';
import { LibraryFacade } from '@app/store/library/library.facade';
import { reduceArray } from '@app/utils/reduce-array.util';
import { SongWithCover$ } from '@app/models/song.model';
import { FileEntry } from '@app/models/entry.model';

// noinspection JSUnusedGlobalSymbols
@Injectable()
export class PlayerEffects implements OnRunEffects {
  // https://bugs.chromium.org/p/chromium/issues/detail?id=1146886&q=component%3ABlink%3EStorage%3EFileSystem&can=2
  handle?: any;

  setSrc$ = createEffect(
    () =>
      this.player.getCurrentSong$().pipe(
        filter((song): song is SongWithCover$ => !!song),
        switchMap((song) =>
          this.library.getEntry(song.entryPath).pipe(
            filter((entry): entry is FileEntry => !!entry),
            tap((entry) => (this.handle = entry.handle)),
            concatMap((entry) =>
              this.library.requestPermission(entry.handle).pipe(
                concatMap(() => entry.handle.getFile()),
                concatMap((file) => this.audio.setSrc(file))
              )
            ),
            concatMap(() => this.player.getPlaying$()),
            concatMap((playing) => (playing ? this.audio.resume() : EMPTY))
          )
        )
      ),
    { dispatch: false }
  );

  nextSong$ = createEffect(() =>
    this.audio.ended$.pipe(
      switchMap(() =>
        this.player.hasNextSong$().pipe(
          take(1),
          concatMap((hasNextSong) =>
            hasNextSong ? of(setNextIndex(), play()) : EMPTY
          )
        )
      )
    )
  );

  play$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(play),
        tap(() => this.audio.resume())
      ),
    {
      dispatch: false,
    }
  );

  pause$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(pause),
        tap(() => this.audio.pause())
      ),
    {
      dispatch: false,
    }
  );

  playing$ = createEffect(() =>
    this.audio.playing$.pipe(map((playing) => setPlaying({ playing })))
  );

  duration$ = createEffect(() =>
    this.audio.duration$.pipe(map((duration) => setDuration({ duration })))
  );

  playAlbum$ = createEffect(() =>
    this.actions$.pipe(
      ofType(playAlbum),
      switchMap(({ album, index }) =>
        concat(
          this.library
            .getAlbumTracks(album)
            .pipe(
              map((playlist) => setPlaylist({ playlist, currentIndex: index }))
            ),
          of(show()),
          of(setPlaying({ playing: true }))
        )
      )
    )
  );

  playPlaylist$ = createEffect(() =>
    this.actions$.pipe(
      ofType(playPlaylist),
      switchMap(({ playlist, index }) =>
        concat(
          this.library.getPlaylistSongs(playlist).pipe(
            reduceArray(),
            map((songs) =>
              setPlaylist({ playlist: songs, currentIndex: index })
            )
          ),
          of(show()),
          of(play())
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private router: Router,
    private audio: AudioService,
    private player: PlayerFacade,
    private library: LibraryFacade
  ) {}

  ngrxOnRunEffects(
    resolvedEffects$: Observable<EffectNotification>
  ): Observable<EffectNotification> {
    return resolvedEffects$;
  }
}
