import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { Icons } from '@app/core/utils/icons.util';
import { EMPTY, Observable, switchMap } from 'rxjs';
import { Artist, ArtistId } from '@app/database/artists/artist.model';
import { ActivatedRoute } from '@angular/router';
import { Album } from '@app/database/albums/album.model';
import { Song } from '@app/database/songs/song.model';
import { HistoryService } from '@app/core/services/history.service';
import { ArtistFacade } from '@app/database/artists/artist.facade';
import { AlbumFacade } from '@app/database/albums/album.facade';
import { PictureFacade } from '@app/database/pictures/picture.facade';
import { HelperFacade } from '@app/helper/helper.facade';
import { first, map } from 'rxjs/operators';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-page-artist',
  template: `
    <ng-container *ngIf="artist$ | async as artist">
      <header>
        <div
          class="cover"
          [style.backgroundImage]="'url(' + cover + ')'"
          *ngIf="cover$ | async as cover"
        ></div>
        <div class="shadow"></div>
        <app-container-page class="header-container">
          <h1>{{ artist.name }}</h1>
          <div class="actions">
            <button
              mat-raised-button
              color="accent"
              (click)="shufflePlay(artist)"
            >
              <app-icon [path]="icons.shuffle"></app-icon>
              <span>Shuffle</span>
            </button>
            <!--            <button mat-raised-button color="accent">
              <app-icon [path]="icons.radio"></app-icon>
              <span>Radio</span>
            </button>-->
            <button mat-stroked-button (click)="toggleLiked(artist)">
              <app-icon
                [path]="!!artist.likedOn ? icons.heart : icons.heartOutline"
              ></app-icon>
              <span *ngIf="!artist.likedOn">Add to your likes</span>
              <span *ngIf="!!artist.likedOn">Remove from your likes</span>
            </button>
            <!--<app-menu [disableRipple]="true"></app-menu>-->
          </div>
        </app-container-page>
      </header>
      <app-container-page class="content">
        <ng-container *ngIf="songs$ | async as songs">
          <app-title size="small">Songs</app-title>
          <app-song-list [songs]="songs"></app-song-list>
        </ng-container>
        <ng-container *ngIf="albums$ | async as albums">
          <app-title size="small" *ngIf="albums.length > 0">Albums</app-title>
          <app-h-list
            [buttonsTopPosition]="buttonTopPosition$ | async"
            *ngIf="albums.length > 0"
            [overflow]="overflow$ | async"
          >
            <app-album
              appHListItem
              class="album"
              *ngFor="let album of albums"
              [album]="album"
            >
            </app-album>
          </app-h-list>
        </ng-container>
        <ng-container *ngIf="foundOn$ | async as albums">
          <app-title size="small" *ngIf="albums.length > 0">Found in</app-title>
          <app-h-list
            [buttonsTopPosition]="buttonTopPosition$ | async"
            *ngIf="albums.length > 0"
            [overflow]="overflow$ | async"
          >
            <app-album
              appHListItem
              class="album"
              *ngFor="let album of albums"
              [album]="album"
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
        margin-bottom: 48px;
        padding-top: 64px;
        background-color: #1d1d1d;
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
      }
      h1 {
        font-family: 'YT Sans', sans-serif;
        font-size: 24px;
        line-height: 28px;
        margin-bottom: 16px;
      }
      .header-container {
        transition:
          padding-top 200ms ease,
          width 200ms ease;
        padding-top: 64px;
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
        background-image: linear-gradient(
          to bottom,
          rgba(0, 0, 0, 0.5),
          transparent 64px,
          rgba(0, 0, 0, 0) 60%,
          rgba(0, 0, 0, 1) 100%
        );
        background-color: rgba(0, 0, 0, 0.4);
      }
      .cover {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        /* filter: blur(2px);*/
        background-size: cover;
        background-position: top center;
      }
      .cover img {
        width: 100%;
      }
      app-title {
        margin-top: 48px;
        margin-bottom: 16px;
      }
      button {
        padding: 0 32px;
        display: inline-flex;
        align-items: center;
        margin-right: 8px;
        border-color: rgb(170, 170, 170) !important;
        border-radius: 2px;
        text-transform: uppercase;
      }
      button span {
        display: inline-block;
        line-height: 24px;
      }
      button app-icon {
        margin-right: 8px;
      }
      .album {
        margin: 0 16px 0 0;
        /*width: 226px;*/
        width: 160px;
      }
      .album:last-of-type {
        margin-right: 0;
      }
      .content {
        padding-bottom: 128px;
      }
      @media (min-width: 615px) {
        .header-container {
          padding-top: 146px;
        }
        .album {
          width: 180px;
        }
      }
      @media (min-width: 1150px) {
        .header-container {
          padding-top: 228px;
        }
        h1 {
          font-size: 28px;
          line-height: 32px;
        }
        .album {
          margin: 0 24px 0 0;
          width: 226px;
        }
      }
      @media (min-width: 1290px) {
        h1 {
          font-size: 34px;
          line-height: 40px;
        }
        .header-container {
          padding-top: 300px;
        }
      }
      @media (min-width: 1536px) {
        h1 {
          font-size: 45px;
          line-height: 54px;
        }
        .header-container {
          padding-top: 400px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageArtistComponent implements OnInit {
  icons = Icons;

  artist$!: Observable<Artist>;
  cover$!: Observable<string | undefined>;
  albums$!: Observable<Album[] | undefined>;
  foundOn$!: Observable<Album[] | undefined>;
  songs$!: Observable<Song[] | undefined>;

  buttonTopPosition$: Observable<string>;
  overflow$!: Observable<'visible' | 'hidden'>;

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private history: HistoryService,
    private artists: ArtistFacade,
    private pictures: PictureFacade,
    private albums: AlbumFacade,
    private helper: HelperFacade,
    private breakpointObserver: BreakpointObserver,
  ) {
    /*
    const Breakpoints = {
    XSmall: '(max-width: 599.98px)',
    Small: '(min-width: 600px) and (max-width: 959.98px)',
    Medium: '(min-width: 960px) and (max-width: 1279.98px)',
    Large: '(min-width: 1280px) and (max-width: 1919.98px)',
    XLarge: '(min-width: 1920px)',
    Handset: '(max-width: 599.98px) and (orientation: portrait), ' +
        '(max-width: 959.98px) and (orientation: landscape)',
    Tablet: '(min-width: 600px) and (max-width: 839.98px) and (orientation: portrait), ' +
        '(min-width: 960px) and (max-width: 1279.98px) and (orientation: landscape)',
    Web: '(min-width: 840px) and (orientation: portrait), ' +
        '(min-width: 1280px) and (orientation: landscape)',
    HandsetPortrait: '(max-width: 599.98px) and (orientation: portrait)',
    TabletPortrait: '(min-width: 600px) and (max-width: 839.98px) and (orientation: portrait)',
    WebPortrait: '(min-width: 840px) and (orientation: portrait)',
    HandsetLandscape: '(max-width: 959.98px) and (orientation: landscape)',
    TabletLandscape: '(min-width: 960px) and (max-width: 1279.98px) and (orientation: landscape)',
    WebLandscape: '(min-width: 1280px) and (orientation: landscape)',
    };
    */
    this.buttonTopPosition$ = breakpointObserver
      .observe(['(min-width: 615px)', '(min-width: 1150px)'])
      .pipe(
        map((state) =>
          state.breakpoints[Object.keys(state.breakpoints)[1]]
            ? '113px'
            : state.breakpoints[Object.keys(state.breakpoints)[0]]
            ? '90px'
            : '80px',
        ),
      );

    this.overflow$ = breakpointObserver
      .observe(['(min-width: 1150px)'])
      .pipe(map((state) => (state.matches ? 'hidden' : 'visible')));
  }

  ngOnInit(): void {
    const artistKey = this.route.snapshot.data.info as ArtistId;

    this.artist$ = this.artists.getByKey(artistKey) as Observable<Artist>;

    this.cover$ = this.artist$.pipe(
      first(),
      switchMap((artist) => this.pictures.getArtistCover(artist.id, 0)),
    );

    this.albums$ = this.albums.getByArtistKey(artistKey); // TODO hash vs name

    this.foundOn$ = this.albums.getWithArtist(artistKey); // TODO hash vs name

    this.songs$ = EMPTY; // this.songs.getByAlbumKey(''); // TODO
  }

  shufflePlay(artist: Artist): void {
    this.helper.playArtist(artist.id);
  }

  toggleLiked(artist: Artist): void {
    this.artists.toggleLiked(artist);
  }
}
