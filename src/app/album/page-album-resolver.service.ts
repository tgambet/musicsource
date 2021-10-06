import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { LibraryFacade } from '@app/library/store/library.facade';
import { catchError, concatMap, first } from 'rxjs/operators';
import { PageAlbumData } from '@app/album/page-album.component';
import { PictureFacade } from '@app/database/pictures/picture.facade';
import { AlbumFacade } from '@app/database/albums/album.facade';
import { Album } from '@app/database/albums/album.model';
import { DatabaseService } from '@app/database/database.service';

@Injectable()
export class PageAlbumResolverService implements Resolve<PageAlbumData> {
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
  ): Observable<PageAlbumData> | Observable<never> {
    const id = route.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/']);
      return EMPTY;
    }

    return this.albums.getByKey(id).pipe(
      first(),
      concatMap((playlist) =>
        playlist ? of(playlist) : this.storage.get$<Album>('albums', id)
      ),
      concatMap((p) => (p ? of({ album: p }) : throwError(() => 'not found'))),
      catchError(() => {
        this.router.navigate(['/library/playlists']);
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
