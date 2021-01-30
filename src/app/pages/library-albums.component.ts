import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import { LibraryFacade } from '@app/store/library/library.facade';
import { Observable } from 'rxjs';
import { Album, AlbumWithCover$ } from '@app/models/album.model';
import { map, switchMap, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectOption } from '@app/components/select.component';
import { hash } from '@app/utils/hash.util';
import { scanArray } from '@app/utils/scan-array.util';
import { WithTrigger } from '@app/classes/with-trigger';

@Component({
  selector: 'app-library-albums',
  template: `
    <app-library-content
      [selectedSortOption]="selectedSortOption"
      [sortOptions]="sortOptions"
    >
      <div class="albums">
        <ng-container *ngFor="let album of albums$ | async; trackBy: trackBy">
          <div class="album" *ngIf="!likes || !!album.likedOn">
            <app-album
              [album]="album"
              size="small"
              (menuOpened)="menuOpened($event)"
              (update)="update()"
            ></app-album>
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryAlbumsComponent extends WithTrigger implements OnInit {
  albums$!: Observable<AlbumWithCover$[]>;

  sortOptions: SelectOption[] = [
    { name: 'Recently added', value: 'lastModified_desc' },
    { name: 'Latest releases', value: 'year_desc' },
    { name: 'Oldest releases', value: 'year_asc' },
    { name: 'A to Z', value: 'name_asc' },
    { name: 'Z to A', value: 'name_desc' },
  ];
  selectedSortOption: SelectOption = this.sortOptions[0];

  likes?: boolean;

  constructor(
    private library: LibraryFacade,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  @HostListener('window:scroll')
  @HostListener('click')
  closeMenu() {
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

    this.albums$ = sort$.pipe(
      switchMap((sort) => {
        const predicate = sort.likes
          ? (album: Album) => !!album.likedOn
          : undefined;

        return this.library
          .getAlbums(sort.index, null, sort.direction, predicate)
          .pipe(scanArray());
      })
    );
  }

  trackBy = (index: number, album: AlbumWithCover$) => album.name;

  getHash(albumArtist: string) {
    return hash(albumArtist);
  }

  update() {
    this.cdr.markForCheck();
  }
}
