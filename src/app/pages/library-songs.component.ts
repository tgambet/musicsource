import {
  ChangeDetectionStrategy,
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
  scan,
  skip,
  skipWhile,
  take,
  tap,
} from 'rxjs/operators';
import { tapError } from '@app/utils/tap-error.util';
import { Icons } from '@app/utils/icons.util';
import { ActivatedRoute } from '@angular/router';
import { PlayerFacade } from '@app/store/player/player.facade';
import { WithTrigger } from '@app/classes/with-trigger';

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
            <app-song-list-item
              [song]="song"
              [playlist]="[song]"
              *ngIf="!sort.likes || !!song.likedOn"
              cdkMonitorSubtreeFocus
              (menuOpened)="menuOpened($event)"
              [class.selected]="(currentSongPath$ | async) === song.entryPath"
            ></app-song-list-item>
          </ng-container>

          <p class="empty" *ngIf="i === 0">Nothing to display</p>
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
      app-song-list-item {
        flex: 0 0 48px;
      }
      app-song-list-item:last-of-type {
        border: none;
      }
      app-song-list-item.selected {
        background-color: rgba(255, 255, 255, 0.1);
      }
      app-song-list-item ~ .empty {
        display: none;
      }
      .empty {
        color: #aaa;
        padding: 24px 0;
        text-align: center;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibrarySongsComponent
  extends WithTrigger
  implements OnInit, OnDestroy {
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

  sort!: { index: string; direction: IDBCursorDirection; likes: boolean };

  last?: {
    value: { [key: string]: any };
    key: IDBValidKey;
    primaryKey: IDBValidKey;
  };
  loadMore = false;

  subscription = new Subscription();

  currentSongPath$ = this.player
    .getCurrentSong$()
    .pipe(map((song) => song?.entryPath));

  constructor(
    private library: LibraryFacade,
    private route: ActivatedRoute,
    private player: PlayerFacade
  ) {
    super();
  }

  @HostListener('window:scroll')
  update(): void {
    if (
      window.innerHeight + window.scrollY >= document.body.scrollHeight - 64 &&
      this.loadMore &&
      this.sort
    ) {
      this.pushSongs(this.sort.index, this.sort.direction, this.sort.likes);
    }
    super.closeMenu();
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
            likes: params.get('likes') === '1',
          })),
          tap((sort) => (this.sort = sort)),
          tap(() => (this.songsObs = [])),
          tap(() => (this.last = undefined)),
          tap(({ index, direction, likes }) =>
            this.pushSongs(index, direction, likes)
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
    likes: boolean
  ): void {
    this.loadMore = false;

    const query: IDBKeyRange | null = !this.last
      ? null
      : direction === 'next'
      ? IDBKeyRange.lowerBound(this.last.key, false)
      : IDBKeyRange.upperBound(this.last.key, false);

    const predicate: ((song: Song) => boolean) | undefined = likes
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
        take(150),
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
}
