import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Song, SongWithCover$ } from '@app/models/song.model';
import { Icons } from '@app/utils/icons.util';
import { hash } from '@app/utils/hash.util';
import { MatMenuTrigger } from '@angular/material/menu';
import { PlayerFacade } from '@app/store/player/player.facade';
import { ComponentHelperService } from '@app/services/component-helper.service';

@Component({
  selector: 'app-track-list-item',
  template: `
    <span class="index">
      <span>{{ trackNumber }}</span>
      <app-player-button
        class="player-button"
        size="small"
        [song]="song"
        [playlist]="playlist"
      ></app-player-button>
    </span>
    <span class="title">{{ song.title }}</span>
    <span class="controls">
      <button
        [class.liked]="!!song.likedOn"
        mat-icon-button
        [disableRipple]="true"
        (click)="toggleLiked(song)"
      >
        <app-icon
          [path]="!!song.likedOn ? icons.heart : icons.heartOutline"
        ></app-icon>
      </button>
      <button
        class="trigger"
        aria-label="Other actions"
        title="Other actions"
        mat-icon-button
        [disableRipple]="true"
        #trigger="matMenuTrigger"
        [matMenuTriggerFor]="menu"
        [matMenuTriggerData]="{ song: song }"
        (click)="menuOpened.emit(trigger); $event.stopPropagation()"
      >
        <app-icon [path]="icons.dotsVertical" [size]="24"></app-icon>
      </button>
    </span>
    <span class="duration">{{ song.duration | duration }}</span>
    <mat-menu #menu="matMenu" [hasBackdrop]="false" [overlapTrigger]="false">
      <ng-template matMenuContent>
        <button mat-menu-item (click)="playNext(song)">
          <app-icon [path]="icons.playlistPlay"></app-icon>
          <span>Play next</span>
        </button>
        <button mat-menu-item (click)="addToQueue(song)">
          <app-icon [path]="icons.playlistMusic"></app-icon>
          <span>Add to queue</span>
        </button>
        <button mat-menu-item (click)="addSongToPlaylist(song)">
          <app-icon [path]="icons.playlistPlus"></app-icon>
          <span>Add to playlist</span>
        </button>
      </ng-template>
    </mat-menu>
  `,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        flex: 0 0 58px;
        box-sizing: border-box;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding: 0 8px;
      }
      :host:last-of-type {
        border: none;
      }
      .index {
        color: #aaa;
        flex: 0 0 32px;
        line-height: 32px;
        margin-right: 24px;
        text-align: center;
        position: relative;
        border-radius: 4px;
        overflow: hidden;
      }
      .index app-player-button {
        color: white;
        position: absolute;
        top: -4px;
        left: -4px;
        opacity: 0;
      }
      :host:hover .index span,
      :host.cdk-focused .index span,
      :host.selected .index span {
        visibility: hidden;
      }
      .title {
        flex: 1 1 auto;
      }
      .controls {
        flex: 0 0 auto;
        margin-left: 16px;
        color: #aaa;
      }
      .controls button:not(.liked) {
        opacity: 0;
      }
      :host:hover .controls button,
      :host.cdk-focused .controls button,
      :host:hover app-player-button,
      :host.cdk-focused app-player-button,
      :host.selected app-player-button {
        opacity: 1;
      }
      .controls button:not(:last-of-type) {
        margin-right: 8px;
      }
      .duration {
        color: #aaa;
        flex: 0 0 54px;
        margin-left: 16px;
        text-align: right;
      }
      .mat-menu-item app-icon {
        margin-right: 16px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackListItemComponent {
  @Input() song!: SongWithCover$;
  @Input() playlist!: SongWithCover$[];

  @Input() trackNumber!: number;

  @Output() menuOpened = new EventEmitter<MatMenuTrigger>();

  icons = Icons;

  constructor(
    private player: PlayerFacade,
    private cdr: ChangeDetectorRef,
    private helper: ComponentHelperService
  ) {}

  getHash(s: string): string {
    return hash(s);
  }

  toggleLiked(song: SongWithCover$) {
    this.helper.toggleLikedSong(song).subscribe(() => this.cdr.markForCheck());
  }

  playNext(song: SongWithCover$): void {
    this.player.addToPlaylist([song], true);
    this.player.show();
  }

  addToQueue(song: SongWithCover$): void {
    this.player.addToPlaylist([song], false);
    this.player.show();
  }

  addSongToPlaylist(song: Song) {
    this.helper.addSongsToPlaylist([song]).subscribe();
  }
}
