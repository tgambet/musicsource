import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { catchError, concatMap, first } from 'rxjs/operators';
import { DatabaseService } from '@app/database/database.service';
import { Playlist, PlaylistId } from '@app/database/playlists/playlist.model';
import { PlaylistFacade } from '@app/database/playlists/playlist.facade';

@Injectable()
export class PagePlaylistResolver implements Resolve<PlaylistId> {
  constructor(
    private router: Router,
    private storage: DatabaseService,
    private playlists: PlaylistFacade
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<PlaylistId> {
    const id = route.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/']);
      return EMPTY;
    }

    return this.playlists.getByKey(id as PlaylistId).pipe(
      first(),
      concatMap((stored) =>
        stored ? of(stored) : this.storage.get$<Playlist>('playlists', id)
      ),
      concatMap((model) =>
        model ? of(model.id) : throwError(() => 'not found')
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
