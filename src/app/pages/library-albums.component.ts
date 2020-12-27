import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { LibraryFacade } from '@app/store/library/library.facade';
import { Observable } from 'rxjs';
import { AlbumWithCover } from '@app/models/album.model';
import { map, scan, switchMap, take, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectOption } from '@app/components/select.component';

@Component({
  selector: 'app-library-albums',
  template: `
    <div class="filters" #filters [class.scrolled-top]="scrolledTop">
      <app-container>
        <app-select
          [options]="sortOptions"
          [selected]="selectedSortOption"
          (selectionChange)="sort($event)"
        ></app-select>
      </app-container>
    </div>
    <app-container>
      <div class="albums">
        <div
          class="album"
          *ngFor="let album of albums$ | async; trackBy: trackBy"
        >
          <app-album
            [name]="album.name"
            [cover]="album.cover"
            [artist]="album.artist"
            [year]="album.year"
            [artistRouterLink]="['/', 'artist', album.artistId]"
            [albumRouterLink]="['/', 'album', album.id]"
            size="small"
          ></app-album>
        </div>
      </div>
    </app-container>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .albums {
        display: flex;
        flex-wrap: wrap;
        margin: 0 -12px;
        padding: 0 0 64px;
      }
      .album {
        margin: 0 12px 32px;
      }
      app-album {
        width: 160px;
      }
      .filters {
        position: sticky;
        top: 112px;
        z-index: 101;
        display: flex;
        align-items: center;
        padding: 16px 0;
      }
      .filters.scrolled-top {
        background-color: #212121;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryAlbumsComponent implements OnInit {
  @ViewChild('filters', { static: true })
  filters!: ElementRef;

  albums$!: Observable<AlbumWithCover[]>;

  sortOptions: SelectOption[] = [
    { name: 'Latest releases', value: 'year_desc' },
    { name: 'Oldest releases', value: 'year_asc' },
    { name: 'A to Z', value: 'name_asc' },
    { name: 'Z to A', value: 'name_desc' },
  ];
  selectedSortOption = this.sortOptions[0];

  scrolledTop = false;

  constructor(
    private library: LibraryFacade,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  @HostListener('window:scroll')
  update() {
    this.scrolledTop =
      this.filters.nativeElement.getBoundingClientRect().y <= 112;
  }

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        take(1),
        tap(
          (params) =>
            (this.selectedSortOption =
              this.sortOptions.find(
                (o) => o.value === `${params.get('sort')}_${params.get('dir')}`
              ) || this.sortOptions[0])
        )
      )
      .subscribe();

    const sort$ = this.route.queryParamMap.pipe(
      map((params) => ({
        index: params.get('sort') || 'year',
        direction: ((params.get('dir') || 'desc') === 'asc'
          ? 'next'
          : 'prev') as IDBCursorDirection,
      }))
    );

    this.albums$ = sort$.pipe(
      switchMap((sort) =>
        this.library
          .getAlbums(sort.index, null, sort.direction)
          .pipe(scan((acc, cur) => [...acc, cur], [] as AlbumWithCover[]))
      )
    );
  }

  trackBy = (index: number, album: AlbumWithCover) => album.id;

  async sort(option: string) {
    const [sort, dir] = option.split('_');
    await this.router.navigate([], {
      queryParams: { sort, dir },
    });
  }
}
