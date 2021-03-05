import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import { SelectOption } from '@app/components/select.component';
import { LibraryFacade } from '@app/store/library/library.facade';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Artist, ArtistWithCover$ } from '@app/models/artist.model';
import { map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { Icons } from '@app/utils/icons.util';
import { scanArray } from '@app/utils/scan-array.util';
import { ComponentHelperService } from '@app/services/component-helper.service';
import { PlayerFacade } from '@app/store/player/player.facade';
import { HistoryService } from '@app/services/history.service';
import { WithTrigger } from '@app/classes/with-trigger';

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
            *ngIf="!likes || !!artist.likedOn"
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
                [class.liked]="!!artist.likedOn"
                mat-icon-button
                [disableRipple]="true"
                (click)="toggleLiked(artist)"
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
                (menuOpened)="menuOpened(trigger)"
                (click)="$event.stopPropagation()"
              >
                <app-icon [path]="icons.dotsVertical" [size]="24"></app-icon>
              </button>
            </div>
            <mat-menu #menu="matMenu" [hasBackdrop]="false">
              <ng-template matMenuContent>
                <button mat-menu-item (click)="shufflePlay(artist)">
                  <app-icon [path]="icons.shuffle"></app-icon>
                  <span>Shuffle play</span>
                </button>
              </ng-template>
            </mat-menu>
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
      .controls button:not(.liked) {
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
      .mat-menu-item app-icon {
        margin-right: 16px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryArtistsComponent extends WithTrigger implements OnInit {
  icons = Icons;

  artists$!: Observable<ArtistWithCover$[]>;

  sortOptions: SelectOption[] = [
    { name: 'Recently added', value: 'lastModified_desc' },
    { name: 'A to Z', value: 'name_asc' },
    { name: 'Z to A', value: 'name_desc' },
  ];
  selectedSortOption: SelectOption = this.sortOptions[0];

  likes = false;

  constructor(
    private player: PlayerFacade,
    private library: LibraryFacade,
    private route: ActivatedRoute,
    private helper: ComponentHelperService,
    private cdr: ChangeDetectorRef,
    private history: HistoryService
  ) {
    super();
  }

  @HostListener('window:scroll')
  @HostListener('click')
  closeMenu(): void {
    super.closeMenu();
  }

  ngOnInit(): void {
    const sort$ = this.route.queryParamMap.pipe(
      map((params) => ({
        index:
          params.get('sort') === 'name'
            ? undefined
            : params.get('sort') || 'lastModified',
        direction: ((params.get('dir') || 'desc') === 'asc'
          ? 'next'
          : 'prev') as IDBCursorDirection,
        likes: params.get('likes') === '1',
      })),
      tap((sort) => (this.likes = sort.likes))
    );

    this.artists$ = sort$.pipe(
      switchMap((sort) => {
        const predicate: ((artist: Artist) => boolean) | undefined = sort.likes
          ? (artist) => !!artist.likedOn
          : undefined;

        return this.library
          .getArtists(sort.index, null, sort.direction, predicate)
          .pipe(scanArray(), startWith([]));
      }),
      shareReplay(1)
    );
  }

  trackBy = (index: number, artist: ArtistWithCover$): string => artist.name;

  toggleLiked(artist: Artist): void {
    this.helper
      .toggleLikedArtist(artist)
      .subscribe(() => this.cdr.markForCheck());
  }

  shufflePlay(artist: Artist): void {
    this.helper.shufflePlayArtist(artist).subscribe();
    this.history.artistPlayed(artist);
  }
}
