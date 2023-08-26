import { Injectable } from '@angular/core';
import {
  Actions,
  createEffect,
  EffectNotification,
  ofType,
  OnRunEffects,
} from '@ngrx/effects';
import { combineLatest, EMPTY, from, Observable, of, throwError } from 'rxjs';
import {
  pause,
  reset,
  resume,
  setCurrentIndex,
  setDuration,
  setLoading,
  setNextIndex,
  setPlaying,
  setQueue,
  setVolume,
  shuffle,
  toggleMute,
} from '@app/player/store/player.actions';
import {
  catchError,
  concatMap,
  filter,
  first,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import { Router } from '@angular/router';
import { AudioService } from '@app/player/audio.service';
import { PlayerFacade } from '@app/player/store/player.facade';
import { SongId } from '@app/database/songs/song.model';
import { requestPermission } from '@app/database/entries/entry.model';
import { tapError } from '@app/core/utils/tap-error.util';
import { MediaSessionService } from '@app/player/media-session.service';
import { Title } from '@angular/platform-browser';
import { EntryFacade } from '@app/database/entries/entry.facade';
import { SongFacade } from '@app/database/songs/song.facade';
import { concatTap, shuffleArray } from '@app/core/utils';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';

// noinspection JSUnusedGlobalSymbols
@Injectable()
export class PlayerEffects implements OnRunEffects {
  // https://bugs.chromium.org/p/chromium/issues/detail?id=1146886&q=component%3ABlink%3EStorage%3EFileSystem&can=2
  handle?: any;

  play$ = createEffect(
    () =>
      this.player.getCurrentSong$().pipe(
        // distinctUntilChanged((s1, s2) => s1?.id === s2?.id),
        filter((songId): songId is SongId => !!songId),
        tap(() => this.player.setLoading()),
        tap(() => this.player.pause()),
        switchMap((songId) =>
          this.songs.getByKey(songId).pipe(
            first(),
            concatMap((song) =>
              song ? of(song) : throwError(() => new Error('Song not found'))
            ),
            concatMap((song) =>
              this.entries.getByKey(song.entries[0]).pipe(
                first(),
                concatMap((entry) =>
                  entry && entry.kind === 'file'
                    ? of(entry)
                    : throwError(() => new Error('Entry not found'))
                ),
                tap((entry) => (this.handle = entry.handle)),
                concatMap((entry) =>
                  requestPermission(entry.handle).pipe(
                    tapError(() => this.player.hide()),
                    catchError(() => EMPTY),
                    concatMap(() => entry.handle.getFile()),
                    tap((file) => this.audio.setSrc(file)),
                    concatTap(() => this.media.setMetadata(song)),
                    tap(() =>
                      this.title.setTitle(
                        `${song.title} • ${song.artists[0].name}`
                      )
                    ),
                    concatMap(() => from(this.audio.resume()))
                  )
                )
              )
            ),
            tapError((err) => {
              this.snack.open(err.message, undefined, {
                panelClass: 'snack-top',
              });
              this.player.setLoading(false);
              this.player.setPlaying(false);
              this.player.hide();
              console.error(err);
            }),
            catchError(() => EMPTY)
          )
        )
      ),
    { dispatch: false }
  );

  reset$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(reset),
        concatTap(() => from(this.audio.reset()))
      ),
    { dispatch: false }
  );

  nextSong$ = createEffect(() =>
    this.audio.ended$.pipe(
      switchMap(() =>
        combineLatest([
          this.player.hasNextSong$(),
          this.player.getRepeat$(),
          this.player.getQueue$().pipe(map((q) => q.length)),
        ]).pipe(
          first(),
          concatMap(([hasNextSong, repeat, queueLength]) => {
            if (repeat === 'once' || (repeat === 'all' && queueLength === 1)) {
              return of(setPlaying({ playing: true }), reset());
            }
            if (hasNextSong) {
              return of(setPlaying({ playing: true }), setNextIndex());
            }
            if (repeat === 'all') {
              return of(
                setPlaying({ playing: true }),
                setCurrentIndex({ index: 0 })
              );
            }
            return EMPTY;
          })
        )
      )
    )
  );

  resume$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(resume),
        switchMap(() =>
          from(this.audio.resume()).pipe(
            tapError((err) =>
              this.snack.open(err.message, undefined, {
                panelClass: 'snack-top',
              })
            ),
            catchError(() => EMPTY)
          )
        )
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
    () =>
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

  shuffle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(shuffle),
      switchMap(() =>
        combineLatest([
          this.player.getQueue$(),
          this.player.getCurrentIndex$(),
        ]).pipe(first())
      ),
      map(([queue, currentIndex]) => {
        const current = queue[currentIndex];
        let newQueue = [...queue];
        newQueue.splice(currentIndex, 1);
        newQueue = [current, ...shuffleArray(newQueue)];
        return setQueue({ queue: newQueue, currentIndex: 0 });
      })
    )
  );

  // analyzer$ = createEffect(() => this.actions$.pipe(ofType()));

  constructor(
    private actions$: Actions,
    private router: Router,
    private audio: AudioService,
    private player: PlayerFacade,
    private entries: EntryFacade,
    private songs: SongFacade,
    private media: MediaSessionService,
    private title: Title,
    private snack: MatSnackBar
  ) {}

  ngrxOnRunEffects(
    resolvedEffects$: Observable<EffectNotification>
  ): Observable<EffectNotification> {
    return resolvedEffects$;
  }
}
