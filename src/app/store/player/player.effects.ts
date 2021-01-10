import { Injectable } from '@angular/core';
import {
  Actions,
  createEffect,
  EffectNotification,
  ofType,
  OnRunEffects,
} from '@ngrx/effects';
import { concat, Observable, of } from 'rxjs';
import {
  play,
  playAlbum,
  playPlaylist,
  setDuration,
  setPlaying,
  setPlaylist,
  show,
} from '@app/store/player/player.actions';
import { map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AudioService } from '@app/services/audio.service';
import { PlayerFacade } from '@app/store/player/player.facade';
import { LibraryFacade } from '@app/store/library/library.facade';
import { reduceArray } from '@app/utils/reduce-array.util';

@Injectable()
export class PlayerEffects implements OnRunEffects {
  // a$ = createEffect(() => this.actions$.pipe(ofType(play), switchMap()));

  // b$ = createEffect(() => )

  playing$ = createEffect(() =>
    this.audio.playing$.pipe(map((playing) => setPlaying({ playing })))
  );

  duration$ = createEffect(() =>
    this.audio.duration$.pipe(map((duration) => setDuration({ duration })))
  );

  // routing$ = createEffect(
  //   () =>
  //     this.router.events.pipe(
  //       filter((e): e is ActivationStart => e instanceof ActivationStart),
  //       filter((e) => e.snapshot.outlet === 'player'),
  //       tap((e) => {
  //         const typ = e.snapshot.url[0]?.path;
  //         const id = e.snapshot.url[1]?.path;
  //         const t = e.snapshot.url[1]?.parameterMap.get('t') || '1';
  //         console.log(t);
  //       })
  //     ),
  //   { dispatch: false }
  // );

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
          of(play())
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

  // playlist$ = createEffect(() =>
  //   this.router.events.pipe(
  //     filter((e): e is ActivationStart => e instanceof ActivationStart),
  //     filter((e) => e.snapshot.outlet === 'player'),
  //     concatMap((e) => {
  //       const typ = e.snapshot.url[0]?.path;
  //       const id = e.snapshot.url[1]?.path;
  //       const t = e.snapshot.url[1]?.parameterMap.get('t') || '1';
  //
  //       if (!typ || !id) {
  //         this.router.navigate(['/library']);
  //         return EMPTY;
  //       }
  //
  //       switch (typ) {
  //         case 'album':
  //           return this.library.getAlbumTracksByHash(id).pipe(
  //             map((playlist) =>
  //               setPlaylist({ playlist, currentIndex: +t - 1 })
  //             ),
  //             tapError(() => this.router.navigate(['/home'])),
  //             catchError(() => EMPTY)
  //           );
  //         default:
  //           return EMPTY;
  //       }
  //     })
  //   )
  // );

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
