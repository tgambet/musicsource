import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { SelectOption } from '@app/components/select.component';
import { EMPTY, merge, Observable, Subscription } from 'rxjs';
import { Song, SongWithCover$ } from '@app/models/song.model';
import { LibraryFacade } from '@app/store/library/library.facade';
import {
  catchError,
  concatMap,
  last,
  map,
  publish,
  reduce,
  scan,
  skip,
  skipWhile,
  take,
  tap,
} from 'rxjs/operators';
import { tapError } from '@app/utils/tap-error.util';
import { Icons } from '@app/utils/icons.util';
import { ActivatedRoute } from '@angular/router';
import { hash } from '@app/utils/hash.util';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuTrigger } from '@angular/material/menu';
import { Playlist } from '@app/models/playlist.model';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-library-songs',
  template: `
    <app-library-content
      [sortOptions]="sortOptions"
      [selectedSortOption]="selectedSortOption"
      (click)="closeMenu()"
    >
      <div class="songs">
        <ng-container *ngFor="let songs$ of songsObs; let i = index">
          <ng-container
            *ngFor="
              let song of songs$ | async;
              trackBy: trackBy;
              let count = count
            "
          >
            <div
              class="song"
              *ngIf="!sort.favorites || !!song.likedOn"
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
                ></app-player-button>
              </div>
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
              <span class="album">
                <a
                  [routerLink]="['/', 'album', getHash(song.album)]"
                  *ngIf="song.album"
                >
                  {{ song.album }}
                </a>
              </span>
              <span class="controls">
                <button
                  [class.favorite]="!!song.likedOn"
                  mat-icon-button
                  [disableRipple]="true"
                  (click)="toggleFavorite(song)"
                >
                  <app-icon
                    [path]="!!song.likedOn ? icons.heart : icons.heartOutline"
                  ></app-icon>
                </button>
                <button
                  class="trigger"
                  aria-label="Other actions"
                  title="Other actions"
                  mat-icon-button
                  [disableRipple]="true"
                  #trigger="matMenuTrigger"
                  [matMenuTriggerFor]="menu"
                  [matMenuTriggerData]="{ song: song }"
                  (click)="menuOpened(trigger); $event.stopPropagation()"
                >
                  <app-icon [path]="icons.dotsVertical" [size]="24"></app-icon>
                </button>
              </span>
              <span class="duration">{{ song.duration | duration }}</span>
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
                  <button mat-menu-item (click)="addSongToPlaylist(song)">
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
          </ng-container>

          <p class="empty" *ngIf="i === 0">Nothing to display</p>
        </ng-container>
      </div>
    </app-library-content>

    <ng-template #addToPlaylist>
      <app-title mat-dialog-title title="My playlists" size="small"></app-title>
      <mat-dialog-content>
        <ng-container *ngFor="let playlist of playlists$ | async">
          <button mat-menu-item [mat-dialog-close]="playlist.title">
            <app-icon [path]="icons.playlistEdit"></app-icon>
            {{ playlist.title }}
          </button>
        </ng-container>
      </mat-dialog-content>
      <div class="dialog-actions">
        <button mat-button [mat-dialog-close]="true" class="new-playlist">
          NEW PLAYLIST
        </button>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .mat-dialog-container {
        padding-bottom: 0 !important;
      }
      .dialog-actions {
        text-align: right;
        margin: 0 -24px 0;
      }
      .new-playlist {
        width: 100%;
        height: 52px;
      }
      .mat-dialog-content {
        padding: 0 !important;
        border: solid rgba(255, 255, 255, 0.1);
        border-width: 1px 0;
      }
      :host {
        display: block;
        min-height: 1200px;
      }
      .songs {
        display: flex;
        flex-direction: column;
      }
      .song {
        flex: 0 0 48px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        padding: 0 8px;
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
      .song:hover app-player-button,
      .cdk-focused app-player-button {
        opacity: 1;
      }
      .title {
        flex: 12 1 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-right: 8px;
      }
      .artists {
        margin-right: 8px;
      }
      .artists,
      .album {
        color: #aaa;
        flex: 9 1 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .duration {
        color: #aaa;
        flex: 0 0 54px;
        margin-left: 16px;
        text-align: right;
      }
      .controls {
        flex: 0 0 auto;
        margin-left: 16px;
        color: #aaa;
      }
      .controls button:not(.favorite) {
        opacity: 0;
      }
      .song:hover .controls button,
      .cdk-focused .controls button {
        opacity: 1;
      }
      .controls button:not(:last-of-type) {
        margin-right: 8px;
      }
      .song ~ .empty {
        display: none;
      }
      .empty {
        color: #aaa;
        padding: 24px 0;
        text-align: center;
      }
      a[href] {
        text-decoration: none;
      }
      a[href]:hover {
        text-decoration: underline;
      }
      .mat-menu-item app-icon {
        margin-right: 16px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibrarySongsComponent implements OnInit, OnDestroy {
  @ViewChild('addToPlaylist', { static: true })
  addToPlaylist!: TemplateRef<any>;

  sortOptions: SelectOption[] = [
    { name: 'Recently added', value: 'lastModified_desc' },
    { name: 'A to Z', value: 'title_asc' },
    { name: 'Z to A', value: 'title_desc' },
  ];

  selectedSortOption: SelectOption = this.sortOptions[0];

  icons = Icons;

  songsObs: Observable<SongWithCover$[]>[] = [];

  sort!: { index: string; direction: IDBCursorDirection; favorites: boolean };

  last?: {
    value: { [key: string]: any };
    key: IDBValidKey;
    primaryKey: IDBValidKey;
  };
  loadMore = false;

  subscription = new Subscription();

  trigger?: MatMenuTrigger;

  playlists$: Observable<Playlist[]> = this.library
    .getPlaylists()
    .pipe(reduce((acc, cur) => [...acc, cur], [] as Playlist[]));

  constructor(
    private library: LibraryFacade,
    private route: ActivatedRoute,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  @HostListener('window:scroll')
  update() {
    if (
      window.innerHeight + window.scrollY >= document.body.scrollHeight - 64 &&
      this.loadMore &&
      this.sort
    ) {
      this.pushSongs(this.sort.index, this.sort.direction, this.sort.favorites);
    }
    this.closeMenu();
  }

  ngOnInit(): void {
    this.subscription.add(
      this.route.queryParamMap
        .pipe(
          map((params) => ({
            index: params.get('sort') || 'lastModified',
            direction: ((params.get('dir') || 'desc') === 'asc'
              ? 'next'
              : 'prev') as IDBCursorDirection,
            favorites: params.get('favorites') === '1',
          })),
          tap((sort) => (this.sort = sort)),
          tap(() => (this.songsObs = [])),
          tap(() => (this.last = undefined)),
          tap(({ index, direction, favorites }) =>
            this.pushSongs(index, direction, favorites)
          )
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  pushSongs(
    index: string,
    direction: IDBCursorDirection,
    favorites: boolean
  ): void {
    this.loadMore = false;

    const query: IDBKeyRange | null = !this.last
      ? null
      : direction === 'next'
      ? IDBKeyRange.lowerBound(this.last.key, false)
      : IDBKeyRange.upperBound(this.last.key, false);

    const predicate: ((song: Song) => boolean) | undefined = favorites
      ? (song) => !!song.likedOn
      : undefined;

    this.songsObs.push(
      this.library.getSongs(index, query, direction, predicate).pipe(
        skipWhile((res) =>
          query
            ? res.key !== this.last?.key &&
              res.primaryKey !== this.last?.primaryKey
            : false
        ),
        skip(query ? 1 : 0),
        take(50),
        scan(
          (acc, cur) => [...acc, cur],
          [] as {
            value: SongWithCover$;
            key: IDBValidKey;
            primaryKey: IDBValidKey;
          }[]
        ),
        publish((m$) =>
          merge(
            m$.pipe(
              last(),
              tap((songs) => (this.last = songs[songs.length - 1])),
              tap(() => (this.loadMore = true)),
              tapError(() => (this.loadMore = false)),
              concatMap(() => EMPTY),
              catchError(() => EMPTY)
            ),
            m$.pipe(map((values) => values.map((v) => v.value))),
            2
          )
        )
      )
    );
  }

  trackBy(index: number, song: SongWithCover$): string {
    return song.entryPath;
  }

  getHash(s: string): string {
    return hash(s);
  }

  toggleFavorite(song: Song) {
    this.library
      .toggleSongFavorite(song)
      .pipe(tap(() => (song.likedOn = !!song.likedOn ? undefined : new Date())))
      .pipe(
        tap(() =>
          this.snack.open(
            !!song.likedOn
              ? 'Added to your favorites'
              : 'Removed from your favorites',
            undefined
          )
        ),
        tap(() => this.cdr.markForCheck())
      )
      .subscribe();
  }

  menuOpened(trigger: MatMenuTrigger) {
    if (this.trigger && this.trigger !== trigger) {
      this.trigger.closeMenu();
    }
    this.trigger = trigger;
  }

  closeMenu() {
    if (this.trigger) {
      this.trigger.closeMenu();
      this.trigger = undefined;
    }
  }

  addSongToPlaylist(song: Song) {
    const ref = this.dialog.open(this.addToPlaylist, {
      width: '275px',
      maxHeight: '80%',
      height: 'auto',
      panelClass: 'playlists-dialog',
    });

    ref
      .afterClosed()
      .pipe(
        concatMap(
          (result) =>
            result === undefined
              ? EMPTY
              : result === true
              ? EMPTY // Redirect to new playlist
              : this.library
                  .addSongToPlaylist(song, result)
                  .pipe(
                    tap((key) => this.snack.open(`Added to ${key}`, 'VIEW'))
                  ) // TODO redirect to playlist
        )
      )
      .subscribe();
  }
}
