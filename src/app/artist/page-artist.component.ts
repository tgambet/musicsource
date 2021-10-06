import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import { Icons } from '@app/core/utils/icons.util';
import { Observable } from 'rxjs';
import { Artist } from '@app/database/artists/artist.model';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { Album } from '@app/database/albums/album.model';
import { Song } from '@app/database/songs/song.model';
import { hash } from '@app/core/utils/hash.util';
import { ComponentHelperService } from '@app/core/services/component-helper.service';
import { HistoryService } from '@app/core/services/history.service';
import { WithTrigger } from '@app/core/classes/with-trigger';
import { ArtistFacade } from '@app/database/artists/artist.facade';

export type PageArtistData = {
  artist: Artist;
  cover: string | undefined;
  albums$: Observable<Album[]>;
  foundOn$: Observable<Album[]>;
  songs$: Observable<Song[]>;
};

@Component({
  selector: 'app-page-artist',
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
          <app-title>{{ info.artist.name }}</app-title>
          <div class="actions">
            <button
              mat-raised-button
              color="accent"
              (click)="shufflePlay(info.artist)"
            >
              <app-icon [path]="icons.shuffle"></app-icon>
              <span>Shuffle</span>
            </button>
            <!--            <button mat-raised-button color="accent">
              <app-icon [path]="icons.radio"></app-icon>
              <span>Radio</span>
            </button>-->
            <button mat-stroked-button (click)="toggleLiked(info.artist)">
              <app-icon
                [path]="
                  !!info.artist.likedOn ? icons.heart : icons.heartOutline
                "
              ></app-icon>
              <span *ngIf="!info.artist.likedOn">Add to your likes</span>
              <span *ngIf="!!info.artist.likedOn">Remove from your likes</span>
            </button>
            <!--<app-menu [disableRipple]="true"></app-menu>-->
          </div>
        </app-container-page>
      </header>
      <app-container-page class="content">
        <app-title size="small">Songs</app-title>
        <ng-container *ngIf="info.songs$ | async as songs">
          <app-song-list [songs]="songs"></app-song-list>
        </ng-container>
        <ng-container *ngIf="info.albums$ | async as albums">
          <app-title size="small" *ngIf="albums.length > 0">Albums</app-title>
          <app-h-list buttonsTopPosition="113px" *ngIf="albums.length > 0">
            <app-album
              appHListItem
              class="album"
              *ngFor="let album of albums"
              [album]="album"
              (menuOpened)="menuOpened($event)"
            >
            </app-album>
          </app-h-list>
        </ng-container>
        <ng-container *ngIf="info.foundOn$ | async as albums">
          <app-title size="small" *ngIf="albums.length > 0">Found in</app-title>
          <app-h-list buttonsTopPosition="113px" *ngIf="albums.length > 0">
            <app-album
              appHListItem
              class="album"
              *ngFor="let album of albums"
              [album]="album"
              (menuOpened)="menuOpened($event)"
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
export class PageArtistComponent extends WithTrigger implements OnInit {
  icons = Icons;
  info$!: Observable<PageArtistData>;

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private helper: ComponentHelperService,
    private history: HistoryService,
    private artists: ArtistFacade
  ) {
    super();
  }

  @HostListener('click')
  @HostListener('window:scroll')
  closeMenu(): void {
    super.closeMenu();
  }

  ngOnInit(): void {
    this.info$ = this.route.data.pipe(map((data) => data.info));
  }

  getHash(albumArtist: string): string {
    return hash(albumArtist);
  }

  shufflePlay(artist: Artist): void {
    this.helper.shufflePlayArtist(artist).subscribe();
    this.history.artistPlayed(artist);
  }

  toggleLiked(artist: Artist): void {
    this.artists.toggleLiked(artist);
  }
}
