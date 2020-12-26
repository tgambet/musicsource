import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { combineLatest, EMPTY, Observable, of, throwError } from 'rxjs';
import { LibraryFacade } from '@app/store/library/library.facade';
import { catchError, concatMap, map, reduce } from 'rxjs/operators';
import { Song } from '@app/models/song.model';
import { getCover } from '@app/models/picture.model';
import { AlbumPageInfo } from '@app/pages/album-page.component';

@Injectable({
  providedIn: 'root',
})
export class AlbumPageResolverService implements Resolve<AlbumPageInfo> {
  constructor(private library: LibraryFacade, private router: Router) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<AlbumPageInfo> | Observable<never> {
    const id = route.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/']);
      return EMPTY;
    }

    return this.library.getAlbum(id).pipe(
      concatMap((album) => (!album ? throwError('not found') : of(album))),
      catchError(() => {
        this.router.navigate(['/home']);
        return EMPTY;
      }),
      concatMap((album) => {
        const songs$ = this.library
          .getAlbumTitles(album)
          .pipe(reduce((acc, cur) => [...acc, cur], [] as Song[]));
        const cover$ = this.library
          .getPicture(album.pictureKey)
          .pipe(map((picture) => (picture ? getCover(picture) : undefined)));
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
