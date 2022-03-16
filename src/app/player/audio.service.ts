import { Inject, Injectable } from '@angular/core';
import {
  defer,
  from,
  Observable,
  of,
  ReplaySubject,
  shareReplay,
  Subject,
} from 'rxjs';
import { concatMap, map, tap } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { concatTap } from '@app/core/utils';

@Injectable()
export class AudioService {
  timeUpdate$: Subject<number> = new ReplaySubject(1);
  duration$: Subject<number> = new ReplaySubject(1);
  playing$: Subject<boolean> = new ReplaySubject(1);
  ended$: Subject<void> = new Subject();
  loading$: Subject<boolean> = new ReplaySubject(1);
  volume$: Subject<number> = new ReplaySubject(1);

  private audioContext$: Observable<{
    context: AudioContext;
    source: MediaElementAudioSourceNode;
    // gain: AudioWorkletNode;
    audio: HTMLMediaElement;
  }>;
  private audio!: HTMLMediaElement;
  private objectUrl!: string;

  constructor(@Inject(DOCUMENT) document: Document) {
    this.audioContext$ = defer(() => of(new AudioContext())).pipe(
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
      }),
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
        // this.context = context;
        //this.isInitialized = true;
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
      }),
      shareReplay(1)
    );

    // this.initialize()
    //   .pipe(
    //     tapError((e) => console.log(e)),
    //     tap(({ context, source, audio }) => {
    //       const body = document.querySelector('body');
    //       if (!body) {
    //         return;
    //       }
    //       body.appendChild(audio);
    //       // audio.setAttribute('controls', 'true');
    //       source./*connect(gain).*/ connect(context.destination);
    //       this.audio = audio;
    //       // this.audio.load();
    //       this.context = context;
    //       this.isInitialized = true;
    //
    //       // this.audioMotion = new AudioMotionAnalyzer(undefined, {
    //       //   source,
    //       //   audioCtx: context,
    //       //   radial: true,
    //       //   mode: 2,
    //       //   showScaleX: false,
    //       //   overlay: true,
    //       //   showBgColor: true,
    //       //   bgAlpha: 0.7,
    //       //   showPeaks: false,
    //       //   start: false,
    //       // });
    //     })
    //   )
    //   .subscribe();
  }

  setSrc(file: File): Observable<void> {
    return this.audioContext$.pipe(
      concatTap(({ context }) => from(context.resume())),
      tap(() => URL.revokeObjectURL(this.objectUrl)),
      tap(() => (this.objectUrl = URL.createObjectURL(file))),
      tap(() => (this.audio.src = this.objectUrl)),
      map(() => void 0)
    );
  }

  async reset() {
    this.audio.currentTime = 0;
    await this.audio.play();
  }

  seek(n: number): void {
    this.audio.currentTime = n;
  }

  pause(): void {
    if (this.audio) {
      this.audio.pause();
    }
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
}
