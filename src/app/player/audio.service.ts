import { Inject, Injectable } from '@angular/core';
import {
  defer,
  EMPTY,
  from,
  Observable,
  of,
  ReplaySubject,
  Subject,
} from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { tapError } from '@app/core/utils/tap-error.util';

@Injectable()
export class AudioService {
  isInitialized = false;

  timeUpdate$: Subject<number> = new ReplaySubject(1);
  duration$: Subject<number> = new ReplaySubject(1);
  playing$: Subject<boolean> = new ReplaySubject(1);
  ended$: Subject<void> = new Subject();
  loading$: Subject<boolean> = new ReplaySubject(1);
  volume$: Subject<number> = new ReplaySubject(1);

  private context!: AudioContext;
  private audio!: HTMLMediaElement;

  private objectUrl!: string;

  constructor(@Inject(DOCUMENT) document: Document) {
    this.initialize()
      .pipe(
        tapError((e) => console.log(e)),
        tap(({ context, source, audio }) => {
          const body = document.querySelector('body');
          if (!body) {
            return;
          }
          body.appendChild(audio);
          // audio.setAttribute('controls', 'true');
          source./*connect(gain).*/ connect(context.destination);
          this.audio = audio;
          // this.audio.load();
          this.context = context;
          this.isInitialized = true;

          // this.audioMotion = new AudioMotionAnalyzer(undefined, {
          //   source,
          //   audioCtx: context,
          //   radial: true,
          //   mode: 2,
          //   showScaleX: false,
          //   overlay: true,
          //   showBgColor: true,
          //   bgAlpha: 0.7,
          //   showPeaks: false,
          //   start: false,
          // });
        })
      )
      .subscribe();
  }

  setSrc(file: File): Observable<void> {
    if (!this.isInitialized) {
      console.warn('AudioService not initialized!');
      return EMPTY;
    }
    return defer(() => from(this.context.resume())).pipe(
      tap(() => URL.revokeObjectURL(this.objectUrl)),
      tap(() => {
        this.objectUrl = URL.createObjectURL(file);
        this.audio.src = this.objectUrl;
      })
    );
  }

  seek(n: number): void {
    this.audio.currentTime = n;
  }

  pause(): void {
    this.audio.pause();
  }

  setVolume(volume: number): void {
    this.audio.volume = volume;
  }

  toggleMute(): void {
    this.audio.muted = !this.audio.muted;
  }

  async resume(): Promise<void> {
    if (this.audio.src) {
      await this.audio.play();
    }
  }

  private initialize(): Observable<{
    context: AudioContext;
    source: MediaElementAudioSourceNode;
    // gain: AudioWorkletNode;
    audio: HTMLMediaElement;
  }> {
    return defer(() => of(new AudioContext())).pipe(
      concatMap((context) => {
        // context.audioWorklet.addModule('/worklets/test.worker.js').then(() => {
        // const gain = new AudioWorkletNode(context, 'test-processor');
        const audio = document.createElement('audio');
        audio.addEventListener('timeupdate', () =>
          this.timeUpdate$.next(audio.currentTime)
        );
        audio.addEventListener('durationchange', () =>
          this.duration$.next(audio.duration)
        );
        audio.addEventListener('pause', () => this.playing$.next(false));
        audio.addEventListener('play', () => this.playing$.next(true));
        audio.addEventListener('ended', () => this.ended$.next());
        audio.addEventListener('loadstart', () => this.loading$.next(true));
        audio.addEventListener('canplay', () => this.loading$.next(false));
        audio.addEventListener('volumechange', (event) =>
          this.volume$.next((event.target as HTMLMediaElement)?.volume)
        );
        const source = context.createMediaElementSource(audio);
        return of({ context, source /*, gain*/, audio });
        //})
      })
    );
  }
}
