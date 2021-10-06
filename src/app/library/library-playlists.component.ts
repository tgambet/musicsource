import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { SelectOption } from '@app/core/components/select.component';
import { Icons } from '@app/core/utils/icons.util';
import { delay, map, switchMap, tap } from 'rxjs/operators';
import { Playlist } from '@app/database/playlists/playlist.model';
import { ActivatedRoute, Router } from '@angular/router';
import {
  animationFrameScheduler,
  bufferWhen,
  mergeMap,
  Observable,
  of,
  scan,
  scheduled,
} from 'rxjs';
import { PlaylistFacade } from '@app/database/playlists/playlist.facade';

@Component({
  selector: 'app-library-playlists',
  template: `
    <app-library-content
      [selectedSortOption]="selectedSortOption"
      [sortOptions]="sortOptions"
    >
      <div class="playlists">
        <div class="playlist new">
          <a
            class="cover"
            matRipple
            [routerLink]="['/', { outlets: { dialog: 'new-playlist' } }]"
            [preserveFragment]="true"
            queryParamsHandling="preserve"
          >
            <app-icon [path]="icons.plus" [size]="36"></app-icon>
          </a>
          <app-label
            [topLabel]="{
              text: 'New playlist',
              routerLink: [
                '/',
                'library',
                { outlets: { dialog: 'new-playlist' } }
              ]
            }"
            size="small"
          ></app-label>
        </div>
        <!--        <div-->
        <!--          class="playlist"-->
        <!--          *ngFor="let playlist of newPlaylists$ | async; trackBy: trackBy"-->
        <!--        >-->
        <!--          <app-playlist [playlist]="playlist"></app-playlist>-->
        <!--        </div>-->
        <!--        <div class="playlist likes">-->
        <!--          <app-playlist-likes></app-playlist-likes>-->
        <!--        </div>-->
        <ng-container
          *ngFor="let playlist of playlists$ | async; trackBy: trackBy"
        >
          <div class="playlist" *ngIf="!likes || !!playlist.likedOn">
            <app-playlist [playlist]="playlist"></app-playlist>
          </div>
        </ng-container>
      </div>
    </app-library-content>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .playlists {
        display: flex;
        flex-wrap: wrap;
        margin: 0 -12px;
        padding: 0 0 64px;
      }
      .playlist {
        margin: 0 12px 32px;
        width: 160px;
      }
      .new .cover {
        width: 160px;
        height: 160px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
        background-color: #212121;
        border-radius: 4px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryPlaylistsComponent implements OnInit {
  sortOptions: SelectOption[] = [
    { name: 'Recently added', value: 'createdOn_desc' },
    { name: 'A to Z', value: 'title_asc' },
    { name: 'Z to A', value: 'title_desc' },
  ];
  selectedSortOption: SelectOption = this.sortOptions[0];

  icons = Icons;

  playlists$!: Observable<Playlist[]>;

  sort!: any;

  likes?: boolean;

  constructor(
    // private library: LibraryFacade,
    private playlists: PlaylistFacade,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const sort$ = this.route.queryParamMap.pipe(
      map((params) => ({
        index: params.get('sort') || 'createdOn',
        direction: ((params.get('dir') || 'desc') === 'asc'
          ? 'next'
          : 'prev') as IDBCursorDirection,
        likes: params.get('likes') === '1',
      })),
      tap((sort) => (this.likes = sort.likes))
    );

    this.playlists$ = sort$.pipe(
      switchMap((sort, i) =>
        this.playlists.getAll(sort.index as any).pipe(
          // filter((models) => models.length > 0),
          switchMap((models, j) => {
            let mods;
            if (sort.likes) {
              mods = models.filter((a) => !!a.likedOn);
            } else {
              mods = [...models];
            }
            if (sort.direction === 'prev') {
              mods.reverse();
            }
            return j === 0 && i === 0
              ? of(...mods).pipe(
                  mergeMap((model, index) => of(model).pipe(delay(10 * index))),
                  bufferWhen(() => scheduled(of(1), animationFrameScheduler)),
                  scan((acc, curr) => [...acc, ...curr])
                )
              : of(mods);
          })
        )
      )

      // switchMap((sort) => {
      //   const predicate = sort.likes
      //     ? (playlist: Playlist) => !!playlist.likedOn
      //     : undefined;
      //
      //   return this.playlists
      //     .getPlaylists(sort.index, null, sort.direction, predicate)
      //     .pipe(scanArray(), startWith([]));
      // })
    );

    // this.newPlaylists$ = sort$.pipe(
    //   switchMap(() =>
    //     this.library.getNewlyCreatedPlaylists().pipe(
    //       scanArray(),
    //       startWith([]),
    //       map((pl) => pl.reverse())
    //     )
    //   )
    // );
  }

  trackBy(index: number, playlist: Playlist): string {
    return playlist.title;
  }

  // playlistUpdate(): void {
  //   this.cdr.markForCheck();
  // }
}
