import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Album } from '@app/models/album.model';
import { map } from 'rxjs/operators';
import { Song } from '@app/models/song.model';
import { Icons } from '@app/utils/icons.util';

export type AlbumPageInfo = {
  album: Album;
  songs: Song[];
  cover: string | undefined;
};

@Component({
  selector: 'app-album-page',
  template: `
    <ng-container *ngIf="info$ | async as info">
      <header>
        <app-container-page class="header-container">
          <div class="info">
            <div class="cover" style="--aspect-ratio:1">
              <img [src]="info.cover" alt="cover" />
            </div>
            <div class="metadata">
              <app-title [title]="info.album.name"></app-title>
              <p>
                Album •
                <a [routerLink]="['/', 'artist', info.album.artistId]">{{
                  info.album.artist
                }}</a>
                • {{ info.album.year }}
              </p>
              <p class="stats">
                {{ info.songs.length }} titres •
                {{ getLength(info.songs) }} minutes
              </p>
            </div>
          </div>
          <div class="actions">
            <button mat-stroked-button class="play-button">
              <app-icon [path]="icons.play"></app-icon>
              <span>PLAY</span>
            </button>
            <button mat-stroked-button class="shuffle-button">
              <app-icon [path]="icons.heartOutline"></app-icon>
              <span>ADD TO FAVORITES</span>
            </button>
            <app-menu [disableRipple]="true"></app-menu>
          </div>
        </app-container-page>
      </header>
      <app-container-page>
        <app-track-list [songs]="info.songs"></app-track-list>
      </app-container-page>
    </ng-container>
  `,
  styles: [
    `
      :host {
        display: block;
        padding-bottom: 64px;
      }
      header {
        display: flex;
        margin-top: -64px;
        margin-bottom: 64px;
        padding-top: 64px;
        background-color: #1d1d1d;
      }
      .header-container {
        min-height: 264px;
        margin-top: 64px;
        margin-bottom: 64px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        position: relative;
        box-sizing: border-box;
      }
      .cover {
        width: 264px;
        margin-right: 64px;
        border-radius: 4px;
        overflow: hidden;
      }
      .info {
        display: flex;
        align-items: center;
      }
      .metadata p {
        color: #aaa;
      }
      .metadata p a {
        text-decoration: none;
      }
      .metadata p a:hover {
        text-decoration: underline;
      }
      .stats {
        margin-top: 4px;
      }
      app-title {
        margin-bottom: 16px;
      }
      .actions {
        margin-top: 40px;
      }
      @media (min-width: 936px) {
        .header-container {
          padding-left: 312px;
        }
        .cover {
          position: absolute;
          top: 0;
          left: 0;
        }
      }
      button {
        padding: 0 32px;
        display: inline-flex;
        align-items: center;
      }
      button app-icon {
        margin-right: 8px;
      }
      .play-button {
        background-color: white;
        color: black;
        margin-right: 16px;
      }
      .shuffle-button {
        border-color: rgb(170, 170, 170);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlbumPageComponent implements OnInit {
  icons = Icons;
  info$!: Observable<AlbumPageInfo>;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.info$ = this.route.data.pipe(map((data) => data.info));
  }

  getLength(songs: Song[]): number {
    const sec = songs.reduce((acc, song) => acc + (song.duration || 0), 0);
    return Math.floor(sec / 60);
  }
}
