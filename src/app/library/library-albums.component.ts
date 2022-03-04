import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { Observable, of } from 'rxjs';
import { Album } from '@app/database/albums/album.model';
import { map, switchMap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectOption } from '@app/core/components/select.component';
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
          <div class="album">
            <app-album [album]="album" size="small"></app-album>
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
  implements OnInit, AfterContentInit, AfterViewInit
{
  albums$!: Observable<Album[]>;

  sortOptions: SelectOption[] = [
    { name: 'Latest update', value: 'updatedOn_desc' },
    { name: 'Latest releases', value: 'year_desc' },
    { name: 'Oldest releases', value: 'year_asc' },
    { name: 'A to Z', value: 'title_asc' },
    { name: 'Z to A', value: 'title_desc' },
  ];
  selectedSortOption: SelectOption = this.sortOptions[0];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private albums: AlbumFacade
  ) {}

  ngAfterViewInit(): void {
    // console.log(new Date().getTime());
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

    // console.log(new Date().getTime());

    const sort$ = this.route.queryParamMap.pipe(
      map((params) => ({
        index: params.get('sort') || 'updatedOn',
        direction: ((params.get('dir') || 'desc') === 'asc'
          ? 'next'
          : 'prev') as IDBCursorDirection,
        likes: params.get('likes') === '1',
      }))
    );

    this.albums$ = sort$.pipe(
      switchMap((sort) =>
        this.albums.getAll(sort.index as any).pipe(
          // filter((albums) => albums.length > 0),
          switchMap((albums) => {
            let albs;
            if (sort.likes) {
              albs = albums.filter((a) => !!a.likedOn);
            } else {
              albs = [...albums];
            }
            if (sort.direction === 'prev') {
              albs.reverse();
            }
            return of(albs);
            // return i === 0 && j === 0
            //   ? of(...albs).pipe(
            //       mergeMap((album, index) => of(album).pipe(delay(10 * index))),
            //       bufferWhen(() => scheduled(of(1), animationFrameScheduler)),
            //       scan((acc, curr) => [...acc, ...curr])
            //     )
            //   : of(albs);
          })
        )
      )
    );
  }

  trackBy = (index: number, album: Album): string => album.id;

  ngAfterContentInit(): void {
    // console.log(new Date().getTime());
  }

  // getHash(albumArtist: string): string {
  //   return hash(albumArtist);
  // }
  //
  // update(): void {
  //   this.cdr.markForCheck();
  // }
}
