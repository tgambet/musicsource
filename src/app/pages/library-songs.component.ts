import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { SelectOption } from '@app/components/select.component';
import { EMPTY, merge, Observable, Subscription } from 'rxjs';
import { SongWithCover$ } from '@app/models/song.model';
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

@Component({
  selector: 'app-library-songs',
  template: `
    <app-library-content
      [sortOptions]="sortOptions"
      [selectedSortOption]="selectedSortOption"
    >
      <div class="songs">
        <ng-container *ngFor="let songs$ of songsObs">
          <div
            class="song"
            *ngFor="let song of songs$ | async; trackBy: trackBy"
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
            <span class="artist">{{ song.artist }}</span>
            <span class="album">{{ song.album }}</span>
            <span class="controls">
              <button mat-icon-button>
                <app-icon [path]="icons.heartOutline"></app-icon>
              </button>
              <app-menu></app-menu>
            </span>
          </div>
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
      .artist,
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
      }
      .song:hover .controls {
        visibility: visible;
      }
      .controls button {
        margin-right: 8px;
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

  sort!: { index: string; direction: IDBCursorDirection };

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
      this.pushSongs(this.sort.index, this.sort.direction);
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
          })),
          tap((sort) => (this.sort = sort)),
          tap(() => (this.songsObs = [])),
          tap(() => (this.lastSong = undefined)),
          tap(({ index, direction }) => this.pushSongs(index, direction))
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  pushSongs(index: string, direction: IDBCursorDirection): void {
    this.loadMore = false;

    const query: IDBKeyRange | null = !this.lastSong
      ? null
      : direction === 'next'
      ? IDBKeyRange.lowerBound(this.lastSong.title, false)
      : IDBKeyRange.upperBound(this.lastSong.title, false);

    this.songsObs.push(
      this.library.getSongs(index, query, direction).pipe(
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
}
