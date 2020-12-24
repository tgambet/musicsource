import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Icons } from '@app/utils/icons.util';
import { Observable } from 'rxjs';
import { Artist } from '@app/models/artist.model';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { AlbumWithCover } from '@app/models/album.model';
import { Song } from '@app/models/song.model';

export type ArtistPageInfo = {
  artist: Artist;
  cover: string | undefined;
  albums$: Observable<AlbumWithCover[]>;
  songs$: Observable<Song[]>;
};

@Component({
  selector: 'app-artist-page',
  template: `
    <ng-container *ngIf="info$ | async as info">
      <header>
        <div class="cover">
          <img [src]="info.cover" alt="cover" />
        </div>
        <div class="shadow"></div>
        <app-container-page class="header-container">
          <app-title [title]="info.artist.name"></app-title>
          <div class="actions">
            <button mat-stroked-button class="primary">
              <app-icon [path]="icons.shuffle"></app-icon>
              <span>SHUFFLE</span>
            </button>
            <button mat-stroked-button class="primary">
              <app-icon [path]="icons.radio"></app-icon>
              <span>RADIO</span>
            </button>
            <button mat-stroked-button>
              <app-icon [path]="icons.heartOutline"></app-icon>
              <span>ADD TO FAVORITES</span>
            </button>
            <app-menu [disableRipple]="true"></app-menu>
          </div>
        </app-container-page>
      </header>
      <app-container-page>
        <app-title [title]="'Songs'" size="small"></app-title>
        <ng-container *ngIf="info.songs$ | async as songs">
          <app-song-list [songs]="songs"></app-song-list>
        </ng-container>
        <app-title [title]="'Albums'" size="small"></app-title>
        <app-h-list buttonsTopPosition="113px">
          <app-album
            appHListItem
            class="album"
            *ngFor="let album of info.albums$ | async"
            [name]="album.name"
            [artist]="album.year?.toString(10)"
            [cover]="album.cover"
            [albumRouterLink]="['/', 'album', album.id]"
          >
          </app-album>
        </app-h-list>
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
        height: 668px;
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
      }
      .header-container {
        margin-top: 64px;
        margin-bottom: 8px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        position: relative;
        box-sizing: border-box;
        z-index: 2;
      }
      .shadow {
        height: 100%;
        width: 100%;
        position: absolute;
        top: 0;
        z-index: 1;
        background: linear-gradient(
          to top,
          rgba(0, 0, 0, 1),
          transparent 33%,
          transparent 87%,
          rgba(0, 0, 0, 0.5) 100%
        );
      }
      .cover {
        position: absolute;
        top: -50%;
        left: 0;
        width: 100%;
        filter: blur(2px);
      }
      .cover img {
        width: 100%;
      }
      app-title {
        margin-bottom: 16px;
      }
      button {
        padding: 0 32px;
        display: inline-flex;
        align-items: center;
        margin-right: 8px;
        border-color: rgb(170, 170, 170) !important;
      }
      button app-icon {
        margin-right: 8px;
      }
      button.primary {
        background-color: white;
        color: black;
      }
      .album {
        margin: 0 24px 0 0;
        width: 226px;
      }
      .album:last-of-type {
        margin-right: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArtistPageComponent implements OnInit {
  icons = Icons;
  info$!: Observable<ArtistPageInfo>;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.info$ = this.route.data.pipe(map((data) => data.info));
  }
}
