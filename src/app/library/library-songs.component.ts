import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { SelectOption } from '@app/core/components/select.component';
import {
  animationFrameScheduler,
  combineLatest,
  Observable,
  observeOn,
  ReplaySubject,
  share,
  switchMap,
} from 'rxjs';
import { Song } from '@app/database/songs/song.model';
import { map } from 'rxjs/operators';
import { Icons } from '@app/core/utils/icons.util';
import { ActivatedRoute } from '@angular/router';
import { PlayerFacade } from '@app/player/store/player.facade';
import { WithTrigger } from '@app/core/classes/with-trigger';
import { SongFacade } from '@app/database/songs/song.facade';
import { ScrollerService } from '@app/main/scroller.service';
import { SongIndex } from '@app/database/songs/song.reducer';

@Component({
  selector: 'app-library-songs',
  template: `
    <app-library-content
      [sortOptions]="sortOptions"
      [selectedSortOption]="selectedSortOption"
      (click)="closeMenu()"
    >
      <div class="songs">
        <div [style.height.px]="top$ | async" class="filler"></div>
        <ng-container *ngFor="let song of songs$ | async; trackBy: trackBy">
          <app-song-list-item
            [song]="song"
            [playlist]="[song]"
            cdkMonitorSubtreeFocus
            (menuOpened)="menuOpened($event)"
            [class.selected]="(currentSongPath$ | async) === song.entryPath"
          ></app-song-list-item>
        </ng-container>
        <div [style.height.px]="bottom$ | async" class="filler"></div>

        <!--        <ng-container *ngFor="let songs$ of songsObs; let i = index">-->
        <!--          <ng-container-->
        <!--            *ngFor="-->
        <!--              let song of songs$ | async;-->
        <!--              trackBy: trackBy;-->
        <!--              let count = count-->
        <!--            "-->
        <!--          >-->
        <!--            <app-song-list-item-->
        <!--              [song]="song"-->
        <!--              [playlist]="[song]"-->
        <!--              *ngIf="!sort.likes || !!song.likedOn"-->
        <!--              cdkMonitorSubtreeFocus-->
        <!--              (menuOpened)="menuOpened($event)"-->
        <!--              [class.selected]="(currentSongPath$ | async) === song.entryPath"-->
        <!--            ></app-song-list-item>-->
        <!--          </ng-container>-->
        <!--          <p class="empty" *ngIf="i === 0">Nothing to display</p>-->
        <!--        </ng-container>-->
      </div>
    </app-library-content>
  `,
  styles: [
    `
      :host {
        display: block;
        /*min-height: 1200px;*/
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
      .filler {
        will-change: auto;
        /*transition: height linear 50ms;*/
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibrarySongsComponent extends WithTrigger implements OnInit {
  @ViewChild('addToPlaylist', { static: true })
  addToPlaylist!: TemplateRef<any>;

  sortOptions: SelectOption[] = [
    { name: 'Latest update', value: 'updatedOn_desc' },
    { name: 'A to Z', value: 'title_asc' },
    { name: 'Z to A', value: 'title_desc' },
  ];
  selectedSortOption: SelectOption = this.sortOptions[0];

  icons = Icons;

  songs$!: Observable<Song[]>;
  top$!: Observable<number>;
  bottom$!: Observable<number>;

  // sort!: { index: string; direction: IDBCursorDirection; likes: boolean };
  //
  // last?: {
  //   value: { [key: string]: any };
  //   key: IDBValidKey;
  //   primaryKey: IDBValidKey;
  // };
  // loadMore = false;

  currentSongPath$ = this.player
    .getCurrentSong$()
    .pipe(map((song) => song?.entryPath));

  constructor(
    private route: ActivatedRoute,
    private player: PlayerFacade,
    private songs: SongFacade,
    private scroller: ScrollerService
  ) {
    super();
  }

  @HostListener('window:scroll')
  update(): void {
    // if (
    //   window.innerHeight + window.scrollY >= document.body.scrollHeight - 64 &&
    //   this.loadMore &&
    //   this.sort
    // ) {
    //   this.pushSongs(this.sort.index, this.sort.direction, this.sort.likes);
    // }
    super.closeMenu();
  }

  ngOnInit(): void {
    // this.subscription.add(
    //   this.route.queryParamMap
    //     .pipe(
    //       map((params) => ({
    //         index: params.get('sort') || 'lastModified',
    //         direction: ((params.get('dir') || 'desc') === 'asc'
    //           ? 'next'
    //           : 'prev') as IDBCursorDirection,
    //         likes: params.get('likes') === '1',
    //       })),
    //       tap((sort) => (this.sort = sort)),
    //       tap(() => (this.songsObs = [])),
    //       tap(() => (this.last = undefined)),
    //       tap(({ index, direction, likes }) =>
    //         this.pushSongs(index, direction, likes)
    //       )
    //     )
    //     .subscribe()
    // );

    const sort$ = this.route.queryParamMap.pipe(
      map((params) => ({
        index: params.get('sort') || 'updatedOn',
        direction: ((params.get('dir') || 'desc') === 'asc'
          ? 'next'
          : 'prev') as IDBCursorDirection,
        likes: params.get('likes') === '1',
      }))
    );
    const songs$ = sort$.pipe(
      switchMap((sort) =>
        this.songs
          .getAll(sort.index as SongIndex)
          .pipe(
            map((songs) =>
              sort.direction === 'next' ? songs : [...songs].reverse()
            )
          )
      )
    );

    const a$ = combineLatest([
      this.scroller.scroll$,
      this.songs.getTotal(),
      songs$,
    ]).pipe(
      // TODO compute available size
      map(([scrollTop, total, all]) => {
        scrollTop = Math.max(scrollTop - 387, 0);

        const topCount = Math.max(
          0,
          Math.min(Math.floor(scrollTop / 49), total - 35)
        );
        const bottomCount = Math.max(0, total - 35 - topCount);

        const songs = all.slice(topCount, total - bottomCount);

        return {
          top: topCount * 49,
          bottom: bottomCount * 49,
          songs,
        };
      }),
      share({
        connector: () => new ReplaySubject(1),
        resetOnRefCountZero: true,
      })
    );

    this.top$ = a$.pipe(
      map(({ top }) => top),
      observeOn(animationFrameScheduler)
    );
    this.bottom$ = a$.pipe(
      map(({ bottom }) => bottom),
      observeOn(animationFrameScheduler)
    );
    this.songs$ = a$.pipe(
      map(({ songs }) => songs),
      observeOn(animationFrameScheduler)
    );
  }

  // pushSongs(
  //   index: string,
  //   direction: IDBCursorDirection,
  //   likes: boolean
  // ): void {
  //   this.loadMore = false;
  //
  //   const query: IDBKeyRange | null = !this.last
  //     ? null
  //     : direction === 'next'
  //     ? IDBKeyRange.lowerBound(this.last.key, false)
  //     : IDBKeyRange.upperBound(this.last.key, false);
  //
  //   const predicate: ((song: Song) => boolean) | undefined = likes
  //     ? (song) => !!song.likedOn
  //     : undefined;
  //
  //   this.songsObs.push(
  //     this.library.getSongs(index, query, direction, predicate).pipe(
  //       skipWhile((res) =>
  //         query
  //           ? res.key !== this.last?.key &&
  //             res.primaryKey !== this.last?.primaryKey
  //           : false
  //       ),
  //       skip(query ? 1 : 0),
  //       take(150),
  //       scan(
  //         (acc, cur) => [...acc, cur],
  //         [] as {
  //           value: Song;
  //           key: IDBValidKey;
  //           primaryKey: IDBValidKey;
  //         }[]
  //       ),
  //       connect((m$) =>
  //         merge(
  //           m$.pipe(
  //             last(),
  //             tap((songs) => (this.last = songs[songs.length - 1])),
  //             tap(() => (this.loadMore = true)),
  //             tapError(() => (this.loadMore = false)),
  //             concatMap(() => EMPTY),
  //             catchError(() => EMPTY)
  //           ),
  //           m$.pipe(map((values) => values.map((v) => v.value))),
  //           2
  //         )
  //       )
  //     )
  //   );
  // }

  trackBy(index: number, song: Song): string {
    return song.entryPath;
  }
}
