import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { SelectOption } from '@app/components/select.component';
import { Icons } from '@app/utils/icons.util';
import { LibraryFacade } from '@app/store/library/library.facade';
import { concatMap, map, scan, tap } from 'rxjs/operators';
import { Playlist } from '@app/models/playlist.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

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
              routerLink: ['/', { outlets: { dialog: 'new-playlist' } }]
            }"
            size="small"
          ></app-label>
        </div>
        <div
          class="playlist"
          *ngFor="let playlist of newPlaylists$ | async; trackBy: trackBy"
        >
          <app-playlist
            [name]="playlist.title"
            [label]="'Auto playlist'"
          ></app-playlist>
        </div>
        <div
          class="playlist"
          *ngFor="let playlist of playlists$ | async; trackBy: trackBy"
        >
          <app-playlist
            [name]="playlist.title"
            [label]="'Auto playlist'"
          ></app-playlist>
        </div>
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
export class LibraryPlaylistsComponent implements OnInit, OnDestroy {
  sortOptions: SelectOption[] = [
    { name: 'Recently added', value: 'createdOn_desc' },
    { name: 'A to Z', value: 'name_asc' },
    { name: 'Z to A', value: 'name_desc' },
  ];
  selectedSortOption: SelectOption = this.sortOptions[0];

  icons = Icons;

  playlists$!: Observable<Playlist[]>;
  newPlaylists$!: Observable<Playlist[]>;

  subscription = new Subscription();

  sort!: any;

  constructor(
    private library: LibraryFacade,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const sort$ = this.route.queryParamMap.pipe(
      map((params) => ({
        index:
          params.get('sort') === 'name'
            ? undefined
            : params.get('sort') || 'createdOn',
        direction: ((params.get('dir') || 'desc') === 'asc'
          ? 'next'
          : 'prev') as IDBCursorDirection,
        favorites: params.get('favorites') === '1',
      }))
    );

    this.playlists$ = sort$.pipe(
      concatMap((sort) =>
        this.library
          .getPlaylists()
          .pipe(scan((acc, cur) => [...acc, cur], [] as Playlist[]))
      )
    );

    this.subscription.add(
      sort$
        .pipe(
          tap(
            () =>
              (this.newPlaylists$ = this.library
                .getNewlyCreatedPlaylists()
                .pipe(
                  scan((acc, cur) => [...acc, cur], [] as Playlist[]),
                  map((pl) => pl.reverse())
                ))
          )
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  trackBy(index: number, playlist: Playlist) {
    return playlist.title;
  }
}
