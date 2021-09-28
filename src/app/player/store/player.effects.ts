import { Injectable } from '@angular/core';
import {
  Actions,
  createEffect,
  EffectNotification,
  ofType,
  OnRunEffects,
} from '@ngrx/effects';
import { EMPTY, Observable, of } from 'rxjs';
import {
  pause,
  resume,
  setDuration,
  setLoading,
  setNextIndex,
  setPlaying,
  setVolume,
  toggleMute,
} from '@app/player/store/player.actions';
import {
  catchError,
  concatMap,
  filter,
  first,
  map,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { Router } from '@angular/router';
import { AudioService } from '@app/player/audio.service';
import { PlayerFacade } from '@app/player/store/player.facade';
import { LibraryFacade } from '@app/library/store/library.facade';
import { SongWithCover$ } from '@app/database/song.model';
import { FileEntry } from '@app/database/entry.model';
import { tapError } from '@app/core/utils/tap-error.util';
import { MediaSessionService } from '@app/player/media-session.service';
import { Title } from '@angular/platform-browser';

// noinspection JSUnusedGlobalSymbols
@Injectable()
export class PlayerEffects implements OnRunEffects {
  // https://bugs.chromium.org/p/chromium/issues/detail?id=1146886&q=component%3ABlink%3EStorage%3EFileSystem&can=2
  handle?: any;

  play$ = createEffect(
    () =>
      this.player.getCurrentSong$().pipe(
        // distinctUntilChanged((s1, s2) => s1?.entryPath === s2?.entryPath),
        filter((song): song is SongWithCover$ => !!song),
        tap(() => this.player.setLoading()),
        switchMap((song) =>
          this.player.getPlaying$().pipe(
            first(),
            tap(() => this.player.pause()),
            concatMap((playing) =>
              this.library.getEntry(song.entryPath).pipe(
                filter((entry): entry is FileEntry => !!entry),
                tap((entry) => (this.handle = entry.handle)),
                concatMap((entry) =>
                  this.library.requestPermission(entry.handle).pipe(
                    tapError(() => this.player.hide()),
                    catchError(() => EMPTY),
                    concatMap(() => entry.handle.getFile()),
                    concatMap((file) => this.audio.setSrc(file)),
                    tap(() => this.media.setMetadata(song)),
                    tap(() =>
                      this.title.setTitle(
                        `${song.title} • ${song.artist} - MusicSource`
                      )
                    ),
                    concatMap(() => (playing ? this.audio.resume() : EMPTY))
                  )
                )
              )
            )
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
            hasNextSong
              ? of(setPlaying({ playing: true }), setNextIndex())
              : EMPTY
          )
        )
      )
    )
  );

  resume$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(resume),
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

  volume$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(setVolume),
        tap(({ volume }) => this.audio.setVolume(volume))
      ),
    {
      dispatch: false,
    }
  );

  volume2$ = createEffect(() =>
    this.audio.volume$.pipe(map((volume) => setVolume({ volume })))
  );

  mute$ = createEffect(
    () => () =>
      this.actions$.pipe(
        ofType(toggleMute),
        tap(() => this.audio.toggleMute())
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

  loading$ = createEffect(() =>
    this.audio.loading$.pipe(map((loading) => setLoading({ loading })))
  );

  constructor(
    private actions$: Actions,
    private router: Router,
    private audio: AudioService,
    private player: PlayerFacade,
    private library: LibraryFacade,
    private media: MediaSessionService,
    private title: Title
  ) {
    this.media.init();
  }

  ngrxOnRunEffects(
    resolvedEffects$: Observable<EffectNotification>
  ): Observable<EffectNotification> {
    return resolvedEffects$;
  }
}
