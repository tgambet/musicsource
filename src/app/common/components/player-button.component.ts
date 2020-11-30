import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';
import { Icons } from '../icons';

// https://github.com/angular/angular/issues/8785
@Component({
  selector: 'app-player-button',
  template: `
    <button
      class="play"
      mat-icon-button
      (click)="playClicked.emit()"
      *ngIf="state === 'stopped' || state === 'loading'"
      [disabled]="state === 'loading'"
    >
      <app-icon
        [path]="icons.play"
        [size]="size === 'large' ? 48 : 24"
      ></app-icon>
    </button>
    <button
      class="pause"
      mat-icon-button
      *ngIf="state === 'playing'"
      (click)="pauseClicked.emit()"
    >
      <app-icon
        [path]="icons.pause"
        [size]="size === 'large' ? 48 : 24"
      ></app-icon>
    </button>
    <app-icon
      class="volume"
      *ngIf="state === 'playing'"
      [path]="icons.volumeHigh"
      [size]="size === 'large' ? 48 : 24"
    ></app-icon>
    <mat-spinner
      *ngIf="state === 'loading'"
      [diameter]="size === 'large' ? 70 : 46"
      strokeWidth="2"
    ></mat-spinner>
  `,
  styles: [
    `
      :host {
        position: relative;
        height: 100%;
        display: block;
        border: 4px solid black;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.5);
      }
      :host.large {
        width: 64px;
        height: 64px;
      }
      :host.small {
        width: 40px;
        height: 40px;
      }
      button:not([disabled]):hover {
        background-color: rgba(0, 0, 0, 0.33);
      }
      .pause {
        display: none;
      }
      .volume {
        padding: 8px;
      }
      :host:hover .pause {
        display: inline-block;
      }
      :host:hover .volume {
        display: none;
      }
      :host button {
        width: 100%;
        height: 100%;
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
  @HostBinding('class')
  @Input()
  size: 'small' | 'large' = 'small';
  @Input()
  state: 'playing' | 'loading' | 'stopped' = 'stopped';
  @Output() playClicked = new EventEmitter<void>();
  @Output() pauseClicked = new EventEmitter<void>();
  icons = Icons;
}
