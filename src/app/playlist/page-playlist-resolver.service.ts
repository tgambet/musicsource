import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { catchError, concatMap } from 'rxjs/operators';
import { DatabaseService } from '@app/database/database.service';
import { Playlist } from '@app/database/playlists/playlist.model';

@Injectable()
export class PagePlaylistResolver implements Resolve<string> {
  constructor(private router: Router, private storage: DatabaseService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<string> {
    const id = route.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/']);
      return EMPTY;
    }

    return this.storage.get$<Playlist>('playlists', id).pipe(
      concatMap(
        (model) =>
          model ? of(model.hash as string) : throwError(() => 'not found') // TODO
      ),
      catchError(() => {
        this.router.navigate(['/library/playlists']);
        return EMPTY;
      })
    );

    // return this.library.getPlaylistByHash(id).pipe(
    //   concatMap((playlist) =>
    //     !playlist ? throwError(() => 'not found') : of(playlist)
    //   ),
    //   catchError(() => {
    //     this.router.navigate(['/library']);
    //     return EMPTY;
    //   }),
    //   concatMap((playlist) => {
    //     const cover$ = this.library
    //       .getPicture(playlist.pictureKey)
    //       .pipe(map((picture) => (picture ? getCover(picture) : undefined)));
    //
    //     const songs$ = this.library
    //       .getPlaylistSongs(playlist)
    //       .pipe(scanArray(), startWith([]));
    //
    //     return cover$.pipe(
    //       map((cover) => ({
    //         playlist,
    //         cover,
    //         songs$,
    //       }))
    //     );
    //   })
    // );
  }
}
