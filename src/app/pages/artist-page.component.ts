import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Icons } from '@app/utils/icons.util';
import { Observable } from 'rxjs';
import { Artist } from '@app/models/artist.model';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { AlbumWithCover } from '@app/models/album.model';
import { SongWithCover } from '@app/models/song.model';
import { hash } from '@app/utils/hash.util';

export type ArtistPageInfo = {
  artist: Artist;
  cover: string | undefined;
  albums$: Observable<AlbumWithCover[]>;
  foundOn$: Observable<AlbumWithCover[]>;
  songs$: Observable<SongWithCover[]>;
};

@Component({
  selector: 'app-artist-page',
  template: `
    <ng-container *ngIf="info$ | async as info">
      <header>
        <div
          class="cover"
          [style.backgroundImage]="'url(' + info.cover + ')'"
          *ngIf="info.cover"
        ></div>
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
      <app-container-page class="content">
        <app-title title="Songs" size="small"></app-title>
        <ng-container *ngIf="info.songs$ | async as songs">
          <app-song-list [songs]="songs"></app-song-list>
        </ng-container>
        <ng-container *ngIf="info.albums$ | async as albums">
          <app-title
            title="Albums"
            size="small"
            *ngIf="albums.length > 0"
          ></app-title>
          <app-h-list buttonsTopPosition="113px" *ngIf="albums.length > 0">
            <app-album
              appHListItem
              class="album"
              *ngFor="let album of albums"
              [name]="album.name"
              [year]="album.year"
              [cover]="album.cover"
              [albumRouterLink]="['/', 'album', album.hash]"
            >
            </app-album>
          </app-h-list>
        </ng-container>
        <ng-container *ngIf="info.foundOn$ | async as albums">
          <app-title
            title="Found in"
            size="small"
            *ngIf="albums.length > 0"
          ></app-title>
          <app-h-list buttonsTopPosition="113px" *ngIf="albums.length > 0">
            <app-album
              appHListItem
              class="album"
              *ngFor="let album of albums"
              [name]="album.name"
              [year]="album.year"
              [cover]="album.cover"
              [albumRouterLink]="['/', 'album', album.hash]"
              [artist]="
                album.albumArtist ||
                (album.artists.length > 1 ? 'Various artists' : undefined)
              "
              [artistRouterLink]="
                album.albumArtist
                  ? ['/', 'artist', getHash(album.albumArtist)]
                  : undefined
              "
            >
            </app-album>
          </app-h-list>
        </ng-container>
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
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
      }
      .header-container {
        padding-top: 332px;
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
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        filter: blur(2px);
        background-size: cover;
        background-position: center center;
      }
      .cover img {
        width: 100%;
      }
      app-title {
        margin-top: 64px;
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
      .content {
        padding-bottom: 128px;
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

  getHash(albumArtist: string) {
    return hash(albumArtist);
  }
}
