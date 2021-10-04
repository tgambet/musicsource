import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import { SelectOption } from '@app/core/components/select.component';
import { LibraryFacade } from '@app/library/store/library.facade';
import { ActivatedRoute } from '@angular/router';
import {
  animationFrameScheduler,
  bufferWhen,
  mergeMap,
  Observable,
  of,
  scan,
  scheduled,
} from 'rxjs';
import { Artist } from '@app/database/artists/artist.model';
import { delay, filter, map, switchMap, tap } from 'rxjs/operators';
import { Icons } from '@app/core/utils/icons.util';
import { ComponentHelperService } from '@app/core/services/component-helper.service';
import { PlayerFacade } from '@app/player/store/player.facade';
import { HistoryService } from '@app/core/services/history.service';
import { WithTrigger } from '@app/core/classes/with-trigger';
import { ArtistFacade } from '@app/database/artists/artist.facade';

@Component({
  selector: 'app-library-artists',
  template: `
    <app-library-content
      [sortOptions]="sortOptions"
      [selectedSortOption]="selectedSortOption"
    >
      <div class="artists">
        <ng-container *ngFor="let artist of artists$ | async; trackBy: trackBy">
          <!--<div
            *ngIf="!likes || !!artist.likedOn"
            class="artist"
            cdkMonitorSubtreeFocus
          >-->
          <app-artist-list-item
            [artist]="artist"
            (menuOpened)="menuOpened($event)"
            (shufflePlay)="shufflePlay(artist)"
            (toggleLiked)="toggleLiked(artist)"
            cdkMonitorSubtreeFocus
          ></app-artist-list-item>
          <!--</div>-->
        </ng-container>
        <!--        <p-->
        <!--          class="empty"-->
        <!--          *ngIf="-->
        <!--            (artists$ | async) === null || (artists$ | async)?.length === 0-->
        <!--          "-->
        <!--        >-->
        <!--          Nothing to display-->
        <!--        </p>-->
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryArtistsComponent extends WithTrigger implements OnInit {
  icons = Icons;

  artists$!: Observable<Artist[]>;

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
    private history: HistoryService,
    private artists: ArtistFacade
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
        index: params.get('sort') || 'lastModified',
        direction: ((params.get('dir') || 'desc') === 'asc'
          ? 'next'
          : 'prev') as IDBCursorDirection,
        likes: params.get('likes') === '1',
      })),
      tap((sort) => (this.likes = sort.likes))
    );

    // this.artists$ = sort$.pipe(
    //   switchMap((sort) => {
    //     const predicate: ((artist: Artist) => boolean) | undefined = sort.likes
    //       ? (artist) => !!artist.likedOn
    //       : undefined;
    //
    //     return this.library
    //       .getArtists(sort.index, null, sort.direction, predicate)
    //       .pipe(scanArray(), startWith([]));
    //   }),
    //   shareReplay(1)
    // );

    this.artists$ = sort$.pipe(
      switchMap((sort, i) =>
        this.artists.getAll(sort.index as any).pipe(
          filter((models) => models.length > 0),
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
    );
  }

  trackBy = (index: number, artist: Artist): string => artist.hash;

  toggleLiked(artist: Artist): void {
    this.helper.toggleLikedArtist(artist);
  }

  shufflePlay(artist: Artist): void {
    this.helper.shufflePlayArtist(artist).subscribe();
    this.history.artistPlayed(artist);
  }
}
