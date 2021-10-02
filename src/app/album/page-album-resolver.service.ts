import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { combineLatest, EMPTY, Observable, of, throwError } from 'rxjs';
import { LibraryFacade } from '@app/library/store/library.facade';
import { catchError, concatMap, first, map } from 'rxjs/operators';
import { getCover } from '@app/database/pictures/picture.model';
import { PageAlbumData } from '@app/album/page-album.component';

@Injectable()
export class PageAlbumResolverService implements Resolve<PageAlbumData> {
  constructor(private library: LibraryFacade, private router: Router) {}

  resolve(
    route: ActivatedRouteSnapshot
    // state: RouterStateSnapshot
  ): Observable<PageAlbumData> | Observable<never> {
    const id = route.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/']);
      return EMPTY;
    }

    return this.library.getAlbumByHash(id).pipe(
      concatMap((album) =>
        !album ? throwError(() => 'not found') : of(album)
      ),
      catchError(() => {
        this.router.navigate(['/library']);
        return EMPTY;
      }),
      concatMap((album) => {
        const songs$ = this.library.getAlbumTracks(album);
        const cover$ = this.library.getPicture(album.pictureKey).pipe(
          first(),
          map((picture) => (picture ? getCover(picture) : undefined))
        );
        return combineLatest([songs$, cover$]).pipe(
          map(([songs, cover]) => ({
            album,
            songs,
            cover,
          }))
        );
      })
    );
  }
}
