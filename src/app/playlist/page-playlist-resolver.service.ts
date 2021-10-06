import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { PagePlaylistData } from '@app/playlist/page-playlist.component';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { catchError, concatMap, first } from 'rxjs/operators';
import { PlaylistFacade } from '@app/database/playlists/playlist.facade';
import { DatabaseService } from '@app/database/database.service';
import { Playlist } from '@app/database/playlists/playlist.model';

@Injectable()
export class PagePlaylistResolver implements Resolve<PagePlaylistData> {
  constructor(
    private router: Router,
    private storage: DatabaseService,
    private playlists: PlaylistFacade
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<PagePlaylistData> {
    const id = route.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/']);
      return EMPTY;
    }

    return this.playlists.getByKey(id).pipe(
      first(),
      concatMap((playlist) =>
        playlist ? of(playlist) : this.storage.get$<Playlist>('playlists', id)
      ),
      concatMap((p) =>
        p ? of({ playlist: p }) : throwError(() => 'not found')
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
