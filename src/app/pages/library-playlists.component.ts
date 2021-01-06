import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { SelectOption } from '@app/components/select.component';
import { Icons } from '@app/utils/icons.util';
import { LibraryFacade } from '@app/store/library/library.facade';
import { map, startWith, switchMap, tap } from 'rxjs/operators';
import { Playlist } from '@app/models/playlist.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { scanArray } from '@app/utils/scanArray.util';

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
          <app-playlist [playlist]="playlist"></app-playlist>
        </div>
        <div class="playlist likes">
          <app-playlist-likes></app-playlist-likes>
        </div>
        <ng-container
          *ngFor="let playlist of playlists$ | async; trackBy: trackBy"
        >
          <div class="playlist" *ngIf="!likes || !!playlist.likedOn">
            <app-playlist
              [playlist]="playlist"
              (update)="playlistUpdate()"
            ></app-playlist>
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
export class LibraryPlaylistsComponent implements OnInit, OnDestroy {
  sortOptions: SelectOption[] = [
    { name: 'Recently added', value: 'createdOn_desc' },
    { name: 'A to Z', value: 'title_asc' },
    { name: 'Z to A', value: 'title_desc' },
  ];
  selectedSortOption: SelectOption = this.sortOptions[0];

  icons = Icons;

  playlists$!: Observable<Playlist[]>;
  newPlaylists$!: Observable<Playlist[]>;

  subscription = new Subscription();

  sort!: any;

  likes?: boolean;

  constructor(
    private library: LibraryFacade,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
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
      switchMap((sort) => {
        const predicate = sort.likes
          ? (playlist: Playlist) => !!playlist.likedOn
          : undefined;

        return this.library
          .getPlaylists(sort.index, null, sort.direction, predicate)
          .pipe(scanArray(), startWith([]));
      })
    );

    this.newPlaylists$ = sort$.pipe(
      switchMap(() =>
        this.library.getNewlyCreatedPlaylists().pipe(
          scanArray(),
          startWith([]),
          map((pl) => pl.reverse())
        )
      )
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  trackBy(index: number, playlist: Playlist) {
    return playlist.title;
  }

  playlistUpdate() {
    this.cdr.markForCheck();
  }
}
