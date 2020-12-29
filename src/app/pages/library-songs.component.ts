import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
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

@Component({
  selector: 'app-library-songs',
  template: `
    <app-library-content
      [sortOptions]="sortOptions"
      [selectedSortOption]="selectedSortOption"
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
                  [matMenuTriggerFor]="menu"
                  #trigger="matMenuTrigger"
                  [matMenuTriggerData]="{ song: song }"
                >
                  <app-icon [path]="icons.dotsVertical" [size]="24"></app-icon>
                </button>
              </span>
              <span class="duration">{{ song.duration | duration }}</span>
            </div>
          </ng-container>

          <p class="empty" *ngIf="i === 0">Nothing to display</p>
        </ng-container>
      </div>
    </app-library-content>

    <mat-menu #menu="matMenu" [hasBackdrop]="true" [overlapTrigger]="true">
      <ng-template matMenuContent let-song="song">
        <!--<button mat-menu-item (click)="toggleFavorite(song)">
          <app-icon
            [path]="song.isFavorite ? icons.heart : icons.heartOutline"
          ></app-icon>
          <span *ngIf="song.isFavorite">Remove from favorites</span>
          <span *ngIf="!song.isFavorite">Add to favorites</span>
        </button>-->
      </ng-template>
    </mat-menu>
  `,
  styles: [
    `
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibrarySongsComponent implements OnInit, OnDestroy {
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

  constructor(
    private library: LibraryFacade,
    private route: ActivatedRoute,
    private snack: MatSnackBar,
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
      .pipe(
        tap(() =>
          !!song.likedOn
            ? (song.likedOn = undefined)
            : (song.likedOn = new Date())
        )
      )
      .pipe(
        tap(() =>
          this.snack.open(
            !!song.likedOn
              ? 'Added to your favorites'
              : 'Removed from your favorites',
            undefined
          )
        )
      )
      .pipe(tap(() => this.cdr.markForCheck()))
      .subscribe();
  }
}
