import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { ArtistPageInfo } from '@app/pages/artist-page.component';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { LibraryFacade } from '@app/store/library/library.facade';
import {
  catchError,
  concatMap,
  map,
  mergeMap,
  reduce,
  take,
} from 'rxjs/operators';
import { getCover } from '@app/models/picture.model';
import { AlbumWithCover } from '@app/models/album.model';
import { Song } from '@app/models/song.model';

@Injectable({
  providedIn: 'root',
})
export class ArtistPageResolverService implements Resolve<ArtistPageInfo> {
  constructor(private library: LibraryFacade, private router: Router) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<ArtistPageInfo> | Observable<never> {
    const id = route.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/']);
      return EMPTY;
    }

    return this.library.getArtistById(id).pipe(
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
              reduce((acc, cur) => [...acc, cur], [] as AlbumWithCover[]),
              map((albums) =>
                albums.sort((a1, a2) => (a2.year || 0) - (a1.year || 0))
              )
            ),
            foundOn$: this.library.getAlbumsWithArtist(artist).pipe(
              reduce((acc, cur) => [...acc, cur], [] as AlbumWithCover[]),
              map((albums) =>
                albums.sort((a1, a2) => (a2.year || 0) - (a1.year || 0))
              )
            ),
            songs$: this.library.getArtistTitles(artist).pipe(
              take(5),
              mergeMap((song) =>
                this.library.getPicture(song.pictureKey).pipe(
                  map((picture) => ({
                    ...song,
                    cover: picture ? getCover(picture) : undefined,
                  }))
                )
              ),
              reduce((acc, cur) => [...acc, cur], [] as Song[])
            ),
          }))
        );
      })
    );
  }
}
