import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { PlayerData } from '@app/components/player.component';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { LibraryFacade } from '@app/store/library/library.facade';
import { catchError, concatMap, map } from 'rxjs/operators';
import { reduceArray } from '@app/utils/reduce-array.util';

@Injectable({
  providedIn: 'root',
})
export class PlayerResolverService implements Resolve<PlayerData> {
  constructor(private router: Router, private library: LibraryFacade) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<PlayerData> {
    const typ = route.paramMap.get('type');
    const id = route.paramMap.get('id');

    if (!typ || !id) {
      this.router.navigate(['/', 'library']);
      return EMPTY;
    }

    switch (typ) {
      case 'album':
        return this.library.getAlbumByHash(id).pipe(
          concatMap((album) =>
            album ? of(album) : throwError('album not found')
          ),
          catchError(() => {
            this.router.navigate(['/home']);
            return EMPTY;
          }),
          concatMap((album) => this.library.getAlbumTitles(album)),
          reduceArray(),
          map((playlist) => ({
            playlist,
            currentIndex: 0,
          }))
        );
      default:
        this.router.navigate(['/', 'library']);
        return EMPTY;
    }
  }
}
