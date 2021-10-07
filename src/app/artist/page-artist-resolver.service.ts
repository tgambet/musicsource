import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { LibraryFacade } from '@app/library/store/library.facade';
import { catchError, concatMap } from 'rxjs/operators';
import { PictureFacade } from '@app/database/pictures/picture.facade';
import { ArtistFacade } from '@app/database/artists/artist.facade';
import { AlbumFacade } from '@app/database/albums/album.facade';
import { DatabaseService } from '@app/database/database.service';
import { Artist } from '@app/database/artists/artist.model';

@Injectable()
export class PageArtistResolverService implements Resolve<string> {
  constructor(
    private storage: DatabaseService,
    private library: LibraryFacade,
    private pictures: PictureFacade,
    private artists: ArtistFacade,
    private albums: AlbumFacade,
    private router: Router
  ) {}

  resolve(
    route: ActivatedRouteSnapshot
    // state: RouterStateSnapshot
  ): Observable<string> | Observable<never> {
    const id = route.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/']);
      return EMPTY;
    }

    return this.storage.get$<Artist>('artists', id).pipe(
      concatMap(
        (model) =>
          model ? of(model.hash as string) : throwError(() => 'not found') // TODO
      ),
      catchError(() => {
        this.router.navigate(['/library/artists']);
        return EMPTY;
      })
    );

    //   concatMap((artist) =>
    //     !artist ? throwError(() => 'not found') : of(artist)
    //   ),
    //   catchError(() => {
    //     this.router.navigate(['/library']);
    //     return EMPTY;
    //   }),
    //   concatMap((artist) => {
    //     const cover$ = this.pictures.getCover(artist.pictureKey);
    //     return cover$.pipe(
    //       first(),
    //       map((cover) => ({
    //         artist,
    //         cover,
    //         // albums$: this.library.getArtistAlbums(artist).pipe(
    //         //   scanArray(),
    //         //   map((albums) =>
    //         //     [...albums].sort((a1, a2) => (a2.year || 0) - (a1.year || 0))
    //         //   )
    //         // ),
    //         foundOn$: this.albums
    //           .getWithArtist(artist.name)
    //           .pipe(
    //             map(
    //               (albums) =>
    //                 albums &&
    //                 [...albums].sort(
    //                   (a1, a2) => (a2.year || 0) - (a1.year || 0)
    //                 )
    //             )
    //           ),
    //         songs$: this.library.getSongs('artists', artist.name).pipe(
    //           map(({ value }) => value),
    //           take(5),
    //           scanArray()
    //         ),
    //       }))
    //     );
    //   })
    // );
  }
}
