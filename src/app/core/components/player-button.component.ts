import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { Icons } from '@app/core/utils';
import { SongWithCover$ } from '@app/database/song.model';
import { PlayerFacade } from '@app/player/store/player.facade';
import { first, map, switchMap, tap, throttleTime } from 'rxjs/operators';
import { combineLatest, Observable, of } from 'rxjs';

// https://github.com/angular/angular/issues/8785
@Component({
  selector: 'app-player-button',
  template: `
    <button
      mat-icon-button
      [ngClass]="[size, shape]"
      [class.playing]="isPlaying$ | async"
      (click)="toggle()"
      [disabled]="(isLoading$ | async) === true"
    >
      <ng-container *ngIf="(isLoading$ | async) === false">
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
      </ng-container>
    </button>
    <ng-container *ngIf="(isLoading$ | async) === true">
      <mat-spinner
        [class.outside]="spinnerPosition === 'outside'"
        [diameter]="
          (size === 'large' ? 70 : 28) + (spinnerPosition === 'outside' ? 8 : 0)
        "
        strokeWidth="2"
      ></mat-spinner>
    </ng-container>
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
        position: absolute;
        top: 0;
        left: 0;
        margin: 2px;
      }
      .mat-spinner.outside {
        position: absolute;
        top: -2px;
        left: -2px;
        margin: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerButtonComponent implements OnInit {
  @Input() song!: SongWithCover$;
  @Input() playlist!: SongWithCover$[];

  @Input() playlistMode = false;

  @Input()
  shape: 'round' | 'square' = 'round';

  @Input()
  size: 'small' | 'large' = 'small';
  @Input()
  spinnerPosition: 'outside' | 'inside' = 'inside';

  @Output() playlistPlayed = new EventEmitter<void>();

  @HostBinding('class.stopped')
  stopped = true;

  isPlaying$!: Observable<boolean>;
  isLoading$!: Observable<boolean>;
  isCurrent$!: Observable<boolean>;

  icons = Icons;

  constructor(private player: PlayerFacade) {}

  ngOnInit(): void {
    this.isCurrent$ = this.playlistMode
      ? this.player
          .getPlaylist$()
          .pipe(map((playlist) => playlist === this.playlist))
      : this.player
          .getCurrentSong$()
          .pipe(map((current) => current?.entryPath === this.song.entryPath));

    this.isPlaying$ = this.isCurrent$.pipe(
      switchMap((current) => (current ? this.player.getPlaying$() : of(false))),
      tap((playing) => (this.stopped = !playing))
    );

    this.isLoading$ = this.isCurrent$.pipe(
      switchMap((current) =>
        current
          ? this.player
              .getLoading$()
              .pipe(throttleTime(50, undefined, { trailing: true }))
          : of(false)
      )
    );
  }

  toggle(): void {
    combineLatest([this.isCurrent$, this.isPlaying$])
      .pipe(
        first(),
        tap(([isCurrent, isPlaying]) => {
          if (isCurrent) {
            if (isPlaying) {
              this.player.pause();
            } else {
              this.player.resume();
            }
          } else {
            this.player.setPlaying();
            this.player.setPlaylist(
              this.playlist,
              this.playlist.indexOf(this.song)
            );
            this.player.show();
            this.playlistPlayed.emit();
          }
        })
      )
      .subscribe();
  }
}
