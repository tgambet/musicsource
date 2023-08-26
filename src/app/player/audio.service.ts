import { Inject, Injectable } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import AudioMotionAnalyzer from 'audiomotion-analyzer';

@Injectable()
export class AudioService {
  timeUpdate$: Subject<number> = new ReplaySubject(1);
  duration$: Subject<number> = new ReplaySubject(1);
  playing$: Subject<boolean> = new ReplaySubject(1);
  ended$: Subject<void> = new Subject();
  loading$: Subject<boolean> = new ReplaySubject(1);
  volume$: Subject<number> = new ReplaySubject(1);

  readonly audioMotion!: AudioMotionAnalyzer;

  private readonly audio!: HTMLMediaElement;
  private objectUrl!: string;

  constructor(@Inject(DOCUMENT) document: Document) {
    const audio = document.createElement('audio');
    audio.addEventListener('timeupdate', () =>
      this.timeUpdate$.next(audio.currentTime),
    );
    audio.addEventListener('durationchange', () =>
      this.duration$.next(audio.duration),
    );
    audio.addEventListener('pause', () => this.playing$.next(false));
    audio.addEventListener('play', () => this.playing$.next(true));
    audio.addEventListener('ended', () => this.ended$.next());
    audio.addEventListener('loadstart', () => this.loading$.next(true));
    audio.addEventListener('canplay', () => this.loading$.next(false));
    audio.addEventListener('volumechange', (event) =>
      this.volume$.next((event.target as HTMLMediaElement)?.volume),
    );
    const body = document.querySelector('body');
    if (!body) {
      return;
    }
    body.appendChild(audio);
    this.audio = audio;
    this.audioMotion = new AudioMotionAnalyzer(undefined, {
      bgAlpha: 0.5,
      connectSpeakers: true,
      mode: 2,
      overlay: true,
      radial: true,
      showBgColor: true,
      showPeaks: false,
      showScaleX: false,
      source: audio,
      start: false,
      useCanvas: false,
    });

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

  setSrc(file: File): void {
    URL.revokeObjectURL(this.objectUrl);
    this.objectUrl = URL.createObjectURL(file);
    this.audio.src = this.objectUrl;
  }

  async reset() {
    this.audio.currentTime = 0;
    await this.audio.play();
  }

  seek(n: number): void {
    this.audio.currentTime = n;
  }

  pause(): void {
    this.audio?.pause();
  }

  setVolume(volume: number): void {
    this.audio.volume = volume;
  }

  toggleMute(): void {
    this.audio.muted = !this.audio.muted;
  }

  resume(): Promise<void> {
    if (this.audio.src) {
      return this.audio.play();
    } else {
      return Promise.resolve();
    }
  }
}
