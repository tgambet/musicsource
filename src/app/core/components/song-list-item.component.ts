import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { Song, SongId } from '@app/database/songs/song.model';
import { Icons } from '@app/core/utils/icons.util';
import { Observable } from 'rxjs';
import { PictureFacade } from '@app/database/pictures/picture.facade';
import { SongFacade } from '@app/database/songs/song.facade';
import { getArtistId } from '@app/database/artists/artist.model';
import { HelperFacade } from '@app/helper/helper.facade';

@Component({
  selector: 'app-song-list-item',
  template: `
    <div class="cover">
      <img
        *ngIf="cover$ | async as cover; else icon"
        [src]="cover"
        alt="cover"
      />
      <ng-template #icon>
        <app-icon [path]="icons.fileMusic" [size]="24"></app-icon>
      </ng-template>
      <app-player-button
        size="small"
        [queue]="queue"
        [index]="queue.indexOf(song.id)"
        *ngIf="queue"
      ></app-player-button>
    </div>
    <div class="meta">
      <span class="title">
        <span
          [title]="song.title"
          (click)="play(queue, queue.indexOf(song.id))"
        >
          {{ song.title }}
        </span>
      </span>
      <div class="meta-inner">
        <span class="artists">
          <ng-container
            *ngFor="let artist of song.tags.artists; let last = last"
          >
            <a
              [routerLink]="['/', 'artist', getArtistId(artist)]"
              [title]="artist"
              >{{ artist }}</a
            >
            <span>{{ !last ? ', ' : '' }}</span>
          </ng-container>
        </span>
        <span class="separator">•</span>
        <span class="album">
          <a
            [routerLink]="['/', 'album', song.album.id]"
            [title]="song.album.title"
          >
            {{ song.album.title }}
          </a>
        </span>
      </div>
    </div>
    <span class="controls">
      <button
        [class.liked]="!!song.likedOn"
        mat-icon-button
        [disableRipple]="true"
        (click)="toggleLiked(song)"
      >
        <app-icon
          [path]="!!song.likedOn ? icons.heart : icons.heartOutline"
          [class.accent]="!!song.likedOn"
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
        <button mat-menu-item [routerLink]="['/', 'album', song.album.id]">
          <app-icon [path]="icons.album"></app-icon>
          <span>Go to album</span>
        </button>
        <button
          mat-menu-item
          [routerLink]="['/', 'artist', song.artists[0].id]"
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
      }
      .cover {
        flex: 0 0 32px;
        width: 32px;
        margin-right: 16px;
        overflow: hidden;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 2px;
      }
      .cover app-player-button {
        position: absolute;
        /*top: -4px;*/
        /*left: -4px;*/
        opacity: 0;
        background-color: rgba(0, 0, 0, 0.75);
      }
      .meta {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .meta-inner {
        display: flex;
        flex-direction: row;
        color: #aaa;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      app-icon.accent {
        color: white;
      }
      .title {
        flex: 1 1 auto;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        /*margin-right: 8px;*/
        margin-bottom: 2px;
      }
      .title span {
        cursor: pointer;
      }
      .artists {
        /*margin-right: 8px;*/
      }
      .separator {
        margin: 0 6px;
      }
      .artists {
        flex: 0 0 auto;
      }
      .album {
        flex: 0 1 auto;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .duration {
        color: #aaa;
        flex: 0 0 54px;
        /*margin-left: 16px;*/
        text-align: right;
      }
      .controls {
        flex: 0 0 auto;
        margin-left: 16px;
        color: #aaa;
        display: none;
      }

      :host:hover .controls,
      :host.cdk-focused .controls {
        display: flex;
        flex-direction: row;
      }

      :host:hover app-player-button,
      :host.cdk-focused app-player-button,
      :host.selected app-player-button {
        opacity: 1;
      }
      .controls button:not(:last-of-type) {
        margin-right: 4px;
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
      @media (min-width: 935px) {
        .meta {
          flex-direction: row;
          flex: 1 1 auto;
        }
        .controls {
          display: flex;
        }
        .controls button:not(.liked) {
          opacity: 0;
        }
        :host:hover .controls button,
        :host.cdk-focused .controls button {
          opacity: 1;
        }
        .title {
          flex: 1 1 50%;
        }
        .meta-inner {
          flex: 1 1 50%;
        }
        .separator {
          display: none;
        }
        .artists,
        .album {
          flex: 1 1 50%;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SongListItemComponent implements OnInit {
  @Input() song!: Song;
  @Input() queue!: SongId[];

  cover$!: Observable<string | undefined>;

  icons = Icons;

  constructor(
    private helper: HelperFacade,
    private pictures: PictureFacade,
    private songs: SongFacade
  ) {}

  ngOnInit(): void {
    this.cover$ = this.pictures.getSongCover(this.song, 32);
  }

  getArtistId(name: string): string {
    return getArtistId(name);
  }

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
