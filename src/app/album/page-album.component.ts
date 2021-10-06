import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Album } from '@app/database/albums/album.model';
import { first, map, shareReplay, tap } from 'rxjs/operators';
import { Song } from '@app/database/songs/song.model';
import { Icons } from '@app/core/utils/icons.util';
import { hash } from '@app/core/utils/hash.util';
import { PlayerFacade } from '@app/player/store/player.facade';
import { MenuItem } from '@app/core/components/menu.component';
import { LibraryFacade } from '@app/library/store/library.facade';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ComponentHelperService } from '@app/core/services/component-helper.service';
import { HistoryService } from '@app/core/services/history.service';
import { WithTrigger } from '@app/core/classes/with-trigger';
import { AlbumFacade } from '@app/database/albums/album.facade';
import { PictureFacade } from '@app/database/pictures/picture.facade';

export type PageAlbumData = {
  album: Album;
  // songs: Song[];
  // cover: string | undefined;
};

@Component({
  selector: 'app-page-album',
  template: `
    <header>
      <app-container-page class="header-container">
        <div class="info">
          <div class="cover" style="--aspect-ratio:1">
            <img
              [src]="cover"
              alt="cover"
              *ngIf="cover$ | async as cover; else icon"
            />
            <ng-template #icon>
              <app-icon [path]="icons.album" [fullWidth]="true"></app-icon>
            </ng-template>
          </div>
          <div class="metadata">
            <app-title>{{ album.name }}</app-title>
            <p>
              <span>Album</span> •
              <a
                *ngIf="album.albumArtist"
                [routerLink]="['/', 'artist', getHash(album.albumArtist)]"
                >{{ album.albumArtist }}</a
              >
              <span *ngIf="!album.albumArtist && album.artists.length > 1">
                Various artists
              </span>
              • <span>{{ album.year }}</span>
            </p>
            <p class="stats" *ngIf="songs$ | async as songs">
              {{ songs.length }} songs • {{ getLength(songs) }} minutes
            </p>
          </div>
        </div>
        <div class="actions">
          <button mat-raised-button color="accent" (click)="play(album)">
            <app-icon [path]="icons.play"></app-icon>
            <span>Play</span>
          </button>
          <button mat-stroked-button (click)="toggleLiked(album)">
            <app-icon
              [path]="!!album.likedOn ? icons.heart : icons.heartOutline"
            ></app-icon>
            <span *ngIf="!album.likedOn">Add to your likes</span>
            <span *ngIf="!!album.likedOn">Remove from your likes</span>
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
      <div class="track-list" *ngIf="songs$ | async as songs">
        <app-track-list-item
          [song]="song"
          [playlist]="songs"
          *ngFor="let song of songs; let i = index; trackBy: trackBy"
          [trackNumber]="i + 1"
          [class.selected]="(currentSongPath$ | async) === song.entryPath"
          (menuOpened)="menuOpened($event)"
          cdkMonitorSubtreeFocus
        ></app-track-list-item>
      </div>
    </app-container-page>
  `,
  styleUrls: ['../core/styles/page-header.component.scss'],
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
export class PageAlbumComponent extends WithTrigger implements OnInit {
  icons = Icons;
  album!: Album;

  songs$!: Observable<Song[]>;

  currentSongPath$ = this.player
    .getCurrentSong$()
    .pipe(map((song) => song?.entryPath));

  cover$!: Observable<string | undefined>;

  menuItems$!: Observable<MenuItem[]>;

  constructor(
    private route: ActivatedRoute,
    private player: PlayerFacade,
    private library: LibraryFacade,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private helper: ComponentHelperService,
    private cdr: ChangeDetectorRef,
    private history: HistoryService,
    private albums: AlbumFacade,
    private pictures: PictureFacade
  ) {
    super();
  }

  @HostListener('window:scroll')
  @HostListener('click')
  closeMenu(): void {
    super.closeMenu();
  }

  trackBy(index: number, song: Song): string {
    return song.entryPath;
  }

  ngOnInit(): void {
    this.album = this.route.snapshot.data.info.album; //pipe(map((data) => data.info));

    this.cover$ = this.pictures.getCover(this.album.pictureKey);

    this.songs$ = this.library.getAlbumTracks(this.album).pipe(
      // tap(() => console.log(1)),
      shareReplay(1)
    );

    this.menuItems$ = this.songs$.pipe(
      map((songs) => this.getMenuItem(this.album, songs))
    );
  }

  getMenuItem(album: Album, songs: Song[]): MenuItem[] {
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

  getHash(albumArtist: string): string {
    return hash(albumArtist);
  }

  play(album: Album, index = 0): void {
    this.songs$
      .pipe(
        first(),
        tap((songs) => {
          this.player.setPlaying();
          this.player.setPlaylist(songs, index);
          this.player.show();
          this.history.albumPlayed(album);
        })
      )
      .subscribe();
  }

  addAlbumToPlaylist(songs: Song[]): void {
    this.helper.addSongsToPlaylist(songs);
  }

  toggleLiked(album: Album): void {
    this.albums.toggleLiked(album);
    // .subscribe(() => this.cdr.markForCheck());
  }
}
