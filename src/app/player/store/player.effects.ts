import { Injectable } from '@angular/core';
import {
  Actions,
  createEffect,
  EffectNotification,
  ofType,
  OnRunEffects,
} from '@ngrx/effects';
import { combineLatest, EMPTY, from, Observable, of } from 'rxjs';
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
import { Song, SongId } from '@app/database/songs/song.model';
import {
  FileEntry,
  requestPermission,
} from '@app/database/entries/entry.model';
import { tapError } from '@app/core/utils/tap-error.util';
import { MediaSessionService } from '@app/player/media-session.service';
import { Title } from '@angular/platform-browser';
import { EntryFacade } from '@app/database/entries/entry.facade';
import { SongFacade } from '@app/database/songs/song.facade';
import { concatTap, shuffleArray } from '@app/core/utils';

// noinspection JSUnusedGlobalSymbols
@Injectable()
export class PlayerEffects implements OnRunEffects {
  // https://bugs.chromium.org/p/chromium/issues/detail?id=1146886&q=component%3ABlink%3EStorage%3EFileSystem&can=2
  handle?: any;

  play$ = createEffect(
    () =>
      this.player.getCurrentSong$().pipe(
        // distinctUntilChanged((s1, s2) => s1?.entryPath === s2?.entryPath),
        filter((song): song is SongId => !!song),
        tap(() => this.player.setLoading()),
        switchMap((entryPath) =>
          this.player.getPlaying$().pipe(
            first(),
            tap(() => this.player.pause()),
            concatMap((playing) =>
              this.entries.getByKey(entryPath).pipe(
                filter((entry): entry is FileEntry => !!entry),
                first(),
                tap((entry) => (this.handle = entry.handle)),
                concatMap((entry) =>
                  requestPermission(entry.handle).pipe(
                    tapError(() => this.player.hide()),
                    catchError(() => EMPTY),
                    concatMap(() => entry.handle.getFile()),
                    concatMap((file) => this.audio.setSrc(file)),
                    concatMap(() =>
                      this.songs.getByKey(entryPath).pipe(
                        filter((s): s is Song => !!s),
                        first(),
                        concatTap((song) => this.media.setMetadata(song)),
                        tap((song) =>
                          this.title.setTitle(
                            `${song.title} • ${song.artists[0].name} - MusicSource`
                          )
                        )
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
        ]).pipe(
          first(),
          concatMap(([hasNextSong, repeat]) => {
            if (repeat === 'once') {
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

  constructor(
    private actions$: Actions,
    private router: Router,
    private audio: AudioService,
    private player: PlayerFacade,
    private entries: EntryFacade,
    private songs: SongFacade,
    private media: MediaSessionService,
    private title: Title
  ) {}

  ngrxOnRunEffects(
    resolvedEffects$: Observable<EffectNotification>
  ): Observable<EffectNotification> {
    return resolvedEffects$;
  }
}
