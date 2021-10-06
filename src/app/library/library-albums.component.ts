import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import { LibraryFacade } from '@app/library/store/library.facade';
import {
  animationFrameScheduler,
  bufferWhen,
  EMPTY,
  mergeMap,
  Observable,
  of,
  scan,
  scheduled,
} from 'rxjs';
import { Album } from '@app/database/albums/album.model';
import { delay, map, switchMap, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectOption } from '@app/core/components/select.component';
import { WithTrigger } from '@app/core/classes/with-trigger';
import { AlbumFacade } from '@app/database/albums/album.facade';

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
export class LibraryAlbumsComponent
  extends WithTrigger
  implements OnInit, AfterContentInit
{
  albums$!: Observable<Album[]>;

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
    private cdr: ChangeDetectorRef,
    private albums: AlbumFacade
  ) {
    super();
  }

  @HostListener('window:scroll')
  @HostListener('click')
  closeMenu(): void {
    super.closeMenu();
  }

  ngOnInit(): void {
    // this.albums$ = sort$.pipe(
    //   switchMap((sort) => {
    //     const predicate = sort.likes
    //       ? (album: Album) => !!album.likedOn
    //       : undefined;
    //
    //     return this.library
    //       .getAlbums(sort.index, null, sort.direction, predicate)
    //       .pipe(scanArray());
    //   })
    // );
    this.albums$ = EMPTY;
  }

  trackBy = (index: number, album: Album): string => album.hash;

  ngAfterContentInit(): void {
    const sort$ = this.route.queryParamMap.pipe(
      map((params) => ({
        index: params.get('sort') || 'year',
        direction: ((params.get('dir') || 'desc') === 'asc'
          ? 'next'
          : 'prev') as IDBCursorDirection,
        likes: params.get('likes') === '1',
      })),
      tap((sort) => (this.likes = sort.likes))
    );

    this.albums$ = sort$.pipe(
      switchMap((sort, i) =>
        this.albums.getAll(sort.index as any).pipe(
          // filter((albums) => albums.length > 0),
          switchMap((albums, j) => {
            let albs;
            if (sort.likes) {
              albs = albums.filter((a) => !!a.likedOn);
            } else {
              albs = [...albums];
            }
            if (sort.direction === 'prev') {
              albs.reverse();
            }
            return i === 0 && j === 0
              ? of(...albs).pipe(
                  mergeMap((album, index) => of(album).pipe(delay(10 * index))),
                  bufferWhen(() => scheduled(of(1), animationFrameScheduler)),
                  scan((acc, curr) => [...acc, ...curr])
                )
              : of(albs);
          })
        )
      )
    );
  }

  // getHash(albumArtist: string): string {
  //   return hash(albumArtist);
  // }
  //
  // update(): void {
  //   this.cdr.markForCheck();
  // }
}
