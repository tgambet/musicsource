import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Icons } from '../utils/icons.util';

export type PlayerState = 'playing' | 'loading' | 'stopped';

// https://github.com/angular/angular/issues/8785
@Component({
  selector: 'app-player-button',
  template: `
    <button mat-icon-button [ngClass]="[size, state, shape]" (click)="toggle()">
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
      [diameter]="size === 'large' ? 70 : 38"
      strokeWidth="2"
    ></mat-spinner>
  `,
  styles: [
    `
      :host {
        display: block;
        position: relative;
        background-color: rgba(0, 0, 0, 0.5);
        border: 4px solid transparent;
        box-sizing: border-box;
      }
      .large {
        width: 64px;
        height: 64px;
      }
      .small {
        width: 32px;
        height: 32px;
        line-height: 32px;
      }
      .square {
        border-radius: 0;
      }
      .round {
        border-radius: 50%;
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
  shape: 'round' | 'square' = 'round';
  @Input()
  size: 'small' | 'large' = 'small';
  @Input()
  state: PlayerState = 'stopped';
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
