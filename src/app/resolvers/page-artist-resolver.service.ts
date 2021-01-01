import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { PageArtistData } from '@app/pages/page-artist.component';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { LibraryFacade } from '@app/store/library/library.facade';
import { catchError, concatMap, map, scan, take } from 'rxjs/operators';
import { getCover } from '@app/models/picture.model';
import { AlbumWithCover$ } from '@app/models/album.model';
import { SongWithCover$ } from '@app/models/song.model';

@Injectable({
  providedIn: 'root',
})
export class PageArtistResolverService implements Resolve<PageArtistData> {
  constructor(private library: LibraryFacade, private router: Router) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<PageArtistData> | Observable<never> {
    const id = route.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/']);
      return EMPTY;
    }

    return this.library.getArtistByHash(id).pipe(
      concatMap((artist) => (!artist ? throwError('not found') : of(artist))),
      catchError(() => {
        this.router.navigate(['/home']);
        return EMPTY;
      }),
      concatMap((artist) => {
        const cover$ = this.library
          .getPicture(artist.pictureKey)
          .pipe(map((picture) => (picture ? getCover(picture) : undefined)));
        return cover$.pipe(
          map((cover) => ({
            artist,
            cover,
            albums$: this.library.getArtistAlbums(artist).pipe(
              scan((acc, cur) => [...acc, cur], [] as AlbumWithCover$[]),
              map((albums) =>
                [...albums].sort((a1, a2) => (a2.year || 0) - (a1.year || 0))
              )
            ),
            foundOn$: this.library.getAlbumsWithArtist(artist).pipe(
              scan((acc, cur) => [...acc, cur], [] as AlbumWithCover$[]),
              map((albums) =>
                [...albums].sort((a1, a2) => (a2.year || 0) - (a1.year || 0))
              )
            ),
            songs$: this.library.getSongs('artists', artist.name).pipe(
              map(({ value }) => value),
              take(5),
              scan((acc, cur) => [...acc, cur], [] as SongWithCover$[])
            ),
          }))
        );
      })
    );
  }
}
