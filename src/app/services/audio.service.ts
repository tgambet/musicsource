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
import { tapError } from '@app/utils/tap-error.util';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  isInitialized = false;

  timeUpdate$: Subject<number> = new ReplaySubject(1);
  duration$: Subject<number> = new ReplaySubject(1);
  playing$: Subject<boolean> = new ReplaySubject(1);

  private context!: AudioContext;
  private audio!: HTMLMediaElement;
  private objectUrl!: string;

  constructor(@Inject(DOCUMENT) document: Document) {
    this.playing$.next(false);

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
        })
      )
      .subscribe();
  }

  play(file: File): Observable<void> {
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
      // tap(() => (this.audio.srcObject = file)),
      // concatMap(() => this.audio.play())
    );
  }

  seek(n: number) {
    this.audio.currentTime = n;
  }

  pause(): void {
    this.audio.pause();
  }

  async resume(file?: File) {
    if (this.audio.src) {
      await this.audio.play();
    } else if (file) {
      await this.play(file).toPromise();
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
        const source = context.createMediaElementSource(audio);
        return of({ context, source /*, gain*/, audio });
        //})
      })
    );
  }
}
