import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { Icons } from '@app/core/utils/icons.util';
import { SongWithCover$ } from '@app/core/song/song.model';
import { hash } from '@app/core/utils/hash.util';
import { MatMenuTrigger } from '@angular/material/menu';
import { ComponentHelperService } from '@app/core/services/component-helper.service';

@Component({
  selector: 'app-playlist-list-item',
  template: `
    <div class="cover" style="--aspect-ratio:1">
      <img *ngIf="song.cover$ | async as cover" [src]="cover" alt="cover" />
      <app-player-button
        size="small"
        [song]="song"
        [playlist]="playlist"
      ></app-player-button>
    </div>
    <div class="meta">
      <span class="title">{{ song.title }}</span>
      <span class="artists">
        <ng-container *ngFor="let artist of song.artists; let last = last">
          <a [routerLink]="['/', 'artist', getHash(artist)]">{{ artist }}</a>
          <span>{{ !last ? ', ' : '' }}</span>
        </ng-container>
      </span>
    </div>
    <span class="duration">{{ song.duration | duration }}</span>
    <span class="controls">
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
        <button mat-menu-item (click)="toggleLiked(song)">
          <app-icon
            [path]="!!song.likedOn ? icons.heart : icons.heartOutline"
          ></app-icon>
          <span *ngIf="!song.likedOn">Add to your likes</span>
          <span *ngIf="!!song.likedOn">Remove from your likes</span>
        </button>
        <button mat-menu-item (click)="addToPlaylist(song)">
          <app-icon [path]="icons.playlistPlus"></app-icon>
          <span>Add to playlist</span>
        </button>
        <button mat-menu-item (click)="removeFromQueue(song)">
          <app-icon [path]="icons.minusCircleOutline"></app-icon>
          <span>Remove from queue</span>
        </button>
        <button
          mat-menu-item
          [routerLink]="['/', 'album', getHash(song.album)]"
          *ngIf="song.album"
        >
          <app-icon [path]="icons.album"></app-icon>
          <span>Go to album</span>
        </button>
        <button
          mat-menu-item
          [routerLink]="['/', 'artist', getHash(song.artist)]"
          *ngIf="song.artist"
        >
          <app-icon [path]="icons.accountMusic"></app-icon>
          <span>Go to artist</span>
        </button>
      </ng-template>
    </mat-menu>
  `,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        padding: 0 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        cursor: move;
      }
      .cover {
        width: 32px;
        margin-right: 16px;
        border-radius: 2px;
        overflow: hidden;
        position: relative;
      }
      .cover app-player-button {
        position: absolute;
        top: -4px;
        left: -4px;
        opacity: 0;
        background-color: rgba(0, 0, 0, 0.75);
      }
      .meta {
        display: flex;
        flex-direction: column;
        margin-right: auto;
      }
      .title {
        font-weight: 500;
      }
      .artists {
        color: #aaa;
        margin-top: 4px;
      }
      .duration {
        color: #aaa;
      }
      .controls {
        color: #aaa;
      }

      :host:hover .duration,
      .controls {
        display: none;
      }

      :host:hover .controls,
      .duration {
        display: flex;
      }

      :host:hover .controls button,
      :host.cdk-focused .controls button,
      :host:hover app-player-button,
      :host.cdk-focused app-player-button,
      :host.selected app-player-button {
        opacity: 1;
      }
      a[href] {
        text-decoration: none;
      }
      a[href]:hover {
        text-decoration: underline;
      }
      .mat-menu-item app-icon {
        margin-right: 16px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistListItemComponent {
  @Input() song!: SongWithCover$;
  @Input() playlist!: SongWithCover$[];

  @Output() menuOpened = new EventEmitter<MatMenuTrigger>();

  icons = Icons;

  constructor(
    private helper: ComponentHelperService,
    private cdr: ChangeDetectorRef
  ) {}

  getHash(s: string): string {
    return hash(s);
  }

  playNext(song: SongWithCover$): void {
    this.helper.playNext(song);
  }

  addToQueue(song: SongWithCover$): void {
    this.helper.addToQueue(song);
  }

  toggleLiked(song: SongWithCover$): void {
    this.helper.toggleLikedSong(song).subscribe(() => this.cdr.markForCheck());
  }

  addToPlaylist(song: SongWithCover$): void {
    this.helper.addSongsToPlaylist([song]).subscribe();
  }

  removeFromQueue(song: SongWithCover$): void {
    this.helper.removeFromQueue(song);
  }
}
