import {
  ChangeDetectionStrategy,
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
  take,
  tap,
} from 'rxjs/operators';
import { tapError } from '@app/utils/tap-error.util';
import { Icons } from '@app/utils/icons.util';
import { ActivatedRoute } from '@angular/router';
import { hash } from '@app/utils/hash.util';

@Component({
  selector: 'app-library-songs',
  template: `
    <app-library-content
      [sortOptions]="sortOptions"
      [selectedSortOption]="selectedSortOption"
    >
      <div class="songs">
        <ng-container *ngFor="let songs$ of songsObs; let i = index">
          <div
            class="song"
            *ngFor="
              let song of songs$ | async;
              trackBy: trackBy;
              let count = count
            "
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
              <a [routerLink]="['/', 'album', getHash(song.album)]">
                {{ song.album }}
              </a>
            </span>
            <span class="controls">
              <button mat-icon-button>
                <app-icon [path]="icons.heartOutline"></app-icon>
              </button>
              <app-menu></app-menu>
            </span>
            <span class="duration">{{ song.duration | duration }}</span>
          </div>
          <p class="empty" *ngIf="i === 0">There is no song to display</p>
        </ng-container>
      </div>
    </app-library-content>
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
        visibility: hidden;
      }
      .song:hover app-player-button {
        visibility: visible;
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
      .controls {
        flex: 0 0 auto;
        visibility: hidden;
        margin-left: 16px;
      }
      .duration {
        color: #aaa;
        flex: 0 0 54px;
        margin-left: 16px;
      }
      .song:hover .controls {
        visibility: visible;
      }
      .controls button {
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
    { name: 'A to Z', value: 'title_asc' },
    { name: 'Z to A', value: 'title_desc' },
  ];
  selectedSortOption: SelectOption = this.sortOptions[0];

  icons = Icons;

  songsObs: Observable<SongWithCover$[]>[] = [];

  sort!: { index: string; direction: IDBCursorDirection; favorites: boolean };

  lastSong?: SongWithCover$;
  loadMore = false;

  subscription = new Subscription();

  constructor(private library: LibraryFacade, private route: ActivatedRoute) {}

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
            index: params.get('sort') || 'title',
            direction: ((params.get('dir') || 'asc') === 'asc'
              ? 'next'
              : 'prev') as IDBCursorDirection,
            favorites: params.get('favorites') === '1',
          })),
          tap((sort) => (this.sort = sort)),
          tap(() => (this.songsObs = [])),
          tap(() => (this.lastSong = undefined)),
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

    const query: IDBKeyRange | null = !this.lastSong
      ? null
      : direction === 'next'
      ? IDBKeyRange.lowerBound(this.lastSong.title, false)
      : IDBKeyRange.upperBound(this.lastSong.title, false);

    const predicate: ((song: Song) => boolean) | undefined = favorites
      ? (song) => song.album?.includes('Sup') || false
      : undefined;

    this.songsObs.push(
      this.library.getSongs(index, query, direction, predicate).pipe(
        skip(query ? 1 : 0),
        take(100),
        scan((acc, cur) => [...acc, cur], [] as SongWithCover$[]),
        publish((m$) =>
          merge(
            m$.pipe(
              last(),
              tap((songs) => (this.lastSong = songs[songs.length - 1])),
              tap(() => (this.loadMore = true)),
              tapError(() => (this.loadMore = false)),
              concatMap(() => EMPTY),
              catchError(() => EMPTY)
            ),
            m$,
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
}
