import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { LibraryFacade } from '@app/library/store/library.facade';
import { catchError, concatMap } from 'rxjs/operators';
import { PictureFacade } from '@app/database/pictures/picture.facade';
import { AlbumFacade } from '@app/database/albums/album.facade';
import { Album } from '@app/database/albums/album.model';
import { DatabaseService } from '@app/database/database.service';

@Injectable()
export class PageAlbumResolverService implements Resolve<string> {
  constructor(
    private library: LibraryFacade,
    private pictures: PictureFacade,
    private storage: DatabaseService,
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

    return this.storage.get$<Album>('albums', id).pipe(
      concatMap((model) =>
        model ? of(model.hash as string) : throwError(() => 'not found')
      ),
      catchError(() => {
        this.router.navigate(['/library/albums']);
        return EMPTY;
      })
    );

    // return this.albums.getByKey(id).pipe(
    //   first(),
    //   concatMap((album) =>
    //     !album ? throwError(() => 'not found') : of(album)
    //   ),
    //   catchError(() => {
    //     this.router.navigate(['/library']);
    //     return EMPTY;
    //   }),
    //   concatMap((album) => {
    //     const songs$ = this.library.getAlbumTracks(album);
    //     // const cover$ = this.pictures.getCover(album.pictureKey).pipe(first());
    //     return combineLatest([songs$]).pipe(
    //       map(([songs]) => ({
    //         album,
    //         songs,
    //         //cover,
    //       }))
    //     );
    //   })
    // );
  }
}
