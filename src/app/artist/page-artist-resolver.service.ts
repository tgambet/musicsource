import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { catchError, concatMap, first } from 'rxjs/operators';
import { PictureFacade } from '@app/database/pictures/picture.facade';
import { ArtistFacade } from '@app/database/artists/artist.facade';
import { AlbumFacade } from '@app/database/albums/album.facade';
import { DatabaseService } from '@app/database/database.service';
import { Artist, ArtistId } from '@app/database/artists/artist.model';

@Injectable()
export class PageArtistResolverService implements Resolve<ArtistId> {
  constructor(
    private storage: DatabaseService,
    private pictures: PictureFacade,
    private artists: ArtistFacade,
    private albums: AlbumFacade,
    private router: Router
  ) {}

  resolve(
    route: ActivatedRouteSnapshot
    // state: RouterStateSnapshot
  ): Observable<ArtistId> | Observable<never> {
    const id = route.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/']);
      return EMPTY;
    }

    return this.artists.getByKey(id as ArtistId).pipe(
      first(),
      concatMap((stored) =>
        stored ? of(stored) : this.storage.get$<Artist>('artists', id)
      ),
      concatMap((model) =>
        model ? of(model.id) : throwError(() => 'not found')
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
