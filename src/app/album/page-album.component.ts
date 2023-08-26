import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  groupBy,
  Observable,
  of,
  reduce,
  ReplaySubject,
  share,
  switchMap,
} from 'rxjs';
import { Album, AlbumId } from '@app/database/albums/album.model';
import { filter, map, mergeMap } from 'rxjs/operators';
import { Song, SongId } from '@app/database/songs/song.model';
import { Icons } from '@app/core/utils/icons.util';
import { PlayerFacade } from '@app/player/store/player.facade';
import { MenuItem } from '@app/core/components/menu.component';
import { AlbumFacade } from '@app/database/albums/album.facade';
import { PictureFacade } from '@app/database/pictures/picture.facade';
import { SongFacade } from '@app/database/songs/song.facade';
import { HelperFacade } from '@app/helper/helper.facade';

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
              <h1>{{ album.title }}</h1>
              <p>
                <span>Album</span> •
                <a [routerLink]="['/', 'artist', album.albumArtist.id]">{{
                  album.albumArtist.name
                }}</a>
                <!--                <span *ngIf="!album.albumArtist && album.artists.length > 1">-->
                <!--                  Various artists-->
                <!--                </span>-->
                • <span>{{ album.year }}</span>
              </p>
              <p class="stats">
                <ng-container *ngIf="stats$ | async as stats">
                  {{ stats.n }} songs • {{ stats.length }} minutes
                </ng-container>
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
              [menuItems]="menuItems$ | async"
            ></app-menu>
          </div>
        </app-container-page>
      </header>
      <app-container-page>
        <div class="track-list" *ngIf="disks$ | async as disks">
          <ng-container *ngFor="let disk of disks; trackBy: trackByDisk">
            <app-title size="small" *ngIf="disks.length > 1" class="disk-title">
              Disk {{ disk.key }}
            </app-title>
            <div class="track-list-container">
              <app-track-list-item
                *ngFor="let song of disk.songs; trackBy: trackBy"
                [song]="song"
                [queue]="getIds(disk.songs)"
                [trackNumber]="song.tags.track.no"
                [class.selected]="(currentSongPath$ | async) === song.id"
                cdkMonitorSubtreeFocus
              ></app-track-list-item>
            </div>
          </ng-container>
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
      .stats {
        height: 19px;
      }
      .track-list-container {
        display: flex;
        flex-direction: column;
        margin-bottom: 2em;
      }
      .track-list-container:last-of-type {
        margin-bottom: 0;
      }
      app-track-list-item.selected {
        background-color: rgba(255, 255, 255, 0.1);
      }
      .disk-title {
        margin-bottom: 16px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageAlbumComponent implements OnInit {
  album$!: Observable<Album>;

  songs$!: Observable<Song[]>;

  stats$!: Observable<{ n: number; length: number }>;

  disks$!: Observable<
    {
      key: number | null;
      songs: Song[];
    }[]
  >;

  currentSongPath$ = this.player.getCurrentSong$().pipe(
    filter((id): id is SongId => !!id),
    switchMap((path) => this.songs.getByKey(path)),
    map((song) => song?.id),
  );

  cover$!: Observable<string | undefined>;

  menuItems$!: Observable<MenuItem[]>;

  icons = Icons;

  constructor(
    private route: ActivatedRoute,
    private player: PlayerFacade,
    private helper: HelperFacade,
    private albums: AlbumFacade,
    private pictures: PictureFacade,
    private songs: SongFacade,
  ) {}

  trackBy(index: number, song: Song): string {
    return song.id;
  }

  trackByDisk(index: number, disk: { key: number | null }): number {
    return disk.key || 0;
  }

  ngOnInit(): void {
    const albumKey = this.route.snapshot.data.info as AlbumId;

    this.album$ = this.albums
      .getByKey(albumKey)
      .pipe(filter((a): a is Album => !!a));

    this.cover$ = this.album$.pipe(
      switchMap((album) => this.pictures.getAlbumCover(album.id, 264)),
    );

    this.songs$ = this.album$.pipe(
      switchMap((album) => this.songs.getByAlbumKey(album.id)),
      filter((songs): songs is Song[] => !!songs),
      map((songs) =>
        [...songs].sort(
          (s1, s2) => (s1.tags.disk.no || 0) - (s2.tags.disk.no || 0),
        ),
      ),
      share({
        connector: () => new ReplaySubject(1),
        resetOnRefCountZero: true,
      }),
    );

    this.stats$ = this.songs$.pipe(
      map((songs) => ({
        length: this.getLength(songs),
        n: songs.length,
      })),
    );

    this.disks$ = this.songs$.pipe(
      switchMap((s) =>
        of(...s).pipe(
          groupBy((song) => song.tags.disk.no),
          mergeMap((group$) =>
            group$.pipe(
              reduce((acc, cur) => [...acc, cur], [] as Song[]),
              map((songs) => ({ key: group$.key, songs })),
            ),
          ),
          reduce(
            (acc, cur) => [...acc, cur],
            [] as { key: number | null; songs: Song[] }[],
          ),
        ),
      ),
    );

    this.menuItems$ = this.album$.pipe(
      map((album) => [
        {
          text: 'Shuffle play',
          icon: this.icons.shuffle,
          click: () => this.helper.playAlbum(album.id, true),
        },
        {
          text: 'Play next',
          icon: this.icons.playlistPlay,
          click: () => this.helper.addAlbumToQueue(album.id, true),
        },
        {
          text: 'Add to queue',
          icon: this.icons.playlistMusic,
          click: () => this.helper.addAlbumToQueue(album.id),
        },
        {
          text: 'Add to playlist',
          icon: this.icons.playlistPlus,
          click: () => this.helper.addAlbumToPlaylist(album.id),
        },
      ]),
    );
  }

  getLength(songs: Song[]): number {
    const sec = songs.reduce((acc, song) => acc + (song.duration || 0), 0);
    return Math.floor(sec / 60);
  }

  play(album: Album): void {
    this.helper.playAlbum(album.id);
  }

  toggleLiked(album: Album): void {
    this.albums.toggleLiked(album);
  }

  getIds(songs: Song[]): SongId[] {
    return songs.map((s) => s.id);
  }
}
