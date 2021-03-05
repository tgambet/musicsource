import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { PagePlaylistData } from '@app/pages/page-playlist.component';
import { LibraryFacade } from '@app/store/library/library.facade';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { catchError, concatMap, map, startWith } from 'rxjs/operators';
import { getCover } from '@app/models/picture.model';
import { scanArray } from '@app/utils/scan-array.util';

@Injectable({
  providedIn: 'root',
})
export class PagePlaylistResolver implements Resolve<PagePlaylistData> {
  constructor(private library: LibraryFacade, private router: Router) {}

  resolve(
    route: ActivatedRouteSnapshot
    // state: RouterStateSnapshot
  ): Observable<PagePlaylistData> {
    const id = route.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/']);
      return EMPTY;
    }

    return this.library.getPlaylistByHash(id).pipe(
      concatMap((playlist) =>
        !playlist ? throwError('not found') : of(playlist)
      ),
      catchError(() => {
        this.router.navigate(['/library']);
        return EMPTY;
      }),
      concatMap((playlist) => {
        const cover$ = this.library
          .getPicture(playlist.pictureKey)
          .pipe(map((picture) => (picture ? getCover(picture) : undefined)));

        const songs$ = this.library
          .getPlaylistSongs(playlist)
          .pipe(scanArray(), startWith([]));

        return cover$.pipe(
          map((cover) => ({
            playlist,
            cover,
            songs$,
          }))
        );
      })
    );
  }
}
