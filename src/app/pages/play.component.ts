import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerService } from '@app/services/player.service';
import { hash } from '@app/utils/hash.util';
import { Icons } from '@app/utils/icons.util';

@Component({
  selector: 'app-play',
  template: `
    <div class="large-cover">
      <ng-container *ngIf="currentSong$ | async as currentSong">
        <div
          class="img"
          *ngIf="currentSong.cover$ | async as cover"
          [style.backgroundImage]="'url(' + cover + ')'"
        ></div>
      </ng-container>
    </div>
    <div class="playlist">
      <div class="playlist-container" *ngIf="playlist$ | async as playlist">
        <div
          class="song"
          *ngFor="let song of playlist; let i = index"
          cdkMonitorSubtreeFocus
        >
          <div class="cover" style="--aspect-ratio:1">
            <img
              *ngIf="song.cover$ | async as cover"
              [src]="cover"
              alt="cover"
            />
            <app-player-button
              size="small"
              shape="square"
              (playClicked)="play(i)"
            ></app-player-button>
          </div>
          <div class="meta">
            <span class="title">{{ song.title }}</span>
            <span class="artists">
              <ng-container
                *ngFor="let artist of song.artists; let last = last"
              >
                <a [routerLink]="['/', 'artist', getHash(artist)]">{{
                  artist
                }}</a>
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
            >
              <app-icon [path]="icons.dotsVertical" [size]="24"></app-icon>
            </button>
          </span>
          <mat-menu
            #menu="matMenu"
            [hasBackdrop]="false"
            [overlapTrigger]="false"
          >
            <ng-template matMenuContent>
              <button mat-menu-item>
                <app-icon [path]="icons.radio"></app-icon>
                <span>Start radio</span>
              </button>
              <button mat-menu-item>
                <app-icon [path]="icons.playlistPlay"></app-icon>
                <span>Play next</span>
              </button>
              <button mat-menu-item>
                <app-icon [path]="icons.playlistMusic"></app-icon>
                <span>Add to queue</span>
              </button>
              <button mat-menu-item>
                <app-icon [path]="icons.playlistPlus"></app-icon>
                <span>Add to playlist</span>
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
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        background: black;
        flex-grow: 1;
        padding: 64px 96px 0;
        box-sizing: border-box;
      }
      .large-cover {
        flex: 1 1 calc(100vh - 218px);
        padding-bottom: 64px;
        width: 100%;
        position: relative;
      }
      .img {
        height: 100%;
        width: 100%;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
      }
      .playlist {
        flex: 0 0 620px;
        padding-left: 96px;
        position: relative;
      }
      .playlist-container {
        position: absolute;
        height: 100%;
        overflow-y: auto;
        left: 96px;
        right: 0;
      }
      .song {
        display: flex;
        align-items: center;
        padding: 0 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        height: 56px;
      }
      .song:last-of-type {
        border: none;
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

      .song:hover .duration,
      .controls {
        display: none;
      }

      .song:hover .controls,
      .duration {
        display: flex;
      }

      :host:hover .controls button,
      :host.cdk-focused .controls button,
      .song:hover app-player-button,
      .song.cdk-focused app-player-button {
        opacity: 1;
      }
      a[href] {
        text-decoration: none;
      }
      a[href]:hover {
        text-decoration: underline;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayComponent implements OnInit {
  currentSong$ = this.player.currentSong$;

  playlist$ = this.player.songs$;

  icons = Icons;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private player: PlayerService
  ) {}

  ngOnInit(): void {
    if (this.route.snapshot.parent?.children[1]?.outlet !== 'player') {
      this.router.navigate(['/', 'home']);
    }
  }

  getHash(artist: string) {
    return hash(artist);
  }

  async play(index: number) {
    await this.player.playIndex(index).toPromise();
    await this.player.resume();
  }
}
