import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Song, SongId } from '@app/database/songs/song.model';
import { Icons } from '@app/core/utils/icons.util';
import { PlayerFacade } from '@app/player/store/player.facade';
import { SongFacade } from '@app/database/songs/song.facade';
import { HelperFacade } from '@app/helper/helper.facade';

@Component({
  selector: 'app-track-list-item',
  template: `
    <span class="index">
      <span>{{ trackNumber || '-' }}</span>
      <app-player-button
        class="player-button"
        size="small"
        [index]="queue.indexOf(song.id)"
        [queue]="queue"
      ></app-player-button>
    </span>
    <span class="title">
      <span [title]="song.title" (click)="play(queue, queue.indexOf(song.id))">
        {{ song.title }}
      </span>
    </span>
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
        (click)="$event.stopPropagation()"
      >
        <app-icon [path]="icons.dotsVertical" [size]="24"></app-icon>
      </button>
    </span>
    <span class="duration">{{ song.duration | duration }}</span>
    <mat-menu #menu="matMenu" [overlapTrigger]="true">
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
        font-size: 14px;
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
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-right: 16px;
      }
      .title span {
        cursor: pointer;
      }
      .controls {
        flex: 0 0 auto;
        margin-left: 16px;
        color: #aaa;
        display: flex;
      }
      .controls button {
        justify-content: center;
      }
      .controls button {
        display: none;
      }
      .controls button.liked {
        color: white;
      }
      @media (min-width: 935px) {
        .controls button.liked {
          display: flex;
        }
        .controls button.liked ~ button {
          display: flex;
          opacity: 0;
        }
      }
      :host:hover .controls button,
      :host.cdk-focused .controls button {
        display: flex;
        opacity: 1 !important;
      }
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
        text-align: right;
      }
      .mat-menu-item app-icon {
        margin-right: 16px;
      }
      @media (min-width: 1290px) {
        :host {
          font-size: 16px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackListItemComponent {
  @Input() song!: Song;
  @Input() queue!: SongId[];

  @Input() trackNumber!: number | null;

  icons = Icons;

  constructor(
    private player: PlayerFacade,
    private helper: HelperFacade,
    private songs: SongFacade,
  ) {}

  toggleLiked(song: Song): void {
    this.songs.toggleLiked(song);
  }

  playNext(song: Song): void {
    this.helper.addSongToQueue(song.id, true);
  }

  addToQueue(song: Song): void {
    this.helper.addSongToQueue(song.id, false);
  }

  addSongToPlaylist(song: Song): void {
    this.helper.addSongsToPlaylist([song.id]);
  }

  play(queue: SongId[], index: number) {
    this.helper.playQueue(queue, index);
  }
}
