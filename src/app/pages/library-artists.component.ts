import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { SelectOption } from '@app/components/select.component';
import { LibraryFacade } from '@app/store/library/library.facade';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ArtistWithCover$ } from '@app/models/artist.model';
import { map, scan, switchMap } from 'rxjs/operators';
import { Icons } from '@app/utils/icons.util';

@Component({
  selector: 'app-library-artists',
  template: `
    <app-library-content
      [sortOptions]="sortOptions"
      [selectedSortOption]="selectedSortOption"
    >
      <div class="artists">
        <div
          *ngFor="let artist of artists$ | async; trackBy: trackBy"
          class="artist"
        >
          <a [routerLink]="['/', 'artist', artist.id]" matRipple>
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
            <app-menu [disableRipple]="false"></app-menu>
          </div>
        </div>
      </div>
    </app-library-content>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 1200px;
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
        padding: 0 8px;
        height: 80px;
        text-decoration: none;
      }
      .cover {
        width: 56px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 16px;
        position: relative;
        z-index: 1;
      }
      app-icon {
        opacity: 0.25;
      }
      .meta {
        display: flex;
        flex-direction: column;
      }
      .sub {
        color: #aaa;
      }
      .controls {
        position: absolute;
        top: 50%;
        right: 8px;
        transform: translateY(-50%);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryArtistsComponent implements OnInit {
  icons = Icons;

  artists$!: Observable<ArtistWithCover$[]>;

  sortOptions: SelectOption[] = [
    { name: 'A to Z', value: 'name_asc' },
    { name: 'Z to A', value: 'name_desc' },
  ];
  selectedSortOption: SelectOption = this.sortOptions[0];

  constructor(
    private library: LibraryFacade,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const sort$ = this.route.queryParamMap.pipe(
      map((params) => ({
        index: params.get('sort') || 'name',
        direction: ((params.get('dir') || 'asc') === 'asc'
          ? 'next'
          : 'prev') as IDBCursorDirection,
      }))
    );

    this.artists$ = sort$.pipe(
      switchMap((sort) =>
        this.library
          .getArtists(sort.index, null, sort.direction)
          .pipe(scan((acc, cur) => [...acc, cur], [] as ArtistWithCover$[]))
      )
    );
  }

  trackBy = (index: number, artist: ArtistWithCover$) => artist.id;
}
