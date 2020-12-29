import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { SelectOption } from '@app/components/select.component';
import { LibraryFacade } from '@app/store/library/library.facade';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Artist, ArtistWithCover$ } from '@app/models/artist.model';
import {
  map,
  scan,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import { Icons } from '@app/utils/icons.util';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-library-artists',
  template: `
    <app-library-content
      [sortOptions]="sortOptions"
      [selectedSortOption]="selectedSortOption"
    >
      <div class="artists">
        <ng-container *ngFor="let artist of artists$ | async; trackBy: trackBy">
          <div
            *ngIf="!favorites || !!artist.likedOn"
            class="artist"
            cdkMonitorSubtreeFocus
          >
            <a [routerLink]="['/', 'artist', artist.hash]" matRipple>
              <div class="cover" style="--aspect-ratio:1">
                <img
                  [src]="cover"
                  [alt]="artist.name"
                  *ngIf="artist.cover$ | async as cover; else icon"
                />
                <ng-template #icon>
                  <app-icon [path]="icons.account" [size]="56"></app-icon>
                </ng-template>
              </div>
              <div class="meta">
                <span>{{ artist.name }}</span>
              </div>
            </a>
            <div class="controls">
              <button
                [class.favorite]="!!artist.likedOn"
                mat-icon-button
                [disableRipple]="true"
                (click)="toggleFavorite(artist)"
              >
                <app-icon
                  [path]="!!artist.likedOn ? icons.heart : icons.heartOutline"
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
                [matMenuTriggerData]="{ artist: artist }"
              >
                <app-icon [path]="icons.dotsVertical" [size]="24"></app-icon>
              </button>
            </div>
          </div>
        </ng-container>
        <p
          class="empty"
          *ngIf="
            (artists$ | async) === null || (artists$ | async)?.length === 0
          "
        >
          Nothing to display
        </p>
      </div>
    </app-library-content>

    <mat-menu #menu="matMenu" [hasBackdrop]="true" [overlapTrigger]="true">
      <ng-template matMenuContent let-artist="artist">
        <button mat-menu-item (click)="toggleFavorite(artist)">
          <app-icon
            [path]="artist.isFavorite ? icons.heart : icons.heartOutline"
          ></app-icon>
          <span *ngIf="artist.isFavorite">Remove from favorites</span>
          <span *ngIf="!artist.isFavorite">Add to favorites</span>
        </button>
      </ng-template>
    </mat-menu>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .artists {
        display: flex;
        flex-direction: column;
        padding: 0 0 64px;
      }
      .artist {
        flex: 0 0 80px;
        position: relative;
      }
      .artist a {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding: 0 104px 0 8px;
        height: 80px;
        text-decoration: none;
      }
      .artist:last-of-type a {
        border: none;
      }
      .cover {
        width: 56px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 16px;
        position: relative;
        z-index: 1;
      }
      .meta {
        display: flex;
        flex-direction: column;
      }
      .controls {
        color: #aaa;
        position: absolute;
        top: 50%;
        right: 8px;
        transform: translateY(-50%);
      }
      .controls button:not(:last-of-type) {
        margin-right: 8px;
      }
      .controls button:not(.favorite) {
        opacity: 0;
      }
      .artist:hover .controls button,
      .artist.cdk-focused button {
        opacity: 1;
      }
      .artist ~ .empty {
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
export class LibraryArtistsComponent implements OnInit {
  icons = Icons;

  artists$!: Observable<ArtistWithCover$[]>;

  sortOptions: SelectOption[] = [
    { name: 'Recently added', value: 'addedOn_desc' },
    { name: 'A to Z', value: 'name_asc' },
    { name: 'Z to A', value: 'name_desc' },
  ];
  selectedSortOption: SelectOption = this.sortOptions[0];

  favorites = false;

  constructor(
    private library: LibraryFacade,
    private router: Router,
    private route: ActivatedRoute,
    private snack: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const sort$ = this.route.queryParamMap.pipe(
      map((params) => ({
        index:
          params.get('sort') === 'name'
            ? undefined
            : params.get('sort') || undefined,
        direction: ((params.get('dir') || 'asc') === 'asc'
          ? 'next'
          : 'prev') as IDBCursorDirection,
        favorites: params.get('favorites') === '1',
      })),
      tap((sort) => (this.favorites = sort.favorites))
    );

    this.artists$ = sort$.pipe(
      switchMap((sort) => {
        const predicate:
          | ((artist: Artist) => boolean)
          | undefined = sort.favorites
          ? (artist) => !!artist.likedOn
          : undefined;

        return this.library
          .getArtists(sort.index, null, sort.direction, predicate)
          .pipe(
            scan((acc, cur) => [...acc, cur], [] as ArtistWithCover$[]),
            startWith([])
          );
      }),
      shareReplay(1)
    );
  }

  trackBy = (index: number, artist: ArtistWithCover$) => artist.name;

  toggleFavorite(artist: Artist): void {
    this.library
      .toggleArtistFavorite(artist)
      .pipe(
        tap(() => (artist.likedOn = !!artist.likedOn ? undefined : new Date()))
      )
      .pipe(
        tap(() =>
          this.snack.open(
            !!artist.likedOn
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
