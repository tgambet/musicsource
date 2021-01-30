import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Album } from '@app/models/album.model';
import { map } from 'rxjs/operators';
import { Song, SongWithCover$ } from '@app/models/song.model';
import { Icons } from '@app/utils/icons.util';
import { hash } from '@app/utils/hash.util';
import { PlayerFacade } from '@app/store/player/player.facade';
import { MenuItem } from '@app/components/menu.component';
import { MatMenuTrigger } from '@angular/material/menu';
import { LibraryFacade } from '@app/store/library/library.facade';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ComponentHelperService } from '@app/services/component-helper.service';
import { HistoryService } from '@app/services/history.service';

export type PageAlbumData = {
  album: Album;
  songs: SongWithCover$[];
  cover: string | undefined;
};

@Component({
  selector: 'app-page-album',
  template: `
    <ng-container *ngIf="info$ | async as info">
      <header>
        <app-container-page class="header-container">
          <div class="info">
            <div class="cover" style="--aspect-ratio:1">
              <img [src]="info.cover" alt="cover" *ngIf="info.cover" />
              <app-icon
                [path]="icons.album"
                [fullWidth]="true"
                *ngIf="!info.cover"
              ></app-icon>
            </div>
            <div class="metadata">
              <app-title>{{ info.album.name }}</app-title>
              <p>
                <span>Album</span> •
                <a
                  *ngIf="info.album.albumArtist"
                  [routerLink]="[
                    '/',
                    'artist',
                    getHash(info.album.albumArtist)
                  ]"
                  >{{ info.album.albumArtist }}</a
                >
                <span
                  *ngIf="
                    !info.album.albumArtist && info.album.artists.length > 1
                  "
                >
                  Various artists
                </span>
                • <span>{{ info.album.year }}</span>
              </p>
              <p class="stats">
                {{ info.songs.length }} songs •
                {{ getLength(info.songs) }} minutes
              </p>
            </div>
          </div>
          <div class="actions">
            <button
              mat-raised-button
              color="accent"
              (click)="play(info.album, info.songs)"
            >
              <app-icon [path]="icons.play"></app-icon>
              <span>Play</span>
            </button>
            <button mat-stroked-button (click)="toggleLiked(info.album)">
              <app-icon
                [path]="!!info.album.likedOn ? icons.heart : icons.heartOutline"
              ></app-icon>
              <span *ngIf="!info.album.likedOn">Add to your likes</span>
              <span *ngIf="!!info.album.likedOn">Remove from your likes</span>
            </button>
            <app-menu
              [disableRipple]="true"
              [hasBackdrop]="true"
              [menuItems]="menuItems$ | async"
            ></app-menu>
          </div>
        </app-container-page>
      </header>
      <app-container-page>
        <div class="track-list">
          <app-track-list-item
            [song]="song"
            [playlist]="info.songs"
            *ngFor="let song of info.songs; let i = index"
            [trackNumber]="i + 1"
            [class.selected]="(currentSongPath$ | async) === song.entryPath"
            (menuOpened)="menuOpened($event)"
            cdkMonitorSubtreeFocus
          ></app-track-list-item>
        </div>
      </app-container-page>
    </ng-container>
  `,
  styleUrls: ['../styles/page-header.component.scss'],
  styles: [
    `
      .cover app-icon {
        color: rgba(255, 255, 255, 0.4);
      }
      .track-list {
        display: flex;
        flex-direction: column;
      }
      app-track-list-item.selected {
        background-color: rgba(255, 255, 255, 0.1);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageAlbumComponent implements OnInit {
  icons = Icons;
  info$!: Observable<PageAlbumData>;

  currentSongPath$ = this.player
    .getCurrentSong$()
    .pipe(map((song) => song?.entryPath));

  menuItems$!: Observable<MenuItem[]>;

  trigger?: MatMenuTrigger;

  constructor(
    private route: ActivatedRoute,
    private player: PlayerFacade,
    private library: LibraryFacade,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private helper: ComponentHelperService,
    private cdr: ChangeDetectorRef,
    private history: HistoryService
  ) {}

  @HostListener('window:scroll')
  @HostListener('click')
  closeMenu() {
    if (this.trigger) {
      this.trigger.closeMenu();
      this.trigger = undefined;
    }
  }

  menuOpened(trigger: MatMenuTrigger) {
    if (this.trigger && this.trigger !== trigger) {
      this.trigger.closeMenu();
    }
    this.trigger = trigger;
  }

  trackBy(index: number, song: SongWithCover$): string {
    return song.entryPath;
  }

  ngOnInit(): void {
    this.info$ = this.route.data.pipe(map((data) => data.info));
    this.menuItems$ = this.info$.pipe(
      map((info) => this.getMenuItem(info.album, info.songs))
    );
  }

  getMenuItem(album: Album, songs: SongWithCover$[]): MenuItem[] {
    return [
      {
        text: 'Shuffle play',
        icon: this.icons.shuffle,
        click: () => {
          this.player.setPlaying();
          this.player.setPlaylist(songs);
          this.player.shuffle();
          this.player.show();
          this.history.albumPlayed(album);
        },
      },
      {
        text: 'Play next',
        icon: this.icons.playlistPlay,
        click: () => {
          this.player.addToPlaylist(songs, true);
          this.player.show();
        },
      },
      {
        text: 'Add to queue',
        icon: this.icons.playlistMusic,
        click: () => {
          this.player.addToPlaylist(songs);
          this.player.show();
        },
      },
      {
        text: 'Add to playlist',
        icon: this.icons.playlistPlus,
        click: () => this.addAlbumToPlaylist(songs),
      },
    ];
  }

  getLength(songs: Song[]): number {
    const sec = songs.reduce((acc, song) => acc + (song.duration || 0), 0);
    return Math.floor(sec / 60);
  }

  getHash(albumArtist: string) {
    return hash(albumArtist);
  }

  play(album: Album, songs: SongWithCover$[], index = 0) {
    this.player.setPlaying();
    this.player.setPlaylist(songs, index);
    this.player.show();
    this.history.albumPlayed(album);
  }

  addAlbumToPlaylist(songs: Song[]) {
    this.helper.addSongsToPlaylist(songs).subscribe();
  }

  toggleLiked(album: Album) {
    this.helper
      .toggleLikedAlbum(album)
      .subscribe(() => this.cdr.markForCheck());
  }
}
