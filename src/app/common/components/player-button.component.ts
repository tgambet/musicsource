import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Icons } from '../icons';

// https://github.com/angular/angular/issues/8785
@Component({
  selector: 'app-player-button',
  template: `
    <button mat-icon-button [ngClass]="[size, state]" (click)="toggle()">
      <app-icon
        class="play-pause"
        [path]="
          state === 'stopped' || state === 'loading' ? icons.play : icons.pause
        "
        [size]="size === 'large' ? 48 : 24"
      ></app-icon>
      <app-icon
        class="volume"
        *ngIf="state === 'playing'"
        [path]="icons.volumeHigh"
        [size]="size === 'large' ? 48 : 24"
      ></app-icon>
    </button>
    <mat-spinner
      *ngIf="state === 'loading'"
      [diameter]="size === 'large' ? 70 : 46"
      strokeWidth="2"
    ></mat-spinner>
  `,
  styles: [
    `
      :host {
        display: block;
        position: relative;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.5);
      }
      .large {
        width: 64px;
        height: 64px;
      }
      .small {
        width: 40px;
        height: 40px;
      }
      button:not(.disabled):hover {
        background-color: rgba(0, 0, 0, 0.33);
      }
      button.loading {
        color: #999;
      }
      button.playing .play-pause {
        display: none;
      }
      button.playing:hover .play-pause,
      button.playing:focus .play-pause {
        display: inline-flex;
      }
      button.playing:hover .volume,
      button.playing:focus .volume {
        display: none;
      }
      .mat-spinner {
        top: -3px;
        left: -3px;
        position: absolute;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerButtonComponent {
  @Input()
  size: 'small' | 'large' = 'small';
  @Input()
  state: 'playing' | 'loading' | 'stopped' = 'stopped';
  @Output() playClicked = new EventEmitter<void>();
  @Output() pauseClicked = new EventEmitter<void>();
  icons = Icons;

  toggle(): void {
    return this.state === 'playing'
      ? this.pauseClicked.emit()
      : this.state !== 'loading'
      ? this.playClicked.emit()
      : void 0;
  }
}
