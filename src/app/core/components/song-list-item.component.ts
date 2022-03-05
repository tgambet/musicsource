import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { Song } from '@app/database/songs/song.model';
import { Icons } from '@app/core/utils/icons.util';
import { ComponentHelperService } from '@app/core/services/component-helper.service';
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
        [song]="song"
        [playlist]="playlist"
        *ngIf="song && playlist"
      ></app-player-button>
    </div>
    <span class="title">{{ song.title }}</span>
    <span class="artists">
      <ng-container *ngFor="let artist of song.tags.artists; let last = last">
        <a [routerLink]="['/', 'artist', getArtistId(artist)]">{{ artist }}</a>
        <span>{{ !last ? ', ' : '' }}</span>
      </ng-container>
    </span>
    <span class="album">
      <a [routerLink]="['/', 'album', song.album.id]">
        {{ song.album.title }}
      </a>
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
        width: 32px;
        margin-right: 16px;
        border-radius: 2px;
        overflow: hidden;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .cover app-player-button {
        position: absolute;
        top: -4px;
        left: -4px;
        opacity: 0;
        background-color: rgba(0, 0, 0, 0.75);
      }
      app-icon {
        color: grey;
      }
      .title {
        flex: 12 1 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-right: 8px;
      }
      .artists {
        margin-right: 8px;
      }
      .artists,
      .album {
        color: #aaa;
        flex: 9 1 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .duration {
        color: #aaa;
        flex: 0 0 54px;
        margin-left: 16px;
        text-align: right;
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
export class SongListItemComponent implements OnInit {
  @Input() song!: Song;
  @Input() playlist!: Song[];

  cover$!: Observable<string | undefined>;

  icons = Icons;

  constructor(
    private helper2: HelperFacade,
    private helper: ComponentHelperService,
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
    this.helper.playNext(song);
  }

  addToQueue(song: Song): void {
    this.helper.addToQueue(song);
  }

  addSongToPlaylist(song: Song): void {
    this.helper2.addSongsToPlaylist([song]);
  }
}
