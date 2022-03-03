import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  selectCurrentIndex,
  selectCurrentSong,
  selectDuration,
  selectHasNextSong,
  selectHasPrevSong,
  selectLoading,
  selectMuted,
  selectPlaying,
  selectPlaylist,
  selectShow,
  selectVolume,
} from '@app/player/store/player.selectors';
import { Observable } from 'rxjs';
import { SongId } from '@app/database/songs/song.model';
import {
  addToPlaylist,
  hide,
  pause,
  resume,
  setCurrentIndex,
  setLoading,
  setNextIndex,
  setPlaying,
  setPlaylist,
  setPrevIndex,
  setVolume,
  show,
  shuffle,
  toggleMute,
} from '@app/player/store/player.actions';
import { AudioService } from '@app/player/audio.service';

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

  getPlaylist$(): Observable<SongId[]> {
    return this.store.select(selectPlaylist);
  }

  getCurrentIndex$(): Observable<number> {
    return this.store.select(selectCurrentIndex);
  }

  getCurrentSong$(): Observable<SongId | undefined> {
    return this.store.select(selectCurrentSong);
  }

  getPlaying$(): Observable<boolean> {
    return this.store.select(selectPlaying);
  }

  getLoading$(): Observable<boolean> {
    return this.store.select(selectLoading);
  }

  getMuted$(): Observable<boolean> {
    return this.store.select(selectMuted);
  }

  getVolume$(): Observable<number> {
    return this.store.select(selectVolume);
  }

  hasNextSong$(): Observable<boolean> {
    return this.store.select(selectHasNextSong);
  }

  hasPrevSong$(): Observable<boolean> {
    return this.store.select(selectHasPrevSong);
  }

  setPlaylist(playlist: SongId[], currentIndex = 0): void {
    this.store.dispatch(setPlaylist({ playlist, currentIndex }));
  }

  addToPlaylist(playlist: SongId[], next = false): void {
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

  setPlaying(playing = true): void {
    this.store.dispatch(setPlaying({ playing }));
  }

  setVolume(volume: number): void {
    this.store.dispatch(setVolume({ volume }));
  }

  resume(): void {
    this.store.dispatch(resume());
  }

  pause(): void {
    this.store.dispatch(pause());
  }

  setLoading(): void {
    this.store.dispatch(setLoading({ loading: true }));
  }

  show(): void {
    this.store.dispatch(show());
  }

  hide(): void {
    this.store.dispatch(setPlaylist({ playlist: [], currentIndex: 0 }));
    this.store.dispatch(hide());
  }

  shuffle(): void {
    this.store.dispatch(shuffle());
  }

  toggleMute(): void {
    this.store.dispatch(toggleMute());
  }
}
