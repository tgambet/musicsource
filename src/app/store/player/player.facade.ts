import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  selectCurrentIndex,
  selectCurrentSong,
  selectDuration,
  selectHasNextSong,
  selectHasPrevSong,
  selectPlaying,
  selectPlaylist,
  selectShow,
} from '@app/store/player/player.selectors';
import { Observable } from 'rxjs';
import { SongWithCover$ } from '@app/models/song.model';
import {
  addToPlaylist,
  hide,
  pause,
  play,
  setCurrentIndex,
  setNextIndex,
  setPlaying,
  setPlaylist,
  setPrevIndex,
  show,
  shuffle,
} from '@app/store/player/player.actions';
import { AudioService } from '@app/services/audio.service';

@Injectable()
export class PlayerFacade {
  constructor(private store: Store, private audio: AudioService) {}

  seek(n: number): void {
    this.audio.seek(n);
  }

  isShown$(): Observable<boolean> {
    return this.store.select(selectShow);
  }

  getTimeUpdate$(): Observable<number> {
    return this.audio.timeUpdate$.asObservable();
  }

  getDuration$(): Observable<number> {
    return this.store.select(selectDuration);
  }

  getPlaylist$(): Observable<SongWithCover$[]> {
    return this.store.select(selectPlaylist);
  }

  getCurrentIndex$(): Observable<number | undefined> {
    return this.store.select(selectCurrentIndex);
  }

  getCurrentSong$(): Observable<SongWithCover$ | undefined> {
    return this.store.select(selectCurrentSong);
  }

  getPlaying$(): Observable<boolean> {
    return this.store.select(selectPlaying);
  }

  hasNextSong$(): Observable<boolean> {
    return this.store.select(selectHasNextSong);
  }

  hasPrevSong$(): Observable<boolean> {
    return this.store.select(selectHasPrevSong);
  }

  setPlaylist(playlist: SongWithCover$[], currentIndex = 0): void {
    this.store.dispatch(setPlaylist({ playlist, currentIndex }));
  }

  addToPlaylist(playlist: SongWithCover$[], next = false): void {
    this.store.dispatch(addToPlaylist({ playlist, next }));
  }

  setCurrentIndex(index: number): void {
    this.store.dispatch(setCurrentIndex({ index }));
  }

  setNextIndex(): void {
    this.store.dispatch(setNextIndex());
  }

  setPrevIndex(): void {
    this.store.dispatch(setPrevIndex());
  }

  setPlaying(playing: boolean): void {
    this.store.dispatch(setPlaying({ playing }));
  }

  play(): void {
    this.store.dispatch(play());
  }

  pause(): void {
    this.store.dispatch(pause());
  }

  show(): void {
    this.store.dispatch(show());
  }

  hide(): void {
    this.store.dispatch(setPlaylist({ playlist: [], currentIndex: 0 }));
    this.store.dispatch(hide());
  }

  shuffle() {
    this.store.dispatch(shuffle());
  }
}
