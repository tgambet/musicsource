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
import { AudioService } from '@app/player/audio.service';
import { PlayerFacade } from '@app/player/store/player.facade';
import { EntryFacade } from '@app/database/entries/entry.facade';
import { SongFacade } from '@app/database/songs/song.facade';
import {
  addToPlaylist,
  setPlaying,
  setPlaylist,
  show,
} from '@app/player/store/player.actions';
import { filter } from 'rxjs/operators';
import { Song } from '@app/database/songs/song.model';
import { shuffleArray } from '@app/core/utils';
import { addAlbumToQueue, playAlbum } from '@app/helper/helper.actions';

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

  constructor(
    private actions$: Actions,
    private router: Router,
    private audio: AudioService,
    private player: PlayerFacade,
    private entries: EntryFacade,
    private songs: SongFacade
  ) {}

  ngrxOnRunEffects(
    resolvedEffects$: Observable<EffectNotification>
  ): Observable<EffectNotification> {
    return resolvedEffects$;
  }
}
