import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Icons } from '../utils/icons.util';
import { SongWithCover$ } from '@app/models/song.model';
import { PlayerFacade } from '@app/store/player/player.facade';
import { first, switchMap, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export type PlayerState = 'playing' | 'loading' | 'stopped';

// https://github.com/angular/angular/issues/8785
@Component({
  selector: 'app-player-button',
  template: `
    <button
      mat-icon-button
      [ngClass]="[size, shape]"
      [class.playing]="isPlaying$ | async"
      (click)="toggle()"
    >
      <app-icon
        class="play-pause"
        [path]="(isPlaying$ | async) === false ? icons.play : icons.pause"
        [size]="size === 'large' ? 48 : 24"
      ></app-icon>
      <app-icon
        class="volume"
        *ngIf="(isPlaying$ | async) === true"
        [path]="icons.volumeHigh"
        [size]="size === 'large' ? 48 : 24"
      ></app-icon>
    </button>
    <!--<mat-spinner
      *ngIf="state === 'loading'"
      [diameter]="size === 'large' ? 70 : 38"
      strokeWidth="2"
    ></mat-spinner>-->
  `,
  styles: [
    `
      :host {
        display: block;
        position: relative;
        /* background-color: rgba(0, 0, 0, 0.5); */
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
        /*background-color: rgba(0, 0, 0, 0.33);*/
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
  @Input() song?: SongWithCover$;

  @Input()
  shape: 'round' | 'square' = 'round';

  @Input()
  size: 'small' | 'large' = 'small';

  @Output() playClicked = new EventEmitter<void>();
  @Output() pauseClicked = new EventEmitter<void>();

  icons = Icons;

  isPlaying$: Observable<boolean>;

  constructor(private player: PlayerFacade) {
    this.isPlaying$ = player
      .getCurrentSong$()
      .pipe(
        switchMap((current) =>
          current?.entryPath === this.song?.entryPath
            ? player.getPlaying$()
            : of(false)
        )
      );
  }

  toggle(): void {
    this.isPlaying$
      .pipe(
        first(),
        tap((playing) => {
          if (playing) {
            this.player.pause();
          } else {
            this.playClicked.emit();
          }
        })
      )
      .subscribe();
  }
}
