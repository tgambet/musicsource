import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { concatMap, Observable, ReplaySubject, share, switchMap } from 'rxjs';
import { Album, AlbumId } from '@app/database/albums/album.model';
import { filter, first, map, tap } from 'rxjs/operators';
import { Song } from '@app/database/songs/song.model';
import { Icons } from '@app/core/utils/icons.util';
import { PlayerFacade } from '@app/player/store/player.facade';
import { MenuItem } from '@app/core/components/menu.component';
import { ComponentHelperService } from '@app/core/services/component-helper.service';
import { WithTrigger } from '@app/core/classes/with-trigger';
import { AlbumFacade } from '@app/database/albums/album.facade';
import { PictureFacade } from '@app/database/pictures/picture.facade';
import { SongFacade } from '@app/database/songs/song.facade';

@Component({
  selector: 'app-page-album',
  template: `
    <ng-container *ngIf="album$ | async as album">
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
              <app-title>{{ album.title }}</app-title>
              <p>
                <span>Album</span> •
                <a
                  *ngIf="album.artistId"
                  [routerLink]="['/', 'artist', album.artistId]"
                  >{{ album.artist }}</a
                >
                <!--                <span *ngIf="!album.albumArtist && album.artists.length > 1">-->
                <!--                  Various artists-->
                <!--                </span>-->
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
              [menuItems]="menuItems"
            ></app-menu>
          </div>
        </app-container-page>
      </header>
      <app-container-page>
        <div class="track-list" *ngIf="songs$ | async as songs">
          <app-track-list-item
            [song]="song"
            [playlist]="songs"
            *ngFor="let song of songs; trackBy: trackBy"
            [trackNumber]="song.tags.track.no"
            [class.selected]="(currentSongPath$ | async) === song.entryPath"
            (menuOpened)="menuOpened($event)"
            cdkMonitorSubtreeFocus
          ></app-track-list-item>
        </div>
      </app-container-page>
    </ng-container>
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
  album$!: Observable<Album>;

  songs$!: Observable<Song[]>;

  currentSongPath$ = this.player
    .getCurrentSong$()
    .pipe(map((song) => song?.entryPath));

  cover$!: Observable<string | undefined>;

  menuItems!: MenuItem[];

  icons = Icons;

  constructor(
    private route: ActivatedRoute,
    private player: PlayerFacade,
    // private snack: MatSnackBar,
    // private dialog: MatDialog,
    private helper: ComponentHelperService,
    // private history: HistoryService,
    private albums: AlbumFacade,
    private pictures: PictureFacade,
    private songs: SongFacade
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
    const albumKey = this.route.snapshot.data.info as AlbumId;

    this.album$ = this.albums.getByKey(albumKey) as Observable<Album>;

    this.cover$ = this.album$.pipe(
      switchMap((album) => this.pictures.getCover(album.pictureId))
    );

    this.songs$ = this.album$.pipe(
      first(),
      concatMap((album) => this.songs.getByAlbumKey(album.id)),
      filter((songs): songs is Song[] => !!songs),
      share({
        connector: () => new ReplaySubject(1),
        resetOnRefCountZero: true,
      })
    );

    this.menuItems = this.getMenuItem();
  }

  play(album: Album, index = 0): void {
    this.songs$
      .pipe(
        first(),
        tap((songs) => {
          this.player.setPlaying();
          this.player.setPlaylist(songs, index);
          this.player.show();
          // this.history.albumPlayed(album);
        })
      )
      .subscribe();
  }

  shufflePlay(): void {
    this.songs$
      .pipe(
        first(),
        tap((songs) => {
          this.player.setPlaying();
          this.player.setPlaylist(songs);
          this.player.shuffle();
          this.player.show();
          // this.history.albumPlayed(album);
        })
      )
      .subscribe();
  }

  addToQueue(next?: boolean): void {
    this.songs$
      .pipe(
        first(),
        tap((songs) => {
          this.player.addToPlaylist(songs, next);
          this.player.show();
        })
      )
      .subscribe();
  }

  addToPlaylist(): void {
    this.songs$
      .pipe(
        first(),
        tap((songs) => this.helper.addSongsToPlaylist(songs))
      )
      .subscribe();
  }

  getMenuItem(): MenuItem[] {
    return [
      {
        text: 'Shuffle play',
        icon: this.icons.shuffle,
        click: () => this.shufflePlay(),
      },
      {
        text: 'Play next',
        icon: this.icons.playlistPlay,
        click: () => this.addToQueue(true),
      },
      {
        text: 'Add to queue',
        icon: this.icons.playlistMusic,
        click: () => this.addToQueue(),
      },
      {
        text: 'Add to playlist',
        icon: this.icons.playlistPlus,
        click: () => this.addToPlaylist(),
      },
    ];
  }

  getLength(songs: Song[]): number {
    const sec = songs.reduce((acc, song) => acc + (song.duration || 0), 0);
    return Math.floor(sec / 60);
  }

  toggleLiked(album: Album): void {
    this.albums.toggleLiked(album);
  }
}
