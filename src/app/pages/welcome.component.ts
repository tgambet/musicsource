import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ScannerFacade } from '@app/store/scanner/scanner.facade';

@Component({
  selector: 'app-welcome',
  template: `
    <div class="bg"></div>
    <div class="action">
      <app-title title="MusicSource"></app-title>
      <p>
        Welcome to MusicSource! MusicSource is a serverless audio player for
        your music library right in your browser. Try it now!
      </p>
      <button (click)="scan()" mat-raised-button color="accent">
        SCAN MY MUSIC LIBRARY
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        position: relative;
      }
      .bg {
        background: url('/assets/welcome.jpg') no-repeat;
        background-size: cover;
        filter: blur(4px);
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: -1;
      }
      .action {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        background-color: #212121;
        border-radius: 8px;
        max-width: 325px;
        box-sizing: border-box;
      }
      p {
        text-align: center;
        margin: 8px 0 24px;
        line-height: 1.5;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeComponent {
  constructor(private scanner: ScannerFacade) {}

  scan() {
    this.scanner.openDirectory();
  }
}
