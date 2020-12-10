import { Inject, Injectable } from '@angular/core';
import { defer, EMPTY, from, Observable, of } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { tapError } from '@app/utils/tap-error.util';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  isInitialized = false;

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
          audio.setAttribute('controls', 'true');
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
      }),
      // tap(() => (this.audio.srcObject = file)),
      concatMap(() => this.audio.play())
    );
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
        const source = context.createMediaElementSource(audio);
        return of({ context, source /*, gain*/, audio });
        //})
      })
    );
  }
}
